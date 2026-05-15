document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyze-btn');

  analyzeBtn?.addEventListener('click', () => {
    console.log('Analyze Network clicked');
    
    // Example: request stats from content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'request-stats' }, (response) => {
          console.log('Stats response:', response);
          if (chrome.runtime.lastError) {
             console.warn('Could not establish connection. Error:', chrome.runtime.lastError.message);
          }
        });
      }
    });
  });
});
