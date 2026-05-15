document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    statsContainer: document.getElementById('stats-container'),
    noDataMsg: document.getElementById('no-data-msg'),
    healthDot: document.getElementById('health-dot'),
    insightBox: document.getElementById('insight-box'),
    vidBitrate: document.getElementById('vid-bitrate'),
    vidFps: document.getElementById('vid-fps'),
    vidRes: document.getElementById('vid-res'),
    netLoss: document.getElementById('net-loss'),
    netRtt: document.getElementById('net-rtt'),
    netJitter: document.getElementById('net-jitter'),
    connState: document.getElementById('conn-state'),
    connType: document.getElementById('conn-type'),
  };

  function updateView(stats: any) {
    if (!stats) {
      if (elements.statsContainer) elements.statsContainer.style.display = 'none';
      if (elements.noDataMsg) elements.noDataMsg.style.display = 'block';
      if (elements.healthDot) elements.healthDot.className = 'health-dot';
      return;
    }

    if (elements.statsContainer) elements.statsContainer.style.display = 'block';
    if (elements.noDataMsg) elements.noDataMsg.style.display = 'none';

    if (elements.vidBitrate) elements.vidBitrate.textContent = `${(stats.video.bitrate / 1000).toFixed(1)} kbps`;
    if (elements.vidFps) elements.vidFps.textContent = `${stats.video.fps}`;
    if (elements.vidRes) elements.vidRes.textContent = stats.video.resolution || '-';

    if (elements.netLoss) elements.netLoss.textContent = `${stats.network.packetLoss}%`;
    if (elements.netRtt) elements.netRtt.textContent = `${stats.network.rtt} ms`;
    if (elements.netJitter) elements.netJitter.textContent = `${stats.network.jitter} ms`;

    if (elements.connState) elements.connState.textContent = stats.connection.state;
    if (elements.connType) elements.connType.textContent = stats.connection.iceType || '-';

    // Health calculation
    let health = 'good';
    let insight = 'Connection is stable.';
    let insightClass = '';

    const loss = stats.network.packetLoss || 0;
    const rtt = stats.network.rtt || 0;
    const bitrate = stats.video.bitrate || 0;

    if (loss > 5 || rtt > 300) {
      health = 'poor';
      insightClass = 'critical';
      if (loss > 5) insight = 'High packet loss detected → possible network congestion.';
      else insight = 'High latency (RTT) → connection may feel unresponsive.';
    } else if (loss > 1 || rtt > 100) {
      health = 'moderate';
      insightClass = 'warning';
      if (loss > 1) insight = 'Moderate packet loss → video may stutter.';
      else insight = 'Elevated latency → minor delays expected.';
    } else if (stats.connection.iceType && stats.connection.iceType.includes('relay')) {
      insightClass = 'warning';
      insight = 'Using TURN relay → increased latency expected.';
    } else if (bitrate > 0 && bitrate < 100000 && stats.video.fps > 0) {
      insightClass = 'warning';
      insight = 'Low bitrate → possible bandwidth constraint.';
    }

    if (elements.healthDot) {
      elements.healthDot.className = `health-dot ${health}`;
    }
    if (elements.insightBox) {
      elements.insightBox.textContent = insight;
      elements.insightBox.className = insightClass;
    }
  }

  // Initial load
  chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
    updateView(response);
  });

  // Listen for broadcast updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'WEBRTC_STATS_BROADCAST') {
      // Check if the update is for the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id === message.tabId) {
          updateView(message.data);
        }
      });
    }
  });
});
