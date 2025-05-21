document.addEventListener('DOMContentLoaded', function() {
  console.log('Simple popup loaded');
  
  // Get elements
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveButton');
  const statusElement = document.getElementById('status');
  
  // Load the API key from storage
  chrome.storage.sync.get('apiKey', function(data) {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
      statusElement.textContent = 'API key loaded';
    }
  });
  
  // Save the API key to storage
  saveButton.addEventListener('click', function() {
    const key = apiKeyInput.value.trim();
    
    if (key) {
      chrome.storage.sync.set({apiKey: key}, function() {
        statusElement.textContent = 'API key saved!';
        statusElement.style.color = 'green';
      });
    } else {
      statusElement.textContent = 'Please enter an API key';
      statusElement.style.color = 'red';
    }
  });
});