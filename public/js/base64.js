/**
 * Base64 Encoding/Decoding Utilities
 * Provides base64 encoding and decoding with file support
 */
(function () {
  'use strict';

  /**
   * Validates a base64 string
   * @param {string} str - The string to validate
   * @throws {Error} If the string is not valid base64
   */
  function validateBase64(str) {
    if (!/^[\w+/\-,]*={0,2}$/.test(str.replace(/[\r\n]/g, ''))) {
      throw new Error('Invalid base64 string');
    }
  }

  /**
   * Encodes data to base64
   * @param {*} data - The data to encode
   * @param {*} encoding - The encoding to use
   * @returns {string} Base64 encoded string
   */
  window.base64Encode = function (data, encoding) {
    return base64.encode(data, false, encoding);
  };

  window.FILE_BATCH_SIZE = 2097144;

  /**
   * Encodes data with update support for large files
   */
  base64Encode.update = function (data, encoding) {
    ot.setFilename('base64.txt');
    const builder = new ot.DownloadBuilder();
    
    const updater = {
      update: function (chunk) {
        const uint8Array = new Uint8Array(chunk);
        const encoded = base64Encode(uint8Array, encoding);
        builder.push(encoded);
        return updater;
      },
      hex: function () {
        ot.setDownload(builder.finalize());
        return builder.result.length <= 1
          ? builder.result[0]
          : 'The file is too large to display. ' + ot.DOWNLOAD_MESSAGE;
      }
    };
    
    return updater.update(data);
  };

  /**
   * Decodes a base64 string
   * @param {string} str - The base64 string to decode
   * @returns {*} Decoded data
   */
  window.base64Decode = function (str) {
    validateBase64(str);
    return base64.decode.bytes(str);
  };

  /**
   * Downloads decoded base64 data
   * @param {string} str - The base64 string to decode and download
   * @returns {string} Download message
   */
  window.download = function (str) {
    if (!str) {
      return;
    }

    const builder = new ot.DownloadBuilder();
    validateBase64(str);
    builder.push(base64.decode.uint8Array(str));
    ot.setDownload(builder.finalize());
    return ot.DOWNLOAD_MESSAGE;
  };

  /**
   * Downloads decoded base64 data with update support
   */
  download.update = function (data) {
    const decoder = new TextDecoder();
    const builder = new ot.DownloadBuilder();
    let remainder = '';

    const updater = {
      update: function (chunk) {
        const decoded = decoder.decode(chunk);
        validateBase64(decoded);
        
        const combined = remainder + decoded.replace(/[\r\n]/g, '');
        const validLength = combined.length - (combined.length % 4);
        remainder = combined.substring(validLength);
        const validPart = combined.substring(0, validLength);
        
        builder.push(base64.decode.uint8Array(validPart));
        return updater;
      },
      hex: function () {
        if (remainder) {
          builder.push(base64.decode.uint8Array(remainder));
        }
        ot.setDownload(builder.finalize());
        return ot.DOWNLOAD_MESSAGE;
      }
    };

    return updater.update(data);
  };

  // Hide base64 encoding option if not supported
  $('option[data-load-encoding="base64"]').attr('disabled', true).hide();
  
  if (ot.refreshEncodingSelect) {
    ot.refreshEncodingSelect();
  }
})();
