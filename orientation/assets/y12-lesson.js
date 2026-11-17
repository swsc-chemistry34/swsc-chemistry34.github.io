(function(){
"use strict";
const C=window.LESSON;
if(!C)return;
const $=id=>document.getElementById(id);
const root=document.documentElement;

/* Theme */
const TK="y12-theme";
try{const t=localStorage.getItem(TK);if(t==="dark"||t==="light")root.setAttribute("data-theme",t);}catch(e){}
const mq=window.matchMedia?matchMedia("(prefers-color-scheme: dark)"):null;
const isDark=()=>{const t=root.getAttribute("data-theme");return t?t==="dark":!!(mq&&mq.matches);};
const MOON='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
const SUN='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>';
const tb=$("themeBtn");
function paintTheme(){if(!tb)return;const d=isDark();tb.innerHTML=d?SUN:MOON;const l=d?"Switch to light mode":"Switch to dark mode";tb.setAttribute("aria-label",l);tb.title=l;}
if(tb){tb.addEventListener("click",()=>{const n=isDark()?"light":"dark";root.setAttribute("data-theme",n);try{localStorage.setItem(TK,n);}catch(e){}paintTheme();});}
if(mq&&mq.addEventListener)mq.addEventListener("change",paintTheme);
paintTheme();

/* Saved progress */
let S={};
try{S=JSON.parse(localStorage.getItem(C.key)||"{}")||{};}catch(e){S={};}
const save=()=>{try{localStorage.setItem(C.key,JSON.stringify(S));}catch(e){}};
["done","sort","quiz","txt","scen","goals","sent"].forEach(k=>{S[k]=S[k]||{};});

/* Shared drawn illustrations */
const ILL={
magnifier:'<circle cx="40" cy="32" r="21" class="ss lsk" stroke-width="5"/><path d="M55 48l16 16" class="nf lsk" stroke-width="7" stroke-linecap="round"/><polygon points="40,19 51,25.5 51,38.5 40,45 29,38.5 29,25.5" class="w lr" stroke-width="3" stroke-linejoin="round"/><circle cx="82" cy="14" r="5" class="r"/><circle cx="88" cy="30" r="4" class="sun"/><circle cx="78" cy="44" r="3.5" class="g"/>',
bulb:'<g class="nf sunk" stroke-width="3.5" stroke-linecap="round"><path d="M48 4v7M22 14l5 5M74 14l-5 5M12 38h7M77 38h7"/></g><circle cx="48" cy="34" r="19" class="sun sunk" stroke-width="3"/><path d="M40 42c-2-12 6-18 17-16 1 11-6 18-17 16z" class="g"/><rect x="39" y="54" width="18" height="8" rx="3" class="smid"/><rect x="42" y="63" width="12" height="5" rx="2.5" class="s"/>',
cycle:'<path d="M20 40A28 28 0 0 1 66 20" class="nf lr" stroke-width="6" stroke-linecap="round"/><path d="M66 8l12 14-17 4z" class="r"/><path d="M76 42A28 28 0 0 1 30 60" class="nf lsk" stroke-width="6" stroke-linecap="round"/><path d="M30 72l-12-14 17-4z" class="s"/><path d="M48 52V36" class="nf gk" stroke-width="3" stroke-linecap="round"/><path d="M48 38c-10 0-12-8-12-12 10 0 12 6 12 12zM48 38c10 0 12-8 12-12-10 0-12 6-12 12z" class="gs gk" stroke-width="2"/>',
balance:'<path d="M48 12v50" class="nf lsk" stroke-width="4" stroke-linecap="round"/><rect x="32" y="62" width="32" height="6" rx="3" class="s"/><path d="M18 26L78 18" class="nf lsk" stroke-width="4" stroke-linecap="round"/><circle cx="48" cy="22" r="4" class="sun"/><path d="M18 26L9 46M18 26l17 20M78 18L67 38M78 18l17 20" class="nf lsk" stroke-width="2"/><path d="M6 46h32a16 9 0 0 1-32 0z" class="rs lr" stroke-width="2"/><path d="M64 38h32a16 9 0 0 1-32 0z" class="smid"/>'
};
document.querySelectorAll("[data-ill]").forEach(el=>{const k=el.dataset.ill;if(ILL[k])el.innerHTML='<svg viewBox="0 0 96 72" aria-hidden="true" focusable="false">'+ILL[k]+'</svg>';});

/* Lesson parts as numbered pill tabs */
const PARTS=C.parts;
const TICK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const tabs=$("tabs");
tabs.innerHTML=PARTS.map(([id,l],i)=>`<button class="tab" role="tab" type="button" id="t-${id}" aria-controls="p-${id}" data-part="${id}"><span class="n" aria-hidden="true"><span class="num">${i+1}</span>${TICK}</span><span class="tt"><b>${l}</b></span></button>`).join("");
function show(id){
  PARTS.forEach(([p])=>{$("p-"+p).hidden=p!==id;const t=$("t-"+p);t.setAttribute("aria-selected",p===id);t.classList.toggle("done",!!S.done[p]);});
  S.cur=id;save();
}
function toPanel(id){const p=$("p-"+id);if(p&&p.getBoundingClientRect().top<0)p.scrollIntoView({block:"start"});}
function progress(){
  const n=PARTS.filter(([p])=>S.done[p]).length;
  $("pfill").style.width=(100*n/PARTS.length)+"%";
  $("pdone").textContent=n===PARTS.length?"All parts done":`${n} of ${PARTS.length} parts done`;
}
tabs.addEventListener("click",e=>{const b=e.target.closest(".tab");if(b){show(b.dataset.part);toPanel(b.dataset.part);}});
tabs.addEventListener("keydown",e=>{
  if(!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"].includes(e.key))return;
  const i=PARTS.findIndex(([p])=>p===S.cur);const d=(e.key==="ArrowDown"||e.key==="ArrowRight")?1:-1;
  const n=PARTS[(i+d+PARTS.length)%PARTS.length][0];show(n);$("t-"+n).focus();e.preventDefault();
});
document.querySelectorAll("[data-finish]").forEach(b=>b.addEventListener("click",()=>{
  const id=b.dataset.finish;S.done[id]=true;save();progress();
  const i=PARTS.findIndex(([p])=>p===id);const nxt=PARTS[i+1];
  if(nxt){show(nxt[0]);$("p-"+nxt[0]).scrollIntoView({block:"start"});}
  else{show(id);b.textContent="Lesson complete";}
}));

/* Text boxes remember what students type */
document.querySelectorAll("textarea[data-keep]").forEach(t=>{t.value=S.txt[t.id]||"";t.addEventListener("input",()=>{S.txt[t.id]=t.value;save();});});

/* Warm up choice */
const PK=C.pick;
function renderPick(){
  const y=$("yourPick");if(!y)return;
  if(PK&&S.pick!==undefined&&PK.options[S.pick]!==undefined){
    y.innerHTML=PK.chosen?PK.chosen(PK.options[S.pick],S.pick):`In Warm up you chose: <b>${PK.options[S.pick]}</b>. Answer the questions below, then decide whether you would change your choice.`;
  }else{y.innerHTML=(PK&&PK.none)||"Answer the questions below, then look back at your Warm up idea.";}
}
if(PK){
  const box=$("pickBtns");
  box.innerHTML=PK.options.map((o,i)=>`<button class="btn" type="button" data-i="${i}" aria-pressed="false">${o}</button>`).join("");
  const paint=()=>{box.querySelectorAll(".btn").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.i===S.pick));
    (PK.highlight||[]).forEach((hid,i)=>{const el=$(hid);if(el)el.classList.toggle("pick",S.pick===i);});
    const n=$("engNote");if(n)n.hidden=S.pick===undefined;renderPick();};
  box.addEventListener("click",e=>{const b=e.target.closest(".btn");if(b){S.pick=+b.dataset.i;save();paint();}});
  paint();
}else renderPick();

/* Card sort */
const SO=C.sort;
if(SO){
  const el=$("cards"),cols=SO.cols,msgs=SO.msgs||{};
  el.innerHTML=SO.cards.map(c=>`<div class="card" id="card-${c.id}"><p>${c.t}</p>${c.where?`<span class="where">Where you meet it: ${c.where}</span>`:""}${cols.map((col,k)=>`<label class="note" for="sel-${c.id}-${k}">${col.label}</label><select id="sel-${c.id}-${k}" data-id="${c.id}" data-k="${k}"><option value="">${col.placeholder||"Choose"}</option>${col.opts.map((o,i)=>`<option value="${i}">${o}</option>`).join("")}</select>`).join("")}<div class="why" hidden></div></div>`).join("");
  el.querySelectorAll("select").forEach(s=>{const key=s.dataset.id+"_"+s.dataset.k;if(S.sort[key]!==undefined)s.value=S.sort[key];
    s.addEventListener("change",()=>{S.sort[key]=s.value;save();const c=$("card-"+s.dataset.id);c.classList.remove("ok","no");c.querySelector(".why").hidden=true;});});
  $("checkSort").addEventListener("click",()=>{
    let right=0,answered=0;const N=SO.cards.length;
    SO.cards.forEach(c=>{const card=$("card-"+c.id),w=card.querySelector(".why");card.classList.remove("ok","no");
      const v=cols.map((_,k)=>$("sel-"+c.id+"-"+k).value);
      if(v.some(x=>x==="")){w.hidden=true;return;}
      answered++;const ok=v.every((x,k)=>+x===c.ans[k]);if(ok)right++;
      card.classList.add(ok?"ok":"no");w.hidden=false;
      w.innerHTML=ok?`<b>Correct.</b> ${c.why}`:`<b>Not quite.</b> Best answer: ${cols.map((col,k)=>col.opts[c.ans[k]]).join(", ")}. ${c.why}`;});
    $("sortScore").textContent=answered?`${right} of ${N} correct${answered<N?` (${N-answered} ${msgs.left||"not finished yet"})`:""}.`:(msgs.none||"Finish at least one card first.");
  });
}

/* Learn steps with Back and Next */
const steps=[...document.querySelectorAll(".step")],dots=$("dots");
if(steps.length&&dots){
  dots.innerHTML=steps.map(()=>"<i></i>").join("");
  let st=Math.min(S.step||0,steps.length-1);
  const go=i=>{st=i;S.step=i;save();steps.forEach((s,j)=>s.hidden=j!==i);[...dots.children].forEach((d,j)=>d.classList.toggle("on",j===i));
    $("stepBack").disabled=i===0;$("stepNext").disabled=i===steps.length-1;};
  $("stepBack").addEventListener("click",()=>go(Math.max(0,st-1)));
  $("stepNext").addEventListener("click",()=>go(Math.min(steps.length-1,st+1)));
  go(st);
}

/* Apply: settings with a choice and working, or topics with SDG goals */
const SC=C.scen;
if(SC){
  const tEl=$("topics"),body=$("topicBody");
  tEl.innerHTML=SC.items.map(s=>`<button class="topic" type="button" data-t="${s.id}" aria-pressed="false">${s.label}</button>`).join("");
  if(SC.mode==="goals"){
    const gEl=$("goals"),sent=$("sdgSentence");
    const pick=id=>{S.topic=id;save();const T=SC.items.find(t=>t.id===id);
      tEl.querySelectorAll(".topic").forEach(b=>b.setAttribute("aria-pressed",b.dataset.t===id));
      body.hidden=false;$("topicDesc").innerHTML=T.desc;
      const g=S.goals[id]||[];
      gEl.innerHTML=SC.goals.map(([n,l])=>`<label><input type="checkbox" id="g-${id}-${n}" value="${n}" ${g.includes(n)?"checked":""}> Goal ${n} ${l}</label>`).join("")+`<label><input type="checkbox" id="g-${id}-other" value="0" ${g.includes(0)?"checked":""}> Another goal</label>`;
      gEl.querySelectorAll("input").forEach(c=>c.addEventListener("change",()=>{S.goals[id]=[...gEl.querySelectorAll("input:checked")].map(x=>+x.value);save();}));
      $("topicLinks").innerHTML=T.links.map(([n,why])=>`<p><span class="sdgchip">Goal ${n}</span> ${SC.goals.find(g=>g[0]===n)[1]}, because ${why}</p>`).join("");
      sent.value=S.sent[id]||"";};
    tEl.addEventListener("click",e=>{const b=e.target.closest(".topic");if(b)pick(b.dataset.t);});
    sent.addEventListener("input",()=>{if(S.topic){S.sent[S.topic]=sent.value;save();}});
    if(S.topic&&SC.items.find(t=>t.id===S.topic))pick(S.topic);
  }else{
    const sel=$("scenFuel"),why=$("scenReason");
    sel.innerHTML=`<option value="">${SC.choose||"Choose an option"}</option>`+SC.options.map((f,i)=>`<option value="${i}">${f}</option>`).join("");
    const cur=()=>S.scen[S.topic]=S.scen[S.topic]||{};
    const pick=id=>{S.topic=id;save();const T=SC.items.find(t=>t.id===id);
      tEl.querySelectorAll(".topic").forEach(b=>b.setAttribute("aria-pressed",b.dataset.t===id));
      body.hidden=false;$("topicDesc").innerHTML=T.desc;
      const c=S.scen[id]||{};sel.value=c.fuel===undefined?"":c.fuel;why.value=c.why||"";
      $("topicLinks").innerHTML=T.answer;};
    tEl.addEventListener("click",e=>{const b=e.target.closest(".topic");if(b)pick(b.dataset.t);});
    sel.addEventListener("change",()=>{if(S.topic){cur().fuel=sel.value;save();}});
    why.addEventListener("input",()=>{if(S.topic){cur().why=why.value;save();}});
    if(S.topic&&SC.items.find(t=>t.id===S.topic))pick(S.topic);
  }
}

/* Worked solution revealed one step at a time */
const RV=C.reveal;
if(RV){
  let k=0;const box=$(RV.box),btn=$(RV.btn);
  btn.addEventListener("click",()=>{if(k<RV.steps.length){box.insertAdjacentHTML("beforeend",`<div class="worked"><div class="line">${RV.steps[k]}</div></div>`);k++;}if(k>=RV.steps.length)btn.hidden=true;});
}

/* Check quiz */
const Q=C.quiz;
if(Q){
  const qEl=$("quiz");
  qEl.innerHTML=Q.map((x,i)=>`<div class="q" id="${x.id}"><b>${i+1}. ${x.q}</b><div class="opts">${x.o.map((o,j)=>`<button class="opt" type="button" data-q="${x.id}" data-j="${j}" aria-pressed="false">${o}</button>`).join("")}</div><div class="fb" hidden></div></div>`).join("");
  const mark=(id,j)=>{const x=Q.find(q=>q.id===id),box=$(id);S.quiz[id]=j;save();
    box.querySelectorAll(".opt").forEach(b=>{const k=+b.dataset.j;b.setAttribute("aria-pressed",k===j);b.classList.toggle("right",k===x.a&&j===x.a);b.classList.toggle("wrong",k===j&&j!==x.a);});
    const f=box.querySelector(".fb");f.hidden=false;f.className="fb "+(j===x.a?"ok":"no");
    f.innerHTML="<p>"+(j===x.a?`<b>Correct.</b> ${x.why}`:`<b>Not quite.</b> The answer is ${x.o[x.a]}. ${x.why}`)+"</p>";};
  qEl.addEventListener("click",e=>{const b=e.target.closest(".opt");if(b)mark(b.dataset.q,+b.dataset.j);});
  Object.entries(S.quiz).forEach(([id,j])=>{if(Q.find(q=>q.id===id))mark(id,j);});
}

/* Key words drawer */
const dr=$("drawer"),sc=$("scrim");
const openD=o=>{dr.hidden=!o;sc.hidden=!o;if(o)$("kwClose").focus();else $("kwBtn").focus();};
$("kwBtn").addEventListener("click",()=>openD(true));$("kwClose").addEventListener("click",()=>openD(false));sc.addEventListener("click",()=>openD(false));

/* Board view */
const bd=$("board"),bsc=$("bSc"),bscBtn=$("bScBtn");
const openB=o=>{bd.hidden=!o;document.body.style.overflow=o?"hidden":"";if(o)$("boardClose").focus();else $("boardBtn").focus();};
$("boardBtn").addEventListener("click",()=>openB(true));$("boardClose").addEventListener("click",()=>openB(false));
bscBtn.addEventListener("click",()=>{bsc.hidden=!bsc.hidden;bscBtn.textContent=bsc.hidden?"Show success criteria":"Hide success criteria";});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!bd.hidden)openB(false);else if(!dr.hidden)openD(false);}});

/* Open at the first unfinished part */
progress();
const first=PARTS.find(([p])=>!S.done[p]);
const ids=PARTS.map(([p])=>p);
show(S.cur&&ids.includes(S.cur)&&!S.done[S.cur]?S.cur:(first?first[0]:ids[ids.length-1]));
})();
