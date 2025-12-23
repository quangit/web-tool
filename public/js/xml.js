/**
 * XML Utilities
 * Provides XML validation, formatting, and minification
 */
(function () {
  'use strict';

  let domParser;

  // Initialize DOMParser if available
  if (window.DOMParser) {
    domParser = new DOMParser();
  }

  /**
   * Filter function to remove comments
   * @param {Object} node - XML node
   * @returns {boolean} True if node is not a comment
   */
  function removeComments(node) {
    return node.type !== 'Comment';
  }

  /**
   * Validates an XML string
   * @param {string} xmlString - The XML string to validate
   * @returns {string} "Valid" or error message
   */
  function validate(xmlString) {
    if (!domParser) {
      return 'Sorry, your browser does not support this tool.';
    }

    const doc = domParser.parseFromString(xmlString, 'application/xml');
    const errorNode = doc.querySelector('parsererror div');

    if (errorNode && doc.documentElement.outerHTML !== xmlString) {
      return errorNode.innerText;
    }

    return 'Valid';
  }

  /**
   * Ensures XML is valid before processing
   * @param {string} xmlString - The XML string to check
   * @throws {Error} If XML is invalid
   */
  function ensureValid(xmlString) {
    if (domParser) {
      const validationResult = validate(xmlString);
      if (validationResult !== 'Valid') {
        throw new Error(validationResult);
      }
    }
  }

  /**
   * Minifies an XML string
   * @param {string} xmlString - The XML string to minify
   * @param {boolean} removeCommentsFlag - Whether to remove comments
   * @returns {string} Minified XML string
   */
  function minify(xmlString, removeCommentsFlag) {
    ensureValid(xmlString);

    return xmlFormatter.minify(xmlString, {
      strictMode: true,
      collapseContent: true,
      filter: removeCommentsFlag ? removeComments : undefined
    });
  }

  /**
   * Formats an XML string with indentation
   * @param {string} xmlString - The XML string to format
   * @param {string} indentType - "space" or "tab"
   * @param {number} indentSize - Number of spaces/tabs for indentation
   * @returns {string} Formatted XML string
   */
  function format(xmlString, indentType, indentSize) {
    ensureValid(xmlString);

    const indentChar = indentType === 'space' ? ' ' : '\t';
    let indentation = '';
    
    for (let i = 0; i < indentSize; i++) {
      indentation += indentChar;
    }

    return xmlFormatter(xmlString, {
      strictMode: true,
      collapseContent: true,
      indentation: indentation
    });
  }

  window.xml = {
    validate: validate,
    minify: minify,
    format: format
  };
})();
