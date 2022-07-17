// -----------------------------------------------------------------------------
//   Persistent promo
// -----------------------------------------------------------------------------

(function() {

  'use strict';

  if (!('querySelector' in document)) {
    return;
  }

  let persistentPromo = document.querySelector('.persistent-promo');

  let headroom = new Headroom(persistentPromo, {
    tolerance: 5,
    classes: {
      initial:    'persistent-promo--initialized',
      pinned:     'persistent-promo--pinned',
      unpinned:   'persistent-promo--unpinned',
      top:        'persistent-promo--top',
      notTop:     'persistent-promo--not-top',
      bottom:     'persistent-promo--bottom',
      notBottom:  'persistent-promo--not-bottom',
      frozen:     'persistent-promo--frozen'
    }
  });

  headroom.init();

})();
