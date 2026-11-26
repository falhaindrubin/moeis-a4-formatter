'use strict';
// MOEIS A4 Formatter — formats MOEIS PPB report pages to A4 portrait, one student per page.
function a4FormatMoeis(){
if(document.getElementById('a4fix'))return -1;
const kids=[...document.body.children],groups=[],spacers=[];
kids.forEach(e=>{
  const n=e.nextElementSibling;
  if(e.tagName==='TABLE'&&n&&n.classList.contains('book'))groups.push([e,n]);
  else if(e.classList.contains('book')&&!(e.previousElementSibling&&e.previousElementSibling.tagName==='TABLE'))groups.push([e]);
  else if(e.tagName==='DIV'&&!e.classList.contains('book')&&!e.textContent.trim()&&!e.querySelector('img'))spacers.push(e);
});
// Other layouts (e.g. PBD Kemahiran): one student = the run of body siblings between empty page-break spacers.
if(!groups.length){let g=[];kids.forEach(e=>{if(spacers.includes(e)||e.tagName==='SCRIPT'){if(g.length)groups.push(g);g=[];}else g.push(e);});if(g.length)groups.push(g);
  for(let i=groups.length-1;i>=0;i--)if(!groups[i].some(x=>x.matches('.box')||x.querySelector('.box')))groups.splice(i,1);}
// Unknown layout: leave the page untouched, otherwise the print CSS below hides everything (blank printout).
if(!groups.length)return 0;
spacers.forEach(e=>e.remove());
const st=document.createElement('style');st.id='a4fix';
st.textContent=`@page{size:A4 portrait;margin:10mm}
@media screen{html{background:#888}body{margin:0;padding:20px 0}.a4sheet{width:210mm;height:297mm;margin:0 auto 20px;background:#fff;box-shadow:0 0 8px rgba(0,0,0,.5);padding:10mm;overflow:hidden}}
@media print{body{margin:0!important;padding:0!important}.a4sheet{width:190mm;height:277mm;padding:0;margin:0;overflow:hidden;page-break-after:always;break-after:page}.a4sheet:last-of-type{page-break-after:auto;break-after:auto}}
html,body{width:auto!important;height:auto!important}
*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
@media print{body>*:not(.a4sheet){display:none!important}}
.a4inner{transform-origin:top left}
.a4inner *{page-break-after:auto!important;break-after:auto!important;page-break-before:auto!important;break-before:auto!important}
.a4inner .boxNew{width:auto!important;height:auto!important}
.a4inner table{max-width:100%}
.a4inner img{object-fit:contain!important}
.a4inner .book,.a4inner .page{width:auto!important;height:auto!important;margin:0!important;padding:0!important;min-height:0!important}`;
document.head.appendChild(st);
const mm=96/25.4,AW=190*mm,AH=277*mm;
groups.forEach(g=>{const hdr=g[0],book=g[g.length-1];
  const sheet=document.createElement('div');sheet.className='a4sheet';
  const inner=document.createElement('div');inner.className='a4inner';
  sheet.appendChild(inner);document.body.insertBefore(sheet,hdr);
  g.forEach(x=>inner.appendChild(x));
  inner.querySelectorAll('td').forEach(td=>{if(td.innerText.trim()==='Ulasan Guru Kelas'){const tb=td.closest('table');tb.style.width='100%';[...tb.rows].forEach(r=>{const c=r.cells[2];if(c){c.style.width='auto';c.style.maxWidth='none';c.style.minWidth='420px';}});}});
  const box=book.querySelector('.box');
  if(box){let run=[];[...box.children].forEach(k=>{if(k.tagName==='BR')run.push(k);else{if(run.length>=8)run.slice(4).forEach(b=>b.remove());run=[];}});}
  let best=null;
  for(let W=760;W<=1400;W+=40){inner.style.zoom=1;inner.style.width=W+'px';const H=inner.scrollHeight;const f=Math.min(AW/W,AH/H);if(!best||f>best.f)best={W,f};}
  // Zoom changes font rounding and line wrapping, so the zoomed height can exceed the zoom-1 estimate
  // (clipped the signature names). Re-measure after zooming and shrink until it fits with ~3% slack for print reflow.
  inner.style.width=best.W+'px';let z=best.f*0.97;
  for(let i=0;i<6;i++){inner.style.zoom=z.toFixed(4);const h=inner.getBoundingClientRect().height;if(h<=AH*0.97)break;z*=AH*0.97/h;}
});
return groups.length;
}

function a4Run(){
  const n=a4FormatMoeis();
  if(n===-1){ if(confirm('Halaman sudah diformat. Muat semula untuk paparan asal?')) a4Revert(); return; }
  if(!n){ alert('Format halaman ini tidak dikenali.'); return; }
  a4Formatted();
}

// The page calls window.print() on load, which auto-formats; '#a4-asal' tells the reloaded page to skip that once.
function a4Revert(){ location.hash='a4-asal'; location.reload(); }

// After formatting: main button becomes "Cetak", plus a "Paparan Asal" button to go back to the original layout.
function a4Formatted(){
  const btn=document.getElementById('a4moeis-btn');
  if(!btn || document.getElementById('a4moeis-asal')) return;
  const nb=btn.cloneNode(false); nb.textContent='🖨️ Cetak (Ctrl+P)'; nb.addEventListener('click',e=>{ if(e.isTrusted) window.print(); }); btn.replaceWith(nb);
  const r=document.createElement('button'); r.id='a4moeis-asal'; r.type='button'; r.textContent='↩️ Paparan Asal';
  r.addEventListener('click',e=>{ if(e.isTrusted) a4Revert(); });
  document.body.appendChild(r);
}

function a4AddButton(){
  if(document.getElementById('a4moeis-btn')) return;
  // only show on pages that contain report blocks
  if(!document.querySelector('.book,.box')) return;
  const s=document.createElement('style');
  s.textContent='#a4moeis-btn,#a4moeis-asal{position:fixed;right:20px;bottom:20px;z-index:2147483647;background:#1C67B0;color:#fff;border:0;border-radius:24px;padding:12px 18px;font:bold 14px Arial,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.35);cursor:pointer}#a4moeis-btn:hover{background:#155291}#a4moeis-asal{bottom:72px;background:#5f6b7a}#a4moeis-asal:hover{background:#465260}@media print{#a4moeis-btn,#a4moeis-asal{display:none!important}}';
  document.head.appendChild(s);
  const b=document.createElement('button');
  b.id='a4moeis-btn'; b.type='button'; b.textContent='📄 Format A4';
  // Only react to real user clicks, not clicks simulated by page scripts.
  b.addEventListener('click',e=>{ if(e.isTrusted) a4Run(); });
  document.body.appendChild(b);
}

// Defence in depth: only ever act on the official MOEIS host over HTTPS, in the top frame.
const A4_OK = location.protocol==='https:' && location.hostname==='moeissppb.moe.gov.my' && location.pathname.startsWith('/laporan/') && window.top===window;

if(A4_OK){
  // Accept commands only from this extension's own background worker (never from web pages or other extensions).
  chrome.runtime.onMessage.addListener((m,sender)=>{
    if(sender.id!==chrome.runtime.id || sender.tab) return;
    if(m && m.cmd==='a4run') a4Run();
  });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',a4AddButton); else a4AddButton();
  // The page's own window.print() was intercepted by print-guard.js (MAIN world): format first, then print.
  // Exception: '#a4-asal' (set by "Muat semula untuk paparan asal") keeps the original layout for this load only.
  const keepOriginal=location.hash==='#a4-asal';
  if(keepOriginal) history.replaceState(null,'',location.pathname+location.search);
  const de=document.documentElement;
  if(de.dataset.a4PrintRequested==='1'){
    delete de.dataset.a4PrintRequested;
    // Wait for images (logos): measuring before they load underestimates height and clips the page bottom.
    const go=()=>{ if(a4FormatMoeis()>0) a4Formatted(); window.print(); };
    if(!keepOriginal){ if(document.readyState==='complete') go(); else window.addEventListener('load',go,{once:true}); }
  }
}
