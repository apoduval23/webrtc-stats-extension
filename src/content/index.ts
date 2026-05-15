import { initOverlay, updateOverlay, toggleOverlay } from './overlay';

console.log('WebRTC Stats Extension: Content Script loaded');

// Initialize Overlay
initOverlay();

// Set up a listener for messages from the injected script
window.addEventListener('message', (event) => {
  if (event.source !== window || !event.data || event.data.source !== 'webrtc-stats-injected') {
    return;
  }
  // Forward to background/popup
  chrome.runtime.sendMessage(event.data);
});

// Listen for updates from background
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'WEBRTC_STATS_BROADCAST') {
    updateOverlay(message.data);
  } else if (message.type === 'TOGGLE_OVERLAY') {
    toggleOverlay();
  }
  sendResponse({ status: 'ok' });
});
