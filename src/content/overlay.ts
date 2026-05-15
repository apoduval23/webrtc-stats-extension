import cssText from './overlay.css?inline';

let shadowRoot: ShadowRoot | null = null;
let overlayEl: HTMLElement | null = null;

// DOM Elements
const elements = {
  healthDot: null as HTMLElement | null,
  insightBox: null as HTMLElement | null,
  videoBitrate: null as HTMLElement | null,
  videoFps: null as HTMLElement | null,
  videoRes: null as HTMLElement | null,
  netLoss: null as HTMLElement | null,
  netRtt: null as HTMLElement | null,
  netJitter: null as HTMLElement | null,
  connType: null as HTMLElement | null,
  connState: null as HTMLElement | null,
  canvas: null as HTMLCanvasElement | null
};

// Graph data
const historyLength = 60; // 60 seconds
const rttHistory: number[] = Array(historyLength).fill(0);
const bitrateHistory: number[] = Array(historyLength).fill(0);
let ctx: CanvasRenderingContext2D | null = null;

export function initOverlay() {
  if (document.getElementById('webrtc-stats-host')) return;

  const host = document.createElement('div');
  host.id = 'webrtc-stats-host';
  
  if (document.body) {
    document.body.appendChild(host);
  } else {
    document.documentElement.appendChild(host);
  }

  shadowRoot = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = cssText;
  shadowRoot.appendChild(style);

  overlayEl = document.createElement('div');
  overlayEl.id = 'webrtc-overlay-card';
  overlayEl.innerHTML = `
    <div class="overlay-header" id="drag-handle">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div id="health-dot" class="health-dot good"></div>
        <div class="overlay-title">WebRTC Stats</div>
      </div>
      <button id="close-btn" class="close-btn">×</button>
    </div>
    <div class="section">
      <div class="section-title">Video</div>
      <div class="stat-grid">
        <div class="stat-item"><span class="stat-label">Bitrate</span><span class="stat-value" id="video-bitrate">-</span></div>
        <div class="stat-item"><span class="stat-label">FPS</span><span class="stat-value" id="video-fps">-</span></div>
        <div class="stat-item" style="grid-column: span 2;"><span class="stat-label">Resolution</span><span class="stat-value" id="video-res">-</span></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Network</div>
      <div class="stat-grid">
        <div class="stat-item"><span class="stat-label">Loss</span><span class="stat-value" id="net-loss">-</span></div>
        <div class="stat-item"><span class="stat-label">RTT</span><span class="stat-value" id="net-rtt">-</span></div>
        <div class="stat-item" style="grid-column: span 2;"><span class="stat-label">Jitter</span><span class="stat-value" id="net-jitter">-</span></div>
      </div>
    </div>
    <div class="section" style="border-bottom: none;">
      <div class="section-title">Connection</div>
      <div class="stat-grid">
        <div class="stat-item"><span class="stat-label">State</span><span class="stat-value" id="conn-state">-</span></div>
        <div class="stat-item"><span class="stat-label">ICE Type</span><span class="stat-value" id="conn-type">-</span></div>
      </div>
    </div>
    
    <div class="graph-container">
      <div class="graph-legend">
        <span class="legend-item"><span class="legend-color" style="background: #3b82f6;"></span>Bitrate</span>
        <span class="legend-item"><span class="legend-color" style="background: #ef4444;"></span>RTT</span>
      </div>
      <canvas id="stats-graph" width="280" height="60"></canvas>
    </div>

    <div class="insight-box" id="insight-box">
      Waiting for connection...
    </div>
  `;

  shadowRoot.appendChild(overlayEl);

  const dragHandle = shadowRoot.getElementById('drag-handle');
  if (dragHandle) makeDraggable(dragHandle, overlayEl);

  const closeBtn = shadowRoot.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toggleOverlay(false);
    });
  }

  // Map elements
  elements.healthDot = shadowRoot.getElementById('health-dot');
  elements.insightBox = shadowRoot.getElementById('insight-box');
  elements.videoBitrate = shadowRoot.getElementById('video-bitrate');
  elements.videoFps = shadowRoot.getElementById('video-fps');
  elements.videoRes = shadowRoot.getElementById('video-res');
  elements.netLoss = shadowRoot.getElementById('net-loss');
  elements.netRtt = shadowRoot.getElementById('net-rtt');
  elements.netJitter = shadowRoot.getElementById('net-jitter');
  elements.connType = shadowRoot.getElementById('conn-type');
  elements.connState = shadowRoot.getElementById('conn-state');
  elements.canvas = shadowRoot.getElementById('stats-graph') as HTMLCanvasElement;

  if (elements.canvas) {
    // Setup canvas
    const rect = elements.canvas.parentElement!.getBoundingClientRect();
    // Use fallback width/height if not visible yet
    elements.canvas.width = rect.width || 320;
    elements.canvas.height = rect.height || 80;
    ctx = elements.canvas.getContext('2d');
  }
}

export function updateOverlay(stats: any) {
  if (!stats || !overlayEl) return;

  // Update DOM
  if (elements.videoBitrate) elements.videoBitrate.textContent = `${(stats.video.bitrate / 1000).toFixed(1)} kbps`;
  if (elements.videoFps) elements.videoFps.textContent = `${stats.video.fps}`;
  if (elements.videoRes) elements.videoRes.textContent = stats.video.resolution || '-';

  if (elements.netLoss) elements.netLoss.textContent = `${stats.network.packetLoss}%`;
  if (elements.netRtt) elements.netRtt.textContent = `${stats.network.rtt} ms`;
  if (elements.netJitter) elements.netJitter.textContent = `${stats.network.jitter} ms`;

  if (elements.connState) elements.connState.textContent = stats.connection.state;
  if (elements.connType) elements.connType.textContent = stats.connection.iceType || '-';

  // Health calculation from Background
  if (stats.health) {
    if (elements.healthDot) {
      elements.healthDot.className = `health-dot ${stats.health.status}`;
    }
    if (elements.insightBox) {
      elements.insightBox.textContent = stats.health.insight;
      elements.insightBox.className = stats.health.insightClass;
    }
  }

  // Extract variables for graph
  const rtt = stats.network.rtt || 0;
  const bitrate = stats.video.bitrate || 0;

  // Update Graph Data
  rttHistory.push(rtt);
  rttHistory.shift();
  bitrateHistory.push(bitrate / 1000); // kbps
  bitrateHistory.shift();

  drawGraph();
}

function drawGraph() {
  if (!ctx || !elements.canvas) return;
  const width = elements.canvas.width;
  const height = elements.canvas.height;

  ctx.clearRect(0, 0, width, height);

  const maxRtt = Math.max(300, ...rttHistory);
  const maxBitrate = Math.max(1000, ...bitrateHistory);

  const stepX = width / (historyLength - 1);

  // Draw Bitrate (blue)
  ctx.beginPath();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  for (let i = 0; i < historyLength; i++) {
    const x = i * stepX;
    const y = height - (bitrateHistory[i] / maxBitrate) * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw RTT (red)
  ctx.beginPath();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  for (let i = 0; i < historyLength; i++) {
    const x = i * stepX;
    const y = height - (rttHistory[i] / maxRtt) * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function makeDraggable(dragHandle: HTMLElement, el: HTMLElement) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  dragHandle.onmousedown = dragMouseDown;

  function dragMouseDown(e: MouseEvent) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: MouseEvent) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    el.style.position = 'fixed';
    el.style.top = (el.offsetTop - pos2) + "px";
    el.style.left = (el.offsetLeft - pos1) + "px";
    el.style.right = 'auto'; // Disable right anchoring
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

export function toggleOverlay(show?: boolean) {
  const host = document.getElementById('webrtc-stats-host');
  if (!host) return;
  
  if (show === undefined) {
    host.style.display = host.style.display === 'none' ? 'block' : 'none';
  } else {
    host.style.display = show ? 'block' : 'none';
  }
}
