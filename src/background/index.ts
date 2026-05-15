console.log('WebRTC Stats Extension: Background Service Worker loaded');

const tabStats = new Map<number, any>();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'WEBRTC_STATS_UPDATE' && sender.tab?.id) {
    const tabId = sender.tab.id;
    tabStats.set(tabId, message.data);

    chrome.tabs.sendMessage(tabId, {
      type: 'WEBRTC_STATS_BROADCAST',
      data: message.data
    }).catch(() => {});

    chrome.runtime.sendMessage({
      type: 'WEBRTC_STATS_BROADCAST',
      tabId: tabId,
      data: message.data
    }).catch(() => {});

    sendResponse({ status: 'ok' });
  } else if (message.type === 'GET_STATS') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        sendResponse(tabStats.get(activeTab.id) || null);
      } else {
        sendResponse(null);
      }
    });
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabStats.delete(tabId);
});
