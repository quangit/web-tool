/**
 * JSON Utilities
 * Provides JSON validation, formatting, and visualization
 */
(function () {
  'use strict';

  let jsonViewer;

  /**
   * Validates a JSON string
   * @param {string} jsonString - The JSON string to validate
   * @returns {string} "Valid" or error message
   */
  function validate(jsonString) {
    try {
      JSON.parse(jsonString);
      return 'Valid';
    } catch (error) {
      return error.message;
    }
  }

  /**
   * Minifies a JSON string
   * @param {string} jsonString - The JSON string to minify
   * @returns {string} Minified JSON string
   */
  function minify(jsonString) {
    return JSON.stringify(JSON.parse(jsonString));
  }

  /**
   * Formats a JSON string with indentation
   * @param {string} jsonString - The JSON string to format
   * @param {string} indentType - "space" or "tab"
   * @param {number} indentSize - Number of spaces/tabs for indentation
   * @returns {string} Formatted JSON string
   */
  function format(jsonString, indentType, indentSize) {
    let formatted = JSON.stringify(JSON.parse(jsonString), null, indentSize);

    if (indentType === 'tab') {
      formatted = formatted.replace(/^\s+/gm, function (match) {
        return match.replace(/ /g, '\t');
      });
    }

    return formatted;
  }

  /**
   * Displays JSON in an interactive viewer
   * @param {string} jsonString - The JSON string to visualize
   */
  function view(jsonString) {
    if (!jsonViewer) {
      jsonViewer = document.createElement('andypf-json-viewer');
      jsonViewer.id = 'json';
      jsonViewer.expanded = true;
      jsonViewer.indent = 2;
      jsonViewer.showDataTypes = false;
      jsonViewer.showToolbar = true;
      jsonViewer.showSize = true;
      jsonViewer.showCopy = true;
      jsonViewer.expandIconType = 'square';
      $('#output').html(jsonViewer);
    }

    // Apply theme based on dark mode setting
    const theme = localStorage.getItem('DARK') === '1' ? 'monokai' : 'default-light';
    jsonViewer.setAttribute('theme', theme);

    try {
      jsonViewer.data = JSON.parse(jsonString);
    } catch (error) {
      jsonViewer.data = error.message;
    }
  }

  // Update theme when theme toggle is clicked
  $('.theme').click(function () {
    if (jsonViewer) {
      const theme = localStorage.getItem('DARK') === '1' ? 'monokai' : 'default-light';
      jsonViewer.setAttribute('theme', theme);
    }
  });

  window.json = {
    validate: validate,
    minify: minify,
    format: format,
    view: view
  };
})();
