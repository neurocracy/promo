// -----------------------------------------------------------------------------
//   Persistent promo
// -----------------------------------------------------------------------------

(function() {

  'use strict';

  if (!('querySelector' in document)) {
    return;
  }

  /**
   * The persistent promo container.
   *
   * @type {HTMLELement}
   */
  const persistentPromo = document.querySelector('.persistent-promo');

  /**
   * Headroom instance for the persistent promo.
   *
   * @type {Headroom}
   */
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
