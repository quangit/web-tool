/**
 * File Loader Utility
 * Handles dynamic loading of file-related scripts
 */
(function () {
  'use strict';

  /**
   * Loads file handling scripts if file input is selected
   */
  function loadFileScripts() {
    const $fileType = $('#file-type');
    const fileTypeValue = $fileType.val();

    if (fileTypeValue !== 'text') {
      // Remove change listener to prevent multiple loads
      $fileType.off('change', loadFileScripts);

      // Load required scripts for file handling
      waitLoadCount += 3;
      
      ot.createOnDemandScript('/js/url-blob.js?v=1').load(methodLoad);
      ot.createOnDemandScript('/js/droppable-file.js').load(methodLoad);
      ot.createOnDemandScript('/js/file.js?v=10').load(methodLoad);
    }
  }

  const $fileType = $('#file-type');
  $fileType.change(loadFileScripts);
  
  // Check initial state
  loadFileScripts();
})();
