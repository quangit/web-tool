/**
 * Base32 Encoding/Decoding Utilities
 * Provides base32 encoding and decoding with file support
 */
(function () {
  'use strict';

  /**
   * Encodes data to base32
   * @param {string|Uint8Array} data - The data to encode
   * @returns {string} Base32 encoded string
   */
  window.base32Encode = function (data) {
    return base32.encode(data);
  };

  window.FILE_BATCH_SIZE = 2097120;

  /**
   * Encodes data with update support for large files
   * @param {*} data - Initial data chunk
   * @returns {Object} Updatable encoder object
   */
  base32Encode.update = function (data) {
    ot.setFilename('base32.txt');
    const builder = new ot.DownloadBuilder();

    const updater = {
      update: function (chunk) {
        const uint8Array = new Uint8Array(chunk);
        builder.push(base32Encode(uint8Array));
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
   * Downloads decoded base32 data
   * @param {string} str - The base32 string to decode and download
   * @returns {string} Download message
   */
  window.download = function (str) {
    if (!str) {
      return;
    }

    const decoded = base32.decode.asBytes(str);
    const builder = new ot.DownloadBuilder();
    builder.push(decoded);
    ot.setDownload(builder.finalize());
    
    return ot.DOWNLOAD_MESSAGE;
  };

  /**
   * Downloads decoded base32 data with update support
   * @param {*} data - Initial data chunk
   * @returns {Object} Updatable decoder object
   */
  download.update = function (data) {
    const decoder = new TextDecoder();
    const builder = new ot.DownloadBuilder();

    const updater = {
      update: function (chunk) {
        const decoded = decoder.decode(chunk);
        builder.push(base32.decode.asBytes(decoded));
        return updater;
      },
      hex: function () {
        ot.setDownload(builder.finalize());
        return ot.DOWNLOAD_MESSAGE;
      }
    };

    return updater.update(data);
  };
})();
