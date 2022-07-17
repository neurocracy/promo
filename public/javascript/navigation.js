// -----------------------------------------------------------------------------
//   Site navigation
// -----------------------------------------------------------------------------

(function() {

  'use strict';

  if (
    !('querySelector' in document) ||
    !('classList' in document.createElement('div')) ||
    !('IntersectionObserver' in window)
  ) {
    return;
  }

  /**
   * The home list item.
   *
   * @type {HTMLElement}
   */
  const homeListItem = document.querySelector('.menu-item--home');

  /**
   * The home content element.
   *
   * @type {HTMLElement}
   */
  const homeContent = document.getElementById('home');

  /**
   * The class applied to a menu item when it's to be visually hidden.
   *
   * @type {String}
   */
  const menuItemHiddenClass = 'menu-item--hidden';

  // Bail if we haven't found both of these for any reason.
  if (!homeListItem || !homeContent) {
    return;
  }


  /**
   * Intersection observer to toggle the home menu link hidden class.
   *
   * This adds the hidden class to the Home menu link if 20% (0.2) of the Home
   * section is visible, and removes it when less than 20% is visible. This
   * allows us to hide it via CSS as it's redundant when viewing the Home
   * section.
   *
   * @type {IntersectionObserver}
   */
  let observer = new IntersectionObserver(function(entries, observer) {

    entries.forEach(function(entry) {

      if (entry.isIntersecting) {
        homeListItem.classList.add(menuItemHiddenClass);
      } else {
        homeListItem.classList.remove(menuItemHiddenClass);
      }

    });

  }, {
    // The rough threshold of surface area visible at which the observer
    // callback is triggered, i.e. going from less than this to more, or vice
    // versa.
    threshold: 0.2
  });

  observer.observe(homeContent);

})();
