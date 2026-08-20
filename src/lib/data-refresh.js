let refreshTimer;

/** Re-run the active page's data loaders without reloading the browser. */
export const refreshCurrentPageData = () => {
  // Let the mutation finish closing its dialog or updating local state first.
  // Multiple writes in one event loop result in one page-data refresh.
  clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    window.dispatchEvent(new Event("edureon:data-refresh"));
  }, 0);
};
