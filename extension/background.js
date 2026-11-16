// Only relays a toolbar click to the content script on MOEIS report pages.
// No permissions, no network, no storage.
const ALLOWED = /^https:\/\/moeissppb\.moe\.gov\.my\/laporan\//;
chrome.action.onClicked.addListener(tab => {
  if (!tab || !tab.id) return;
  // tab.url is only visible here when the content script's host matches; if unknown, the message simply has no receiver.
  if (tab.url && !ALLOWED.test(tab.url)) return;
  chrome.tabs.sendMessage(tab.id, { cmd: 'a4run' }).catch(() => {});
});
