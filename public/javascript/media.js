// -----------------------------------------------------------------------------
//   Site media
// -----------------------------------------------------------------------------

(function() {
  if (
    !('querySelector' in document) ||
    !('PhotoSwipe' in window) ||
    !('ally' in window)
  ) {
    return;
  }

  var photoswipeElement = document.querySelector('.pswp');

  var itemLinks = document.querySelectorAll('.features-section__media a');

  var items = [];

  for (var i = 0; i < itemLinks.length; i++) {
    items.push({
      el:   itemLinks[i],
      src:  itemLinks[i].href,
      msrc: itemLinks[i].getElementsByTagName('img')[0].getAttribute('src'),
      w:    itemLinks[i].getAttribute('data-photoswipe-linked-width'),
      h:    itemLinks[i].getAttribute('data-photoswipe-linked-height')
    });

    itemLinks[i].setAttribute('data-photoswipe-gallery-index', i);
  }

  if (items.length === 0) {
    return;
  }

  for (var i = 0; i < itemLinks.length; i++) {
    itemLinks[i].addEventListener('click', function(event) {
      // Don't do anything and defer to the default action if a modifier key
      // was pressed during the click (to open the link in a new tab, window,
      // etc.) - note that this is a truthy check rather than a strict check
      // for the existence of and boolean true value of the various event
      // properties:
      // * https://ambientimpact.com/web/snippets/conditional-statements-and-truthy-values-robust-client-side-javascript
      // * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/ctrlKey
      // * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/shiftKey
      if (event.ctrlKey || event.shiftKey) {
        return;
      }

      var link = this;

      var gallery = new PhotoSwipe(
        photoswipeElement, PhotoSwipeUI_Default, items, {
          index:    parseInt(this.getAttribute('data-photoswipe-gallery-index')),
          shareEl:  false,
          galleryUID: 'features',

          getThumbBoundsFn: function(index) {
            var thumbnail = items[index].el.getElementsByTagName('img')[0],
                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                rect = thumbnail.getBoundingClientRect();

            return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
          }
        }
      );

      var focusDisabledHandle;

      gallery.listen('initialZoomInEnd', function() {
        focusDisabledHandle = ally.maintain.disabled({
          filter: '.pswp *'
        });
      });

      // This moves focus to the corresponding link containing the thumbnail of
      // the current slide when PhotoSwipe closes, so that keyboard navigation
      // doesn't get reset to the top of the page. Ugh. Note that we're doing
      // this right when PhotoSwipe begins to close rather than on destroy, so
      // that we don't risk anything else getting focus for a brief moment and
      // potentially confusing or annoying assistive software users.
      gallery.listen('initialZoomOut', function() {
        focusDisabledHandle.disengage();
        gallery.currItem.el.focus();
      });

      gallery.init();

      // Always prevent the default link action at the end of the handler, in
      // case of an exception in the preceding code.
      event.preventDefault();
    });
  }
})();
