console.log('WebRTC Stats Extension: Background Service Worker loaded');

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Received message in background:', message);
  // Handle messages from content script or popup
  sendResponse({ status: 'ok' });
});
