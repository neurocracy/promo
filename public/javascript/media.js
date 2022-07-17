// -----------------------------------------------------------------------------
//   Site media
// -----------------------------------------------------------------------------

(function() {

  'use strict';

  if (
    !('querySelector' in document) ||
    !('PhotoSwipe' in window) ||
    !('ally' in window) ||
    !('matchMedia' in window)
  ) {
    return;
  }

  /**
   * The PhotoSwipe container element.
   *
   * @type {HTMLELement}
   */
  const photoswipeElement = document.querySelector('.pswp');

  /**
   * All media links in the features section.
   *
   * @type {NodeList}
   */
  const itemLinks = document.querySelectorAll('.features-section__media a');

  /**
   * PhotoSwipe gallery items.
   *
   * @type {Array}
   */
  let items = [];

  for (let i = 0; i < itemLinks.length; i++) {

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

  for (let i = 0; i < itemLinks.length; i++) {

    itemLinks[i].addEventListener('click', function(event) {

      // Don't do anything and defer to the default action if a modifier key
      // was pressed during the click (to open the link in a new tab, window,
      // etc.) - note that this is a truthy check rather than a strict check
      // for the existence of and boolean true value of the letious event
      // properties:
      // * https://ambientimpact.com/web/snippets/conditional-statements-and-truthy-values-robust-client-side-javascript
      // * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/ctrlKey
      // * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/shiftKey
      if (event.ctrlKey || event.shiftKey) {
        return;
      }

      /**
       * The link element for this gallery index that was clicked.
       *
       * @type {HTMLAnchorElement}
       */
      const link = this;

      /**
       * PhotoSwipe gallery options for this gallery.
       *
       * @type {Object}
       */
      let galleryOptions = {
        index:    parseInt(this.getAttribute('data-photoswipe-gallery-index')),
        shareEl:  false,
        galleryUID: 'features',
      };

      // This only provides the thumbnail callback if reduced motion is not
      // specified. If the thumbnail callback isn't set, PhotoSwipe will not do
      // the zoom transition in and out on open and close.
      if (!window.matchMedia('(prefers-reduced-motion)').matches) {

        galleryOptions.getThumbBoundsFn = function(index) {

          /**
           * The thumbnail image element for this gallery item.
           *
           * @type {HTMLImageElement}
           */
          const thumbnail = items[index].el.getElementsByTagName('img')[0];

          /**
           * Current vertical scroll of the viewport in pixels.
           *
           * @type {Number}
           */
          const pageYScroll = (
            window.pageYOffset || document.documentElement.scrollTop
          );

          /**
           * Thumbnail element DOMRect object.
           *
           * @type {DOMRect}
           */
          const rect = thumbnail.getBoundingClientRect();

          return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};

        };

      // If reduced motion is specified, tell PhotoSwipe to do a fade in and out
      // on open and close, so that there's still some smoothness to the UX even
      // without the zoom transitions.
      } else {
        galleryOptions.showHideOpacity = true;
      }

      /**
       * PhotoSwipe instance for this gallery.
       *
       * @type {PhotoSwipe}
       */
      let gallery = new PhotoSwipe(
        photoswipeElement, PhotoSwipeUI_Default, items, galleryOptions
      );

      /**
       * The ally.js focus disabled instance handle, if active.
       *
       * @type {Object|undefined}
       *
       * @see https://allyjs.io/api/maintain/disabled.html
       */
      let focusDisabledHandle;

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
