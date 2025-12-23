/**
 * Droppable File Component
 * Provides drag-and-drop file upload functionality
 */
(function () {
  'use strict';

  $.fn.droppableFile = function () {
    let isBodyListenerAttached = false;

    if (!isBodyListenerAttached) {
      isBodyListenerAttached = true;
      $(document.body).on('dragover drop', function (e) {
        e.preventDefault();
        return false;
      });
    }

    this.each(function () {
      const $container = $(this);
      const $input = $container.find('input');
      const $text = $container.find('.droppable-zone-text');
      const originalText = $text.text();

      $container.on('dragover', function () {
        $container.addClass('hover');
      });

      $container.on('dragleave', function () {
        $container.removeClass('hover');
      });

      $container.on('drop', function (event) {
        $container.removeClass('hover');
        const files = event.originalEvent.dataTransfer.files;

        if (files && files.length > 0) {
          $input[0].files = files;
          $text.text(files[0].name);
          $container.trigger('droppableFile:change', [files]);
        }
      });

      $input.on('change', function () {
        const files = $input[0].files;
        if (files && files[0]) {
          $text.text(files[0].name);
        } else {
          $text.text(originalText);
        }
        $container.trigger('droppableFile:change', [files]);
      });
    });

    return this;
  };

  // Initialize all droppable zones
  $('.droppable-zone').droppableFile();
})();
