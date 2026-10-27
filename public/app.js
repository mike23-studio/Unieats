const RESTS=[
 {n:"Main Cafeteria",e:"🍛",eta:"15–25",fee:0,rate:4.6,tag:"Kenyan",items:[{id:1,n:"Chicken & Rice",p:250,e:"🍗"},{id:2,n:"Beef Stew & Ugali",p:200,e:"🥘"},{id:3,n:"Veggie Wrap",p:150,e:"🌯"}]},
 {n:"Tech Block Cafe",e:"🍔",eta:"10–20",fee:30,rate:4.4,tag:"Fast food",items:[{id:4,n:"Burger & Fries",p:350,e:"🍔"},{id:5,n:"Samosas (3)",p:90,e:"🥟"},{id:6,n:"Fresh Juice",p:100,e:"🧃"}]},
 {n:"Library Cafe",e:"☕",eta:"5–15",fee:20,rate:4.8,tag:"Drinks & snacks",items:[{id:7,n:"Chapati & Beans",p:120,e:"🫓"},{id:8,n:"Coffee",p:80,e:"☕"},{id:9,n:"Muffin",p:70,e:"🧁"}]}
];
const ALL=RESTS.flatMap(r=>r.items);
const HALLS=["Lecture Hall A","Lecture Hall B","Lecture Hall C","Science Lab 1","Library Annex"];
const STEPS=["Received","Preparing","Out for delivery","Delivered"];
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let state={user:store.get("user",null),cart:store.get("cart",[]),loc:store.get("loc",{hall:HALLS[0],note:""}),view:"login",msg:"",q:"",cat:"All"};
if(state.user)state.view="menu";
if(store.get("dark",false))document.body.classList.add("dark");
const $=s=>document.querySelector(s);
const money=n=>"KES "+n,total=()=>state.cart.reduce((a,i)=>a+i.p*i.q,0);
const locText=()=>state.loc.hall+(state.loc.note?" – "+state.loc.note:"");
function go(v,msg=""){state.view=v;state.msg=msg;render();scrollTo({top:0,behavior:"smooth"})}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),1800)}
function nav(){
 const c=state.cart.reduce((a,i)=>a+i.q,0);
 $("#nav").innerHTML=(state.user?`<a href="#" onclick="go('menu');return false">Menu</a><a href="#" onclick="go('orders');return false">Orders</a><button class="cartbtn" id="cartBtn" onclick="go('cart')">🛒 ${c}</button><button onclick="logout()">Logout</button>`:"")+`<button onclick="toggleDark()" aria-label="Toggle dark mode">🌓</button>`;
 $("#locLabel").textContent=locText();
}
function toggleDark(){document.body.classList.toggle("dark");store.set("dark",document.body.classList.contains("dark"))}
/* location */
function openLoc(){$("#locHall").innerHTML=HALLS.map(h=>`<option ${h===state.loc.hall?"selected":""}>${h}</option>`).join("");$("#locNote").value=state.loc.note;$("#gpsMsg").textContent="";$("#locModal").classList.add("open")}
function closeLoc(){$("#locModal").classList.remove("open")}
function saveLoc(){state.loc={hall:$("#locHall").value,note:$("#locNote").value.trim()};store.set("loc",state.loc);closeLoc();toast("Delivering to "+state.loc.hall);render()}
function useGPS(){
 const m=$("#gpsMsg");if(!navigator.geolocation){m.textContent="Location is not supported in this browser.";return}
 m.textContent="Finding you…";
 navigator.geolocation.getCurrentPosition(p=>{$("#locNote").value="GPS "+p.coords.latitude.toFixed(4)+", "+p.coords.longitude.toFixed(4);m.textContent="Got it! Pick the nearest hall and save."},()=>{m.textContent="Location blocked. Allow it in your browser or choose a hall."});
}
/* auth & cart */
function login(e){e.preventDefault();const em=$("#em").value.trim(),pw=$("#pw").value;
 if(!/^\S+@\S+\.\S+$/.test(em)||pw.length<4)return go("login","Enter a valid email and a password of at least 4 characters.");
 state.user={email:em};store.set("user",state.user);go("menu");toast("Welcome back 👋")}
function logout(){state.user=null;store.set("user",null);go("login")}
function add(id){const it=ALL.find(i=>i.id===id),ex=state.cart.find(i=>i.id===id);
 ex?ex.q++:state.cart.push({...it,q:1});store.set("cart",state.cart);nav();$("#cartBtn").classList.add("bump");toast(it.e+" "+it.n+" added")}
function chg(id,d){const it=state.cart.find(i=>i.id===id);it.q+=d;if(it.q<=0)state.cart=state.cart.filter(i=>i.id!==id);store.set("cart",state.cart);render()}
function checkout(e){e.preventDefault();
 if(!state.cart.length)return go("cart","Your cart is empty.");
 const orders=store.get("orders",[]),o={id:Date.now().toString().slice(-6),items:state.cart,total:total(),hall:locText(),status:"Received",time:new Date().toLocaleString()};
 orders.unshift(o);store.set("orders",orders);state.cart=[];store.set("cart",[]);
 go("orders","Order #"+o.id+" placed! It will be delivered to "+o.hall+".");
 [["Preparing",4000],["Out for delivery",9000],["Delivered",15000]].forEach(([s,t])=>setTimeout(()=>{
  const all=store.get("orders",[]),x=all.find(z=>z.id===o.id);if(x){x.status=s;store.set("orders",all);if(state.view==="orders")render()}},t));
}
/* views */
function menuView(){
 const q=state.q.toLowerCase(),cats=["All",...new Set(RESTS.map(r=>r.tag))];
 const list=RESTS.filter(r=>state.cat==="All"||r.tag===state.cat).map(r=>({...r,items:r.items.filter(i=>i.n.toLowerCase().includes(q))})).filter(r=>r.items.length);
 return `<section class="hero"><i>🍕</i><i>🥗</i><i>🍩</i><h2>Hungry between lectures?</h2><p>Order from campus cafes. We bring it to <b>${locText()}</b>.</p>
 <div class="searchbar"><input id="q" value="${state.q}" placeholder="Search dishes…" oninput="state.q=this.value;renderList()"><button class="p" onclick="openLoc()">📍 Change</button></div></section>
 <div class="chips">${cats.map(c=>`<button class="chip ${c===state.cat?"on":""}" onclick="state.cat='${c}';render()">${c}</button>`).join("")}</div>
 <div id="list">${listHTML(list)}</div>`;
}
function listHTML(list){return list.length?list.map(r=>`<div class="rest-head"><div class="logo-e">${r.e}</div><div><h2>${r.n}<span class="badge">⭐ ${r.rate}</span></h2><div class="meta">${r.eta} min · ${r.fee?money(r.fee)+" delivery":"Free delivery"}</div></div></div>
 <div class="grid">${r.items.map(i=>`<div class="card dish"><div class="pic"><span>${i.e}</span></div><div class="body"><div><b>${i.n}</b><div class="muted">${money(i.p)}</div></div><button class="p" onclick="add(${i.id})">Add</button></div></div>`).join("")}</div>`).join(""):`<p class="muted">No dishes match “${state.q}”. Try another search.</p>`}
function renderList(){const q=state.q.toLowerCase();$("#list").innerHTML=listHTML(RESTS.filter(r=>state.cat==="All"||r.tag===state.cat).map(r=>({...r,items:r.items.filter(i=>i.n.toLowerCase().includes(q))})).filter(r=>r.items.length))}
function render(){
 nav();const a=$("#app"),m=state.msg?`<p class="${state.msg.includes("placed")?"ok":"err"}">${state.msg}</p>`:"";
 if(!state.user||state.view==="login"){
  a.innerHTML=`<div class="card auth"><h2>Student login</h2>${m}<form onsubmit="login(event)"><label for="em">Email</label><input id="em" type="email" placeholder="student@uni.ac.ke"><label for="pw">Password</label><input id="pw" type="password" placeholder="••••"><button class="p">Log in</button></form></div>`;
 }else if(state.view==="menu"){a.innerHTML=menuView();
 }else if(state.view==="cart"){
  a.innerHTML=`<h2>Your cart</h2>${m}`+(state.cart.length?state.cart.map(i=>`<div class="card row"><div><b>${i.e} ${i.n}</b><div class="muted">${money(i.p)} each</div></div><div><button class="s" onclick="chg(${i.id},-1)">−</button> <b>${i.q}</b> <button class="s" onclick="chg(${i.id},1)">+</button></div></div>`).join("")+`<h3>Total: ${money(total())}</h3><button class="p" onclick="go('checkout')">Go to checkout</button>`:`<p class="muted">Your cart is empty. <a href="#" onclick="go('menu');return false">Browse the menu</a>.</p>`);
 }else if(state.view==="checkout"){
  a.innerHTML=`<h2>Checkout</h2><div class="card"><div class="checkout-loc row"><div><b>📍 Deliver to</b><div>${locText()}</div></div><button class="ghost" type="button" onclick="openLoc()">Change</button></div><p>${state.cart.length} item(s) – <b>${money(total())}</b></p><form onsubmit="checkout(event)"><button class="p">Place order</button></form></div>`;
 }else if(state.view==="orders"){
  const os=store.get("orders",[]);
  a.innerHTML=`<h2>My orders</h2>${m}`+(os.length?os.map(o=>{const s=STEPS.indexOf(o.status),pct=s/3*100;
   return `<div class="card"><div class="row"><b>Order #${o.id}</b><span class="ok">${o.status}</span></div><div class="muted">${o.time} · 📍 ${o.hall}</div>
   <div class="track"><div class="fill" style="width:${pct}%"></div>${s<3?`<span class="rider" style="left:${pct}%">🛵</span>`:""}${STEPS.map((t,i)=>`<div class="step ${i<=s?"on":""} ${i===s?"now":""}"><b>${i<s||s===3?"✓":i+1}</b>${t}</div>`).join("")}</div>
   <div>${o.items.map(i=>i.q+"× "+i.n).join(", ")}</div><b>${money(o.total)}</b></div>`}).join(""):`<p class="muted">No orders yet. Your first one is a few taps away.</p>`);
 }
}
render();
