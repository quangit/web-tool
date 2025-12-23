/**
 * Download Utility
 * Provides file download functionality
 */
(function () {
  'use strict';

  const $executeBtn = $('#execute');
  const $filenameInput = $('#download-file-name');
  const originalGetInput = ot.getInput;

  /**
   * Enhanced getInput that prepares download
   * @param {*} input - The input element
   * @returns {*} Input value
   */
  ot.setGetInput(function (input) {
    $executeBtn.removeAttr('href');
    $executeBtn.attr('download', $filenameInput.val());
    return originalGetInput(input);
  });

  /**
   * Enhanced setOutput that triggers download
   * @param {jQuery} outputElement - The output element
   * @param {string} base64Data - The base64 encoded data
   */
  ot.setSetOutput(function (outputElement, base64Data) {
    $executeBtn.attr('href', 'data:application/octet-stream;base64,' + base64Data);
    outputElement.val('The download should have started.');
  });
})();
