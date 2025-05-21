// Simple debug script
document.addEventListener('DOMContentLoaded', function() {
  console.log('Debug page loaded');
  
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');
  
  // Load saved API key
  chrome.storage.sync.get('apiKey', function(data) {
    console.log('Current API key data:', data);
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
      statusDiv.textContent = 'API key loaded from storage';
      statusDiv.style.color = 'green';
    } else {
      statusDiv.textContent = 'No API key found in storage';
      statusDiv.style.color = 'orange';
    }
  });
  
  // Save API key
  saveBtn.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    console.log('Attempting to save API key:', apiKey ? 'Valid key entered' : 'Empty key');
    
    if (apiKey) {
      chrome.storage.sync.set({apiKey: apiKey}, function() {
        console.log('API key saved successfully');
        statusDiv.textContent = 'API Key saved!';
        statusDiv.style.color = 'green';
      });
    } else {
      statusDiv.textContent = 'Please enter an API key';
      statusDiv.style.color = 'red';
    }
  });
});