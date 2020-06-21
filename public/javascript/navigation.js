// -----------------------------------------------------------------------------
//   Site navigation
// -----------------------------------------------------------------------------

(function() {
  if (
    !('querySelector' in document) ||
    !('classList' in document.createElement('div')) ||
    !('IntersectionObserver' in window)
  ) {
    return;
  }

  var homeListItem = document.querySelector('.menu-item--home');

  var homeContent = document.getElementById('home');

  var menuItemHiddenClass = 'menu-item--hidden';

  if (!homeListItem || !homeContent) {
    return;
  }

  // This adds the hidden class to the Home menu link if 20% (0.2) of the Home
  // section is visible, and removes it when less than 20% is visible. This
  // allows us to hide it via CSS as it's redundant when viewing the Home
  // section.
  var observer = new IntersectionObserver(function(entries, observer) {
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
