const COLS=["Backlog","To Do (This Sprint)","In Progress","Testing","Done"];
const SEED=[
 {id:1,t:"As a student, I want to log in with my email so that I can place orders securely.",pts:2,col:3,sprint:1,blocked:false,dod:false,cm:[]},
 {id:2,t:"As a student, I want to browse cafeteria menus so that I can choose what to eat.",pts:3,col:2,sprint:1,blocked:false,dod:false,cm:[]},
 {id:3,t:"As a student, I want to view my shopping cart so that I can review items and the total before paying.",pts:3,col:2,sprint:1,blocked:true,dod:false,cm:["Scrum Master, I cannot save items to the cart because the university database server is offline for maintenance, so this story is blocked until it is back."]},
 {id:4,t:"As a student, I want to check out and choose my lecture hall so that my food is delivered to me.",pts:4,col:0,sprint:2,blocked:false,dod:false,cm:[]},
 {id:5,t:"As a student, I want to track my order status so that I know when to expect my food.",pts:3,col:0,sprint:2,blocked:false,dod:false,cm:[]},
 {id:6,t:"As a student, I want a Dark Mode UI theme so that I can use the app comfortably during late-night studying. (Added Day 3 – scheduled for Sprint 2 planning)",pts:2,col:0,sprint:2,blocked:false,dod:false,cm:[]}
];
const $=s=>document.querySelector(s);
let cards=JSON.parse(localStorage.getItem("board")||"null")||SEED,drag=null,pend=null;
if(!localStorage.getItem("board"))cards.filter(c=>c.sprint===1&&c.col===0).forEach(c=>c.col=1);
const save=()=>localStorage.setItem("board",JSON.stringify(cards));
function resetBoard(){localStorage.removeItem("board");location.reload()}
function draw(){
 const n=cards.filter(c=>c.col===2).length;$("#warn").hidden=n<=2;
 $("#board").innerHTML=COLS.map((c,i)=>`<div class="col ${i===2&&n>2?"limit":""}" data-i="${i}" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="drop(event,${i})">
  <h3>${c}<span>${cards.filter(k=>k.col===i).length}${i===2?" / 2":""}</span></h3>
  ${cards.filter(k=>k.col===i).map(k=>`<div class="k ${k.blocked?"blocked":""}" draggable="true" ondragstart="drag=${k.id}" onclick="openCard(${k.id})"><span class="pts">${k.pts}</span><b>#${k.id}</b> ${k.t}<br>${k.blocked?`<span class="tag">🚫 BLOCKED</span>`:""}${k.cm.length?` <span class="muted">💬 ${k.cm.length}</span>`:""}</div>`).join("")}</div>`).join("");
}
function drop(e,i){e.currentTarget.classList.remove("over");const k=cards.find(c=>c.id===drag);if(!k||k.col===i)return;
 if(i===4&&!k.dod){pend={k,from:k.col};$("#dodTitle").textContent="Card #"+k.id+": all three must be ticked before it can be Done.";document.querySelectorAll(".dc").forEach(c=>c.checked=false);$("#dodErr").textContent="";$("#dod").classList.add("open");return}
 k.col=i;if(i<4)k.dod=false;save();draw()}
function dodOk(){if([...document.querySelectorAll(".dc")].some(c=>!c.checked))return $("#dodErr").textContent="Blocked: tick every Definition of Done item first.";
 pend.k.col=4;pend.k.dod=true;pend=null;$("#dod").classList.remove("open");save();draw()}
function dodCancel(){pend=null;$("#dod").classList.remove("open")}
function openCard(id){const k=cards.find(c=>c.id===id);
 $("#cardSheet").innerHTML=`<h3 style="margin-top:0">Card #${k.id} · ${k.pts} pts</h3><p>${k.t}</p>${k.cm.map(c=>`<div class="cm">💬 ${c}</div>`).join("")}
 <input id="nc" placeholder="Write a comment…"><div class="row"><button class="ghost" onclick="flag(${id})">${k.blocked?"Remove block":"🚫 Flag as blocked"}</button><button class="p" onclick="comment(${id})">Comment</button></div><p><button class="ghost" onclick="$('#cardM').classList.remove('open')">Close</button></p>`;
 $("#cardM").classList.add("open")}
function flag(id){const k=cards.find(c=>c.id===id);k.blocked=!k.blocked;save();draw();openCard(id)}
function comment(id){const v=$("#nc").value.trim();if(!v)return;cards.find(c=>c.id===id).cm.push(v);save();draw();openCard(id)}
draw();
