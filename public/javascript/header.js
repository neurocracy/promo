// -----------------------------------------------------------------------------
//   Site header
// -----------------------------------------------------------------------------

(function() {

  'use strict';

  if (!('querySelector' in document)) {
    return;
  }

  let header = document.querySelector('.layout-header');

  let headroom = new Headroom(header, {
    tolerance: 5,
    classes: {
      initial:    'layout-header--initialized',
      pinned:     'layout-header--pinned',
      unpinned:   'layout-header--unpinned',
      top:        'layout-header--top',
      notTop:     'layout-header--not-top',
      bottom:     'layout-header--bottom',
      notBottom:  'layout-header--not-bottom',
      frozen:     'layout-header--frozen'
    }
  });

  headroom.init();

})();
