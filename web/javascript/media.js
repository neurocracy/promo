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
   * The colour scheme attribute name on media links.
   *
   * @type {String}
   */
  const colourSchemeAttributeName = 'data-colour-scheme';

  /**
   * The PhotoSwipe container element.
   *
   * @type {HTMLELement}
   */
  const photoswipeElement = document.querySelector('.pswp');

  /**
   * All features media sections.
   *
   * @type {NodeList}
   */
  const mediaSections = document.querySelectorAll('.features-section__media');

  /**
   * Flat array of all media links that have been added to a PhotoSwipe gallery.
   *
   * @type {Array}
   */
  const mediaLinks = [];

  /**
   * PhotoSwipe gallery items categorized by dark or light colour scheme.
   *
   * Note that the top-level keys defined here are used to validate link colour
   * scheme attribute values. Only the top-level keys already defined here will
   * have gallery items.
   *
   * @type {Object}
   *
   * @see getLinkColourScheme()
   *   Uses the top-level keys here to validate a link's colour scheme attribute
   *   value.
   */
  let galleryItems = {dark: [], light: []};

  /**
   * Get a link's colour scheme value.
   *
   * @param {HTMLAnchorElement} link
   *   The link element.
   *
   * @return {String|null}
   *   The validated colour scheme name or null if it did not pass validation or
   *   the attribute doesn't exist.
   */
  function getLinkColourScheme(link) {

    const colourScheme = link.getAttribute(colourSchemeAttributeName);

    if (colourScheme === null || !galleryItems.hasOwnProperty(colourScheme)) {

      console.warn('Invalid colour scheme found. ', link, colourScheme);

      return null;

    }

    return colourScheme;

  }

  /**
   * Build a PhotoSwipe gallery item for the provided link.
   *
   * @param {HTMLAnchorElement} link
   *   The link element.
   *
   * @return {Object}
   */
  function buildGalleryItem(link) {

    return {
      el:   link,
      src:  link.href,
      msrc: link.getElementsByTagName('img')[0].getAttribute('src'),
      w:    link.getAttribute('data-photoswipe-linked-width'),
      h:    link.getAttribute('data-photoswipe-linked-height')
    };

  };

  for (let i = 0; i < mediaSections.length; i++) {

    /**
     * All  links in this media section.
     *
     * @type {NodeList}
     */
    const links = mediaSections[i].getElementsByTagName('a');

    for (let j = 0; j < links.length; j++) {

      /**
       * The link's colour scheme.
       *
       * @type {String|null}
       */
      const colourScheme = getLinkColourScheme(links[j]);

      if (colourScheme === null) {
        continue;
      }

      galleryItems[colourScheme].push(buildGalleryItem(links[j]));

      // Set the gallery index to the index of the media section, not the index
      // of the link.
      links[j].setAttribute('data-photoswipe-gallery-index', i);

      mediaLinks.push(links[j]);

    }

  }

  function itemEventHandler(event) {

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
     * The link's colour scheme.
     *
     * @type {String|null}
     */
    const colourScheme = getLinkColourScheme(link);

    if (colourScheme === null) {
      return;
    }

    /**
     * PhotoSwipe gallery options for this gallery.
     *
     * @type {Object}
     */
    let galleryOptions = {
      index:      parseInt(
        this.getAttribute('data-photoswipe-gallery-index')
      ),
      shareEl:    false,
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
        const thumbnail = galleryItems[colourScheme][index].el.getElementsByTagName('img')[0];

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

        return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};

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
      photoswipeElement, PhotoSwipeUI_Default,
      // Initialize with the clicked (current) colour scheme items only.
      galleryItems[colourScheme],
      galleryOptions
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

  };

  for (let i = 0; i < mediaLinks.length; i++) {
    mediaLinks[i].addEventListener('click', itemEventHandler);
  }

})();
