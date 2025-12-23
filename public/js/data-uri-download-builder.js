/**
 * Data URI Download Builder
 * Builds data URIs for file downloads
 */
(function () {
  'use strict';

  /**
   * Download Builder class
   * Constructs data URIs for file downloads
   * @constructor
   */
  function DownloadBuilder() {
    this.result = [];
    this.prev = [];
    this.plain = true;
  }

  /**
   * Adds data to the download
   * @param {string|Uint8Array} data - Data to add
   */
  DownloadBuilder.prototype.push = function (data) {
    if (typeof data !== 'string') {
      data = this.encodeArray(data);
      this.plain = false;
    }
    this.result.push(data);
  };

  /**
   * Encodes an array to base64
   * @param {Uint8Array|Array} arr - Array to encode
   * @returns {string} Base64 encoded string
   */
  DownloadBuilder.prototype.encodeArray = function (arr) {
    const combined = this.prev.concat(Array.from(arr));
    const validLength = combined.length - (combined.length % 3);
    
    this.prev = combined.slice(validLength);
    const validPart = combined.slice(0, validLength);
    
    return base64.encode(validPart);
  };

  /**
   * Finalizes and returns the data URI
   * @returns {string} Complete data URI
   */
  DownloadBuilder.prototype.finalize = function () {
    if (this.prev.length) {
      this.result.push(base64.encode(this.prev));
    }

    const mimeType = this.plain
      ? 'text/plain;,'
      : 'application/octet-stream;base64,';
    
    return 'data:' + mimeType + this.result.join('');
  };

  // Load base64 library if not available
  if (!window.base64) {
    ++waitLoadCount;
    ot.createOnDemandScript('js/base64.min.js').load(function () {
      methodLoad();
    });
  }

  ot.DownloadBuilder = DownloadBuilder;
})();
