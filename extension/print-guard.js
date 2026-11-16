'use strict';
// Runs in the page's own world at document_start, before the page's inline <script>window.print();</script>.
// Instead of opening the print dialog it only leaves a flag on <html>; the isolated content script
// reads the flag, formats the page to A4, then prints. Reads no data, makes no requests.
window.print=function(){document.documentElement.dataset.a4PrintRequested='1';};
