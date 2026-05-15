console.log('WebRTC Stats Extension: Content Script loaded');

// Inject the `injected/index.ts` script into the main page context
// This allows the injected script to access the actual window object (and thus window.RTCPeerConnection)
const script = document.createElement('script');
// In Vite/crxjs, web_accessible_resources are resolved correctly, but doing it dynamically here:
script.src = chrome.runtime.getURL('src/injected/index.ts');
script.type = 'module';

script.onload = () => {
  script.remove();
};

// Insert before any other scripts to ensure we hook early
(document.head || document.documentElement).prepend(script);

// Set up a listener for messages from the injected script
window.addEventListener('message', (event) => {
  if (event.source !== window || !event.data || event.data.source !== 'webrtc-stats-injected') {
    return;
  }
  // Forward to background/popup
  chrome.runtime.sendMessage(event.data);
});
