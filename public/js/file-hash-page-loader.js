class FileHashPageLoader {
  constructor(config) {
    this.scriptSrc = config.scriptSrc;
    this.extraScriptSrc = config.extraScriptSrc;
    this.algorithmName = config.algorithmName;
    this.methodCode = config.methodCode;
    this.methodWrapper = config.methodWrapper;
  }

  loadScripts() {
    // Load extra script if provided
    if (this.extraScriptSrc) {
      ++waitLoadCount;
      delayScripts.push({
        src: this.extraScriptSrc
      });
    }

    // Load hash algorithm library
    ++waitLoadCount;
    delayScripts.push({
      src: this.scriptSrc,
      onload: () => {
        if (this.methodWrapper) {
          this.initWithMethodWrapper();
        } else {
          this.initMethod();
        }
      }
    });

    // Load HMAC support
    ++waitLoadCount;
    delayScripts.push({
      src: '/js/hmac.js?v=2'
    });

    // Load encoding support (already increments waitLoadCount internally)
    delayScripts.push({
      src: '/js/encoding.js?v=8'
    });

    // Load file handling scripts
    ++waitLoadCount;
    delayScripts.push({
      src: '/js/url-blob.js?v=1',
      onload: () => typeof methodLoad === 'function' && methodLoad()
    });

    ++waitLoadCount;
    delayScripts.push({
      src: '/js/droppable-file.js',
      onload: () => typeof methodLoad === 'function' && methodLoad()
    });

    ++waitLoadCount;
    delayScripts.push({
      src: '/js/file.js?v=10',
      onload: () => typeof methodLoad === 'function' && methodLoad()
    });
  }

  initMethod() {
    window.method = eval(this.methodCode);
    if (typeof methodLoad === 'function') {
      methodLoad();
    }
  }

  initWithMethodWrapper() {
    const tryInit = () => {
      if (typeof window.withOptions === 'function') {
        window.method = eval(this.methodWrapper);
        if (typeof methodLoad === 'function') {
          methodLoad();
        }
      } else {
        setTimeout(tryInit, 50);
      }
    };
    tryInit();
  }
}

// Make available globally
window.FileHashPageLoader = FileHashPageLoader;
