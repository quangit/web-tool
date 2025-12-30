/**
 * Hash Page Script Loader
 * Manages lazy loading and initialization of hash algorithm dependencies
 */

class HashPageLoader {
  constructor(config) {
    this.config = config;
    this.loadedScripts = new Set();
  }

  /**
   * Initialize hash method with optional wrapper
   */
  async initializeMethod() {
    if (this.config.methodWrapper) {
      await this.waitForHelper('withOptions');
      window.method = this.evaluateMethodCode(this.config.methodCode);
    } else {
      window.method = window[this.config.algorithmName];
    }
    
    if (typeof methodLoad === 'function') {
      methodLoad();
    }
  }

  /**
   * Wait for a global function to be available
   */
  waitForHelper(helperName, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkHelper = () => {
        if (typeof window[helperName] === 'function') {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for ${helperName}`));
        } else {
          setTimeout(checkHelper, 50);
        }
      };
      
      checkHelper();
    });
  }

  /**
   * Safely evaluate method code
   */
  evaluateMethodCode(code) {
    try {
      return eval(code);
    } catch (error) {
      console.error('Failed to evaluate method code:', error);
      return null;
    }
  }

  /**
   * Load all required scripts
   */
  async loadScripts() {
    const scripts = [
      {
        src: this.config.scriptSrc,
        onload: () => this.initializeMethod(),
        critical: true
      },
      {
        src: '/js/encoding.js?v=8',
        onload: () => typeof methodLoad === 'function' && methodLoad(),
        critical: true
      }
    ];

    // Load critical scripts first
    const criticalScripts = scripts.filter(s => s.critical);
    const nonCriticalScripts = scripts.filter(s => !s.critical);

    for (const script of criticalScripts) {
      ++waitLoadCount;
      delayScripts.push(script);
    }

    // Load non-critical scripts with delay
    for (const script of nonCriticalScripts) {
      delayScripts.push(script);
    }
  }
}

// Export for global use
window.HashPageLoader = HashPageLoader;
