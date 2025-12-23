/**
 * Hexadecimal Encoding/Decoding Utilities
 * Provides hex encoding and decoding with file support
 */
(function () {
  'use strict';

  const Uint8Array = window.Uint8Array;

  /**
   * Encodes data to hexadecimal
   * @param {string|Uint8Array} data - The data to encode
   * @param {string} separator - Optional separator between hex pairs
   * @returns {string} Hex encoded string
   */
  window.hexEncode = function (data, separator) {
    const bytes = typeof data === 'string' ? ot.utf8ToBytes(data) : data;
    return ot.bytesToHex(bytes, separator);
  };

  /**
   * Encodes data with update support for large files
   * @param {*} data - Initial data chunk
   * @param {string} separator - Optional separator between hex pairs
   * @returns {Object} Updatable encoder object
   */
  hexEncode.update = function (data, separator) {
    ot.setFilename('hex.txt');
    const builder = new ot.DownloadBuilder();

    const updater = {
      update: function (chunk) {
        const uint8Array = new Uint8Array(chunk);
        const encoded = ot.bytesToHex(uint8Array, separator);
        builder.push(encoded);
        return updater;
      },
      hex: function () {
        ot.setDownload(builder.finalize(true));
        return builder.result.length <= 1
          ? builder.result[0]
          : 'The file is too large to display. ' + ot.DOWNLOAD_MESSAGE;
      }
    };

    return updater.update(data);
  };

  /**
   * Decodes a hexadecimal string
   * @param {string} hexString - The hex string to decode
   * @returns {Uint8Array} Decoded bytes
   */
  window.hexDecode = function (hexString) {
    return ot.hexToBytes(hexString);
  };

  /**
   * Downloads decoded hex data
   * @param {string} hexString - The hex string to decode and download
   * @returns {string} Download message
   */
  window.download = function (hexString) {
    if (!hexString) {
      return;
    }

    const bytes = ot.hexToBytes(hexString, Uint8Array);
    const builder = new ot.DownloadBuilder();
    builder.push(bytes);
    ot.setDownload(builder.finalize());
    return ot.DOWNLOAD_MESSAGE;
  };

  /**
   * Downloads decoded hex data with update support
   * @param {*} data - Initial data chunk
   * @returns {Object} Updatable decoder object
   */
  download.update = function (data) {
    const decoder = new TextDecoder();
    const builder = new ot.DownloadBuilder();

    const updater = {
      update: function (chunk) {
        const decoded = decoder.decode(chunk);
        builder.push(ot.hexToBytes(decoded, Uint8Array));
        return updater;
      },
      hex: function () {
        ot.setDownload(builder.finalize());
        return ot.DOWNLOAD_MESSAGE;
      }
    };

    return updater.update(data);
  };

  // Hide hex encoding option from dropdown (managed separately)
  $('[data-toggle="encoding"] option[value="hex"]').attr('disabled', true).hide();

  if (ot.refreshEncodingSelect) {
    ot.refreshEncodingSelect();
  }
})();
