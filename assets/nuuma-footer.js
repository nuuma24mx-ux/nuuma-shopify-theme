/* Native details remain open without JavaScript so footer links stay available. */
(() => {
  if (window.nuumaFooterInitialized) return;
  window.nuumaFooterInitialized = true;
  const mobile = window.matchMedia('(max-width: 749px)');
  const update = () => document.querySelectorAll('.nu-footer__details').forEach(details => {
    details.open = !mobile.matches;
  });
  update();
  mobile.addEventListener('change', update);
  document.addEventListener('shopify:section:load', update);
})();
