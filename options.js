// options.js
document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');
  const subscribeBtn = document.getElementById('subscribeBtn');
  const subscriptionStatusDiv = document.getElementById('subscriptionStatus');

  // Check subscription and API key status on load
  checkStorageAndUpdateUI();

  // Save API key
  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({ 
        apiKey: apiKey,
        useSubscription: false
      }, () => {
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

  // Subscription button handler (placeholder for actual payment integration)
  subscribeBtn.addEventListener('click', () => {
    // This would typically open a payment flow to a service like Stripe
    subscriptionStatusDiv.textContent = 'Subscription feature coming soon!';
    subscriptionStatusDiv.style.color = 'blue';
    
    // For demo purposes, we'll simulate a subscription
    // In a real implementation, this would only be set after successful payment
    chrome.storage.sync.set({ 
      useSubscription: true,
      subscriptionExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days from now
    }, () => {
      setTimeout(() => {
        subscriptionStatusDiv.textContent = 'Subscription active! (Demo Mode)';
        subscriptionStatusDiv.style.color = 'green';
      }, 1500);
    });
  });

  // Helper function to check storage and update UI accordingly
  function checkStorageAndUpdateUI() {
    chrome.storage.sync.get(['apiKey', 'useSubscription', 'subscriptionExpiry'], (data) => {
      // Update API key field
      if (data.apiKey) {
        apiKeyInput.value = data.apiKey;
      }

      // Update subscription status
      if (data.useSubscription && data.subscriptionExpiry) {
        const now = Date.now();
        if (now < data.subscriptionExpiry) {
          // Active subscription
          const expiryDate = new Date(data.subscriptionExpiry);
          subscriptionStatusDiv.textContent = `Subscription active until ${expiryDate.toLocaleDateString()}`;
          subscriptionStatusDiv.style.color = 'green';
          subscribeBtn.textContent = 'Renew Subscription';
        } else {
          // Expired subscription
          subscriptionStatusDiv.textContent = 'Subscription expired';
          subscriptionStatusDiv.style.color = 'red';
          subscribeBtn.textContent = 'Subscribe ($2/month)';
          
          // Disable subscription flag since it's expired
          chrome.storage.sync.set({ useSubscription: false });
        }
      }
    });
  }
});
