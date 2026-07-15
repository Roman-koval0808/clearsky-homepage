(function() {
    const script = document.currentScript;
    const formId = script.getAttribute('data-form-id');
    const container = document.createElement('div');
    container.id = 'clearsky-form-' + formId;
    
    // Determine the origin of the script
    const scriptUrl = new URL(script.src);
    const origin = scriptUrl.origin;
    
    const iframe = document.createElement('iframe');
    iframe.src = origin + '/ai-signals/forms/embed/' + formId;
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.background = 'transparent';
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('scrolling', 'no');
    
    // Auto-resize logic (simple version)
    window.addEventListener('message', function(event) {
        if (event.origin !== origin) return;
        if (event.data && event.data.type === 'clearsky-form-resize') {
            iframe.style.height = event.data.height + 'px';
        }
    }, false);
    
    script.parentNode.insertBefore(container, script);
    container.appendChild(iframe);
})();
