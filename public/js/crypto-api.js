/**
 * Crypto API Utilities
 * Provides hashing functions using CryptoApi library
 */
(function (window, document) {
  'use strict';

  /**
   * Converts input to proper format for hashing
   * @param {string|ArrayBuffer} input - The input to convert
   * @returns {*} Converted input
   */
  function prepareInput(input) {
    return typeof input === 'string'
      ? CryptoApi.encoder.fromUtf(input)
      : CryptoApi.encoder.fromArrayBuffer(input);
  }

  /**
   * Creates an updatable hasher
   * @param {*} hasher - The hasher instance
   * @param {*} input - The input to hash
   * @returns {Object} Updatable hasher object
   */
  function createUpdatableHasher(hasher, input) {
    hasher.update(prepareInput(input));

    const updater = {
      update: function (chunk) {
        hasher.update(prepareInput(chunk));
        return updater;
      },
      hex: function () {
        return CryptoApi.encoder.toHex(hasher.finalize());
      }
    };

    return updater;
  }

  // Available hash algorithms
  const algorithms = ['ripemd128', 'ripemd160', 'ripemd256', 'ripemd320', 'md2'];

  // Create hash functions for each algorithm
  for (let i = 0; i < algorithms.length; i++) {
    const algorithm = algorithms[i];

    window[algorithm] = (function (algo) {
      /**
       * Creates an updatable hash function
       */
      const updateFunc = function (input) {
        return createUpdatableHasher(CryptoApi.getHasher(algo), input);
      };

      /**
       * Hash function
       * @param {*} input - The input to hash
       * @returns {string} Hex hash
       */
      const hashFunc = function (input) {
        return updateFunc(input).hex();
      };

      hashFunc.update = updateFunc;
      return hashFunc;
    })(algorithm);

    /**
     * HMAC version of the hash function
     */
    window[algorithm].hmac = (function (algo) {
      const updateFunc = function (key, input) {
        const hasher = CryptoApi.getHasher(algo);
        const hmacHasher = CryptoApi.getHmac(prepareInput(key), hasher);
        return createUpdatableHasher(hmacHasher, input);
      };

      const hmacFunc = function (key, input) {
        return updateFunc(key, input).hex();
      };

      hmacFunc.update = updateFunc;
      return hmacFunc;
    })(algorithm);
  }
})(window, document);
