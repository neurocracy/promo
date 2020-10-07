// -----------------------------------------------------------------------------
//   Persistent promo
// -----------------------------------------------------------------------------

(function() {
  if (!('querySelector' in document)) {
    return;
  }

  var persistentPromo = document.querySelector('.persistent-promo');

  var headroom = new Headroom(persistentPromo, {
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
