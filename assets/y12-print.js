/* Printable versions of the Year 12 lesson pages.
   Y12Print.student(win) builds a worksheet with blank answer spaces.
   Y12Print.answers(win) builds the teacher answer file for the same lesson. */
(function(){
"use strict";
const P=window.Y12Print={};

const txt=el=>(el?el.textContent:"").replace(/\s+/g," ").trim();
const cut=(s,n)=>s.length>n?s.slice(0,n).replace(/\s+\S*$/,"")+"…":s;
const LET="ABCDEFGH";

function lines(n,starter){
  let h="";
  for(let i=0;i<n;i++)h+=`<div class="pr-line">${i===0&&starter?`<span class="pr-starter">${starter}</span>`:""}</div>`;
  return `<div class="pr-lines">${h}</div>`;
}
const box=label=>`<li><span class="pr-box"></span>${label}</li>`;
const ticks=(opts,cls)=>`<ul class="pr-ticks${cls?" "+cls:""}">${opts.map(box).join("")}</ul>`;

function linesFor(t){
  const id=(t.id||"").toLowerCase(),ph=(t.getAttribute("placeholder")||"").trim();
  let n=4;
  if(/eq/.test(id)||/^your equation/i.test(ph))n=2;
  else if(/calc|working|extend/.test(id)||/working|show each step/i.test(ph))n=6;
  const r=+t.getAttribute("rows");if(r>0)n=Math.max(n,r);
  const starter=/^(your equation|my working\.*|show each step)$/i.test(ph)?"":ph;
  return lines(n,starter);
}

function qrSVG(url){
  try{
    if(typeof window.qrcode!=="function")return "";
    const q=window.qrcode(0,"M");q.addData(url);q.make();
    return q.createSvgTag({cellSize:2,margin:0,scalable:true});
  }catch(e){return "";}
}

function cleanURL(win){
  try{const u=new URL(win.location.href);u.search="";u.hash="";return u.href;}catch(e){return "";}
}

/* Text that sits just before an answer, so the teacher file says what the answer is for. */
function contextFor(el){
  let n=el;
  while(n){
    let s=n.previousElementSibling;
    while(s){
      if(!s.matches("textarea,label,select,button,.btnrow,.pr-lines,.pr-qno,.note:empty")){
        const t=txt(s);
        if(t&&!/^(my |i think$)/i.test(t))return cut(t,170);
      }
      s=s.previousElementSibling;
    }
    n=n.parentElement;
    if(!n||n.matches(".panel"))break;
  }
  return "";
}

function header(doc,L,url,mode){
  const g=s=>doc.querySelector(s);
  const eyebrow=txt(g(".band .eyebrow")),title=g(".band h1")?g(".band h1").innerHTML:doc.title;
  const sub=txt(g(".band .sub")),kq=g(".band .kq span");
  const qr=mode==="student"&&url?qrSVG(url):"";
  let h=`<header class="pr-head"><div class="pr-htxt">`;
  if(eyebrow)h+=`<div class="pr-eyebrow">${eyebrow}${mode==="answers"?" · Teacher answers":""}</div>`;
  h+=`<h1>${title}</h1>`;
  if(sub)h+=`<p class="pr-sub">${sub}</p>`;
  if(kq)h+=`<p class="pr-kq"><b>Key question</b> ${kq.innerHTML}</p>`;
  h+=`</div>`;
  if(qr)h+=`<div class="pr-qr">${qr}<span>Scan for the online version</span></div>`;
  h+=`</header>`;
  if(mode==="student")h+=`<div class="pr-name"><span>Name</span><i></i><span>Date</span><i class="short"></i></div>`;
  return h;
}

function intro(doc){
  const cards=[...doc.querySelectorAll(".intro .icard")];
  if(!cards.length)return "";
  return `<div class="pr-intro">${cards.map(c=>{
    const k=c.cloneNode(true);
    k.querySelectorAll(".ic,svg").forEach(e=>e.remove());
    k.querySelectorAll("details").forEach(d=>{const s=d.querySelector(":scope>summary");const box=doc.createElement("div");
      if(s){const h=doc.createElement("h3");h.textContent=txt(s).replace(/^show (the )?/i,"").replace(/^./,c=>c.toUpperCase());box.appendChild(h);s.remove();}
      while(d.firstChild)box.appendChild(d.firstChild);d.replaceWith(box);});
    return `<section class="pr-icard">${k.innerHTML}</section>`;}).join("")}</div>`;
}

function keyWords(doc){
  const d=doc.getElementById("drawer");if(!d)return "";
  const dl=d.querySelector("dl"),rms=[...d.querySelectorAll(".rm")];
  if(!dl&&!rms.length)return "";
  return `<section class="pr-part pr-kw"><h2>Key words</h2>${dl?dl.outerHTML:""}${rms.map(r=>`<div class="pr-watch">${r.innerHTML}</div>`).join("")}</section>`;
}

/* Turn one lesson part into a print block. Answers found on the way go into ans. */
function part(doc,L,id,label,i,ans){
  const src=doc.getElementById("p-"+id);if(!src)return "";
  const p=src.cloneNode(true);
  p.removeAttribute("hidden");p.removeAttribute("id");
  p.querySelectorAll("[hidden]").forEach(e=>e.removeAttribute("hidden"));
  p.querySelectorAll("[id]").forEach(e=>{e.dataset.pid=e.id;e.removeAttribute("id");});
  const byId=k=>p.querySelector(`[data-pid="${k}"]`);
  const list=[];
  const all=[...p.querySelectorAll("*")];
  const add=(kind,context,html,at)=>list.push({kind,context,html,pos:all.indexOf(at)});

  /* Interactive pieces, rebuilt from the lesson data. */
  const pick=byId("pickBtns");
  if(pick&&L.pick){pick.outerHTML=`<p class="pr-hint">Tick one.</p>`+ticks(L.pick.options,"pr-row");}
  const yp=byId("yourPick");
  if(yp){
    const rb=yp.closest(".fb");
    if(rb){
      const k=rb.cloneNode(true);k.querySelector('[data-pid="yourPick"]').remove();
      if(txt(k))add("note","Warm up answer (shown on the online page when students reach this part)",k.innerHTML,rb);
      rb.outerHTML=`<p class="pr-task">Look back at your Warm up choice. Answer the questions below, then decide whether you would change your choice.</p>`;
    }else yp.remove();
  }

  const cards=byId("cards");
  if(cards&&L.sort){
    const S=L.sort;
    cards.outerHTML=`<div class="pr-cards">${S.cards.map((c,n)=>`<div class="pr-card"><div class="pr-cno">${n+1}</div><div><p>${c.t}</p>${c.where?`<p class="pr-where">Where you meet it: ${c.where}</p>`:""}${S.cols.map(col=>`<div class="pr-col"><b>${col.label}</b>${ticks(col.opts)}</div>`).join("")}</div></div>`).join("")}</div>`;
    const rows=S.cards.map((c,n)=>`<tr><td>${n+1}</td><td>${c.t}</td><td>${S.cols.map((col,k)=>`<div class="pr-acol">${S.cols.length>1?`<span>${col.label}</span>`:""}<b>${col.opts[c.ans[k]]}</b></div>`).join("")}</td><td>${c.why||""}</td></tr>`).join("");
    add("table","Card sort",`<table class="pr-atable"><thead><tr><th></th><th>Card</th><th>Answer</th><th>Why</th></tr></thead><tbody>${rows}</tbody></table>`,cards);
  }

  const topics=byId("topics");
  if(topics&&L.scen){
    const S=L.scen,body=byId("topicBody");
    let h=`<div class="pr-scens">`;
    if(S.mode==="goals"){
      S.items.forEach((t,n)=>{
        h+=`<div class="pr-scen"><h4>${n+1}. ${t.label}</h4><p>${t.desc}</p><p class="pr-hint">Tick the goals it links to.</p>${ticks(S.goals.map(([g,l])=>`Goal ${g} ${l}`).concat(["Another goal"]),"pr-two")}<p class="pr-hint">My sentence</p>${lines(3)}</div>`;
        add("html",`${n+1}. ${t.label}`,t.links.map(([g,why])=>{const gl=S.goals.find(x=>x[0]===g);return `<p><b>Goal ${g}</b> ${gl?gl[1]:""}, because ${why}</p>`;}).join(""),topics);
      });
    }else{
      const ph=body&&body.querySelector("textarea")?(body.querySelector("textarea").getAttribute("placeholder")||""):"";
      S.items.forEach((t,n)=>{
        h+=`<div class="pr-scen"><h4>${n+1}. ${t.label}</h4><p>${t.desc}</p><p class="pr-hint">I think</p>${ticks(S.options)}<p class="pr-hint">My working</p>${lines(4,ph)}</div>`;
        add("html",`${n+1}. ${t.label}`,t.answer,topics);
      });
    }
    h+=`</div>`;
    topics.outerHTML=h;
    if(body)body.remove();
  }

  const quiz=byId("quiz");
  if(quiz&&L.quiz){
    quiz.outerHTML=`<ol class="pr-quiz">${L.quiz.map(q=>`<li><p>${q.q}</p><ol class="pr-opts">${q.o.map((o,j)=>`<li><span class="pr-let">${LET[j]}</span>${o}</li>`).join("")}</ol></li>`).join("")}</ol>`;
    add("html","Quick quiz",`<ol class="pr-aquiz">${L.quiz.map(q=>`<li><b>${LET[q.a]}. ${q.o[q.a]}</b>${q.why?`<span class="pr-why">${q.why}</span>`:""}</li>`).join("")}</ol>`,quiz);
  }

  /* Answers behind "Show the answer". A summary that is itself a question stays on the worksheet. */
  [...p.querySelectorAll("details.reveal")].reverse().forEach(d=>{
    const s=d.querySelector(":scope>summary");const sumT=txt(s);
    const k=d.cloneNode(true);k.querySelector(":scope>summary").remove();k.querySelectorAll("button").forEach(b=>b.remove());
    const steps=k.querySelector('[data-pid="aeSteps"]');
    if(steps&&L.reveal)steps.innerHTML=L.reveal.steps.map(x=>`<div class="pr-wline">${x}</div>`).join("");
    const isQ=!/^show\b/i.test(sumT);
    const ctx=isQ?sumT:contextFor(d);
    const html=k.innerHTML.trim();
    if(txt(k)||k.querySelector("svg,img,table"))add("reveal",ctx,html,d);
    if(isQ){const q=doc.createElement("div");q.innerHTML=`<p class="pr-task">${s.innerHTML}</p>${lines(3)}`;d.replaceWith(...q.childNodes);}
    else{
      let prev=d.previousElementSibling;while(prev&&prev.matches("label,.note:empty"))prev=prev.previousElementSibling;
      const hasSpace=prev&&prev.matches("textarea,.pr-lines,.pr-scens,.pr-cards,.pr-quiz,.pr-ticks");
      if(!hasSpace&&!d.closest(".fb")){const q=doc.createElement("div");q.innerHTML=lines(3);d.replaceWith(q.firstChild);}else d.remove();
    }
  });

  /* Extension tasks and any other drop-downs print open. */
  p.querySelectorAll("details").forEach(d=>{
    const s=d.querySelector(":scope>summary");const isExt=d.classList.contains("extend");
    const b=doc.createElement("div");b.className=isExt?"pr-extend":"pr-open";
    const h=doc.createElement("h4");h.innerHTML=isExt?"Extend":(s?s.innerHTML:"");b.appendChild(h);
    if(s)s.remove();
    while(d.firstChild)b.appendChild(d.firstChild);d.replaceWith(b);
  });

  p.querySelectorAll("textarea").forEach(t=>{const w=doc.createElement("div");w.innerHTML=linesFor(t);t.replaceWith(w.firstChild);});
  p.querySelectorAll("select,button,.stepnav,.dots,.btnrow,[data-pid=engNote],[data-pid=sortScore]").forEach(e=>e.remove());
  p.querySelectorAll("label.note").forEach(l=>{const q=doc.createElement("p");q.className="pr-hint";q.innerHTML=l.innerHTML;l.replaceWith(q);});
  p.querySelectorAll(".steplab").forEach(e=>{if(/^Part \d+ of \d+$/.test(txt(e)))e.remove();});
  p.querySelectorAll(".step").forEach(e=>e.classList.add("pr-step"));

  /* Keep the answers in page order. */
  ans.push({label,i,items:list.map((a,n)=>[a,n]).sort((x,y)=>(x[0].pos-y[0].pos)||(x[1]-y[1])).map(x=>x[0])});

  const phead=p.querySelector(".phead h2");
  const title=phead?phead.innerHTML:label;
  if(p.querySelector(".phead"))p.querySelector(".phead").remove();
  return `<section class="pr-part"><div class="pr-phead"><span class="pr-pno">Part ${i+1} · ${label}</span><h2>${title}</h2></div><div class="pr-pbody">${p.innerHTML}</div></section>`;
}

function build(win,mode){
  const doc=win.document,L=win.LESSON;
  if(!L)return "";
  const url=cleanURL(win);const ans=[];
  const parts=L.parts.map(([id,label],i)=>part(doc,L,id,label,i,ans)).join("");
  if(mode==="answers"){
    const body=ans.filter(a=>a.items.length).map(a=>`<section class="pr-part pr-ans"><div class="pr-phead"><span class="pr-pno">Part ${a.i+1}</span><h2>${a.label}</h2></div>${a.items.map(it=>`<div class="pr-aitem">${it.context?`<p class="pr-actx">${it.context}</p>`:""}<div class="pr-abody">${it.html}</div></div>`).join("")}</section>`).join("");
    return `<article class="pr-doc pr-teacher">${header(doc,L,url,"answers")}${body||`<p>This lesson has no answers to show.</p>`}</article>`;
  }
  return `<article class="pr-doc">${header(doc,L,url,"student")}${intro(doc)}${parts}${keyWords(doc)}${url?`<footer class="pr-foot">Online version: ${url}</footer>`:""}</article>`;
}

P.student=win=>build(win,"student");
P.answers=win=>build(win,"answers");

/* Load a lesson page in a hidden frame so its script runs, then hand back its window. */
P.load=function(url,host){
  return new Promise((res,rej)=>{
    const f=document.createElement("iframe");
    f.setAttribute("aria-hidden","true");f.tabIndex=-1;
    f.style.cssText="position:absolute;width:1000px;height:800px;left:-10000px;top:0;border:0;visibility:hidden";
    let done=false;
    const t=setTimeout(()=>{if(!done){done=true;f.remove();rej(new Error("Timed out loading "+url));}},20000);
    f.onload=()=>{if(done)return;
      const w=f.contentWindow;
      const wait=(n)=>{if(w.LESSON&&w.document.getElementById("tabs")&&w.document.getElementById("tabs").children.length){done=true;clearTimeout(t);res({win:w,frame:f});}
        else if(n>100){done=true;clearTimeout(t);res({win:w,frame:f});}else setTimeout(()=>wait(n+1),50);};
      wait(0);};
    f.src=url;(host||document.body).appendChild(f);
  });
};

/* Print button on a lesson page. */
function initLesson(){
  if(!window.LESSON||!document.getElementById("tabs"))return;
  const root=document.documentElement;let holder=null,theme=null;
  const prepare=()=>{
    if(holder)return;
    theme=root.getAttribute("data-theme");root.setAttribute("data-theme","light");
    holder=document.createElement("div");holder.className="y12print";holder.innerHTML=P.student(window);
    document.body.appendChild(holder);document.body.classList.add("pr-on");
  };
  const clear=()=>{if(!holder)return;holder.remove();holder=null;document.body.classList.remove("pr-on");
    if(theme)root.setAttribute("data-theme",theme);else root.removeAttribute("data-theme");};
  window.addEventListener("beforeprint",prepare);
  window.addEventListener("afterprint",()=>setTimeout(clear,300));
  const b=document.getElementById("printBtn");
  if(b)b.addEventListener("click",()=>{clear();prepare();setTimeout(()=>window.print(),60);});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initLesson);else initLesson();
})();
