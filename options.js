// options.js
document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Load saved API key when options page loads
  chrome.storage.sync.get('apiKey', (data) => {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
  });

  // Save API key
  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({ apiKey: apiKey }, () => {
        statusDiv.textContent = 'API Key saved!';
        statusDiv.style.color = 'green';
        setTimeout(() => {
          statusDiv.textContent = '';
        }, 3000);
      });
    } else {
      statusDiv.textContent = 'Please enter an API key.';
      statusDiv.style.color = 'red';
    }
  });
});
