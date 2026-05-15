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

  // Toggle Overlay Button Logic
  const toggleBtn = document.getElementById('toggle-overlay-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_OVERLAY' }).catch(() => {});
        }
      });
    });
  }
});
