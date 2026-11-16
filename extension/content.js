'use strict';
// MOEIS A4 Formatter — formats MOEIS PPB report pages to A4 portrait, one student per page.
function a4FormatMoeis(){
if(document.getElementById('a4fix'))return -1;
const st=document.createElement('style');st.id='a4fix';
st.textContent=`@page{size:A4 portrait;margin:10mm}
@media screen{html{background:#888}body{margin:0;padding:20px 0}.a4sheet{width:210mm;height:297mm;margin:0 auto 20px;background:#fff;box-shadow:0 0 8px rgba(0,0,0,.5);padding:10mm;overflow:hidden}}
@media print{body{margin:0!important;padding:0!important}.a4sheet{width:190mm;height:277mm;padding:0;margin:0;overflow:hidden;page-break-after:always;break-after:page}.a4sheet:last-of-type{page-break-after:auto;break-after:auto}}
body{width:auto!important;height:auto!important}
*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
@media print{body>*:not(.a4sheet){display:none!important}}
.a4inner{transform-origin:top left}
.a4inner *{page-break-after:auto!important;break-after:auto!important;page-break-before:auto!important;break-before:auto!important}
.a4inner .boxNew{width:auto!important;height:auto!important}
.a4inner table{max-width:100%}
.a4inner .book,.a4inner .page{width:auto!important;height:auto!important;margin:0!important;padding:0!important;min-height:0!important}`;
document.head.appendChild(st);
const kids=[...document.body.children],groups=[];
kids.forEach(e=>{
  const n=e.nextElementSibling;
  if(e.tagName==='TABLE'&&n&&n.classList.contains('book'))groups.push([e,n]);
  else if(e.classList.contains('book')&&!(e.previousElementSibling&&e.previousElementSibling.tagName==='TABLE'))groups.push([e]);
  else if(e.tagName==='DIV'&&!e.classList.contains('book')&&!e.textContent.trim()&&!e.querySelector('img'))e.remove();
});
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
  inner.style.width=best.W+'px';inner.style.zoom=(best.f*0.99).toFixed(4);
});
return groups.length;
}

function a4Run(){
  const n=a4FormatMoeis();
  const btn=document.getElementById('a4moeis-btn');
  if(n===-1){ if(confirm('Halaman sudah diformat. Muat semula untuk paparan asal?')) location.reload(); return; }
  if(!n){ alert('Format halaman ini tidak dikenali.'); return; }
  if(btn){ const nb=btn.cloneNode(false); nb.textContent='🖨️ Cetak (Ctrl+P)'; nb.addEventListener('click',e=>{ if(e.isTrusted) window.print(); }); btn.replaceWith(nb); }
}

function a4AddButton(){
  if(document.getElementById('a4moeis-btn')) return;
  // only show on pages that contain report blocks
  if(!document.querySelector('.book')) return;
  const s=document.createElement('style');
  s.textContent='#a4moeis-btn{position:fixed;right:20px;bottom:20px;z-index:2147483647;background:#1C67B0;color:#fff;border:0;border-radius:24px;padding:12px 18px;font:bold 14px Arial,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.35);cursor:pointer}#a4moeis-btn:hover{background:#155291}@media print{#a4moeis-btn{display:none!important}}';
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
}
