/**
 * Validator Utility
 * Provides validation result display functionality
 */
(function () {
  'use strict';

  const $validateResult = $('#validate-result');
  const originalSetOutput = ot.setOutput;

  /**
   * Enhanced setOutput that displays validation results
   * @param {jQuery} outputElement - The output element
   * @param {string} value - The output value
   */
  ot.setSetOutput(function (outputElement, value) {
    originalSetOutput(outputElement, value);

    const outputValue = outputElement.val();
    
    if (outputValue === 'Valid') {
      $validateResult
        .addClass('valid')
        .removeClass('invalid')
        .text('Valid');
      outputElement.val('');
    } else {
      $validateResult
        .addClass('invalid')
        .removeClass('valid')
        .text('Invalid');
    }
  });
})();
