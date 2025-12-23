/**
 * Base58 Encoding/Decoding Utilities
 * Provides base58 encoding and decoding with file support
 * Note: File size is limited to 20KB for base58 operations
 */
(function () {
  'use strict';

  const MAX_FILE_SIZE = 20480; // 20KB

  /**
   * Initializes base58 encoder if not already loaded
   */
  function initBase58() {
    if (!window.base58) {
      window.base58 = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
    }
  }

  /**
   * Validates file size
   * @param {Uint8Array|Array} data - The data to validate
   * @throws {Error} If file is too large
   */
  function validateFileSize(data) {
    if (data.length > MAX_FILE_SIZE) {
      throw new Error('File is too large. Limit is 20 KB');
    }
  }

  /**
   * Encodes data to base58
   * @param {string|Uint8Array} data - The data to encode
   * @returns {string} Base58 encoded string
   */
  window.base58Encode = function (data) {
    initBase58();
    const bytes = typeof data === 'string' ? ot.utf8ToBytes(data) : data;
    validateFileSize(bytes);
    return base58.encode(bytes);
  };

  /**
   * Encodes a file to base58
   * @param {ArrayBuffer} fileData - The file data to encode
   * @returns {string} Base58 encoded string
   */
  window.base58EncodeFile = function (fileData) {
    initBase58();
    ot.setFilename('base58.txt');

    const builder = new ot.DownloadBuilder();
    const uint8Array = new Uint8Array(fileData);
    
    validateFileSize(uint8Array);
    builder.push(base58.encode(uint8Array));
    ot.setDownload(builder.finalize());
    
    return builder.result[0];
  };

  /**
   * Decodes a base58 string
   * @param {string} str - The base58 string to decode
   * @returns {Uint8Array} Decoded bytes
   */
  window.base58Decode = function (str) {
    initBase58();
    return base58.decode(str);
  };

  /**
   * Downloads decoded base58 data
   * @param {string|Uint8Array} data - The base58 data to decode and download
   * @returns {string} Download message
   */
  window.download = function (data) {
    initBase58();

    let str = data;
    if (typeof data !== 'string') {
      str = new TextDecoder().decode(data);
    }

    const decoded = base58.decode(str);
    const builder = new ot.DownloadBuilder();
    builder.push(decoded);
    ot.setDownload(builder.finalize());
    
    return ot.DOWNLOAD_MESSAGE;
  };
})();
