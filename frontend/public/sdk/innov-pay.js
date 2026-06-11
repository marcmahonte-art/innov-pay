(function() {
  var InnovPay = {};

  InnovPay.checkout = function(options) {
    if (!options.sessionId) {
      console.error('InnovPay: Le paramètre sessionId est obligatoire.');
      return;
    }

    // Modal background overlay
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(2, 6, 23, 0.7)';
    overlay.style.backdropFilter = 'blur(8px)';
    overlay.style.zIndex = '999999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    // Container box
    var container = document.createElement('div');
    container.style.width = '100%';
    container.style.maxWidth = '460px';
    container.style.height = '620px';
    container.style.backgroundColor = '#0f172a';
    container.style.borderRadius = '32px';
    container.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
    container.style.border = '1px solid rgba(51, 65, 85, 0.5)';
    container.style.overflow = 'hidden';
    container.style.position = 'relative';

    // Loading indicator
    var loading = document.createElement('div');
    loading.style.position = 'absolute';
    loading.style.top = '0';
    loading.style.left = '0';
    loading.style.width = '100%';
    loading.style.height = '100%';
    loading.style.display = 'flex';
    loading.style.flexDirection = 'column';
    loading.style.alignItems = 'center';
    loading.style.justifyContent = 'center';
    loading.style.color = '#94a3b8';
    loading.style.backgroundColor = '#020617';
    loading.innerHTML = '<div style="width: 40px; height: 40px; border: 4px solid #4f46e5; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px;"></div><p style="font-size: 14px; font-weight: 600;">Sécurisation de la connexion...</p>';

    // Add keyframes styling for spinner
    var style = document.createElement('style');
    style.innerHTML = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);

    container.appendChild(loading);

    // Iframe elements
    var iframe = document.createElement('iframe');
    // We assume the frontend is hosted locally on port 3000, or adapt it to production
    var baseUrl = options.baseUrl || 'http://localhost:3000';
    iframe.src = baseUrl + '/checkout/' + options.sessionId;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.transition = 'opacity 0.3s ease';

    iframe.onload = function() {
      loading.style.display = 'none';
      iframe.style.opacity = '1';
    };

    container.appendChild(iframe);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Message listener for communicating with checkout page
    function messageHandler(event) {
      if (event.data && event.data.type) {
        if (event.data.type === 'innovpay:success') {
          if (typeof options.onSuccess === 'function') {
            options.onSuccess(event.data.payload);
          }
          cleanup();
        } else if (event.data.type === 'innovpay:close') {
          if (typeof options.onClose === 'function') {
            options.onClose();
          }
          cleanup();
        }
      }
    }

    function cleanup() {
      window.removeEventListener('message', messageHandler);
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }

    // Cancel on click overlay backdrop outside container
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        if (typeof options.onClose === 'function') {
          options.onClose();
        }
        cleanup();
      }
    });

    window.addEventListener('message', messageHandler);
  };

  window.InnovPay = InnovPay;
})();
