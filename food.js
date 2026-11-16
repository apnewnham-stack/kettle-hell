/* Kettle Hell: Food tab. Rough calorie tracking, saved on the phone with the rest of the app's data
   (so it's in the backup file). Describe-it / photo estimates use the artifact's built-in Claude (window.claude.use("sample")). */
(() => {
"use strict";
const KH = window.KH; if (!KH) return;
const {Store, toast, esc, todayKey, dkey, parseKey, fmtDay} = KH;
const $ = s => document.querySelector(s);

/* [name, portion, kcal, group] — rough, typical values */
const FOODS = [
  // Breakfast
  ["Weet-Bix / wheat biscuits with milk","2 biscuits + ½ cup milk",190,"Breakfast"],
  ["Porridge with milk","1 bowl",250,"Breakfast"],
  ["Cornflakes with milk","1 bowl",200,"Breakfast"],
  ["Muesli with milk","1 bowl",350,"Breakfast"],
  ["Granola with yoghurt","1 bowl",400,"Breakfast"],
  ["Toast with butter","1 slice",120,"Breakfast"],
  ["Toast with Vegemite","1 slice",100,"Breakfast"],
  ["Toast with peanut butter","1 slice",190,"Breakfast"],
  ["Toast with jam","1 slice",130,"Breakfast"],
  ["Toast with avocado","1 slice",220,"Breakfast"],
  ["Egg, boiled or poached","1 egg",75,"Breakfast"],
  ["Egg, fried","1 egg",95,"Breakfast"],
  ["Scrambled eggs","2 eggs",200,"Breakfast"],
  ["Omelette","2 eggs + filling",280,"Breakfast"],
  ["Bacon","2 rashers",160,"Breakfast"],
  ["Big breakfast (eggs, bacon, toast, sausage)","1 plate",850,"Breakfast"],
  ["Bacon and egg roll","1 roll",450,"Breakfast"],
  ["Pancakes with syrup","3 pancakes",450,"Breakfast"],
  ["Croissant","1",230,"Breakfast"],
  ["Banana bread with butter","1 slice",350,"Breakfast"],
  ["Muffin (café)","1",420,"Breakfast"],
  // Drinks
  ["Flat white / latte","regular",150,"Drinks"],
  ["Cappuccino","regular",120,"Drinks"],
  ["Long black / espresso","1 cup",5,"Drinks"],
  ["Coffee, milk and 1 sugar","1 mug",60,"Drinks"],
  ["Tea with milk","1 mug",20,"Drinks"],
  ["Hot chocolate","regular",250,"Drinks"],
  ["Orange juice","1 glass (250 ml)",110,"Drinks"],
  ["Milk","1 glass (250 ml)",160,"Drinks"],
  ["Soft drink (Coke etc.)","375 ml can",160,"Drinks"],
  ["Diet soft drink","375 ml can",1,"Drinks"],
  ["Energy drink","250 ml can",115,"Drinks"],
  ["Sports drink","600 ml bottle",150,"Drinks"],
  ["Protein shake (with water)","1 scoop",120,"Drinks"],
  ["Protein shake (with milk)","1 scoop + 300 ml milk",300,"Drinks"],
  ["Smoothie","large",350,"Drinks"],
  ["Beer, full strength","schooner (425 ml)",180,"Drinks"],
  ["Beer, full strength","pint",240,"Drinks"],
  ["Beer, mid strength","375 ml can",110,"Drinks"],
  ["Wine, red or white","1 glass (150 ml)",125,"Drinks"],
  ["Spirit and mixer","1 drink",180,"Drinks"],
  ["Cider","pint",250,"Drinks"],
  // Lunch and dinner
  ["Sandwich, ham and salad","1",320,"Meals"],
  ["Sandwich, chicken and mayo","1",420,"Meals"],
  ["Toastie, ham and cheese","1",420,"Meals"],
  ["Wrap, chicken","1",450,"Meals"],
  ["Sushi roll","1 hand roll",200,"Meals"],
  ["Salad with chicken","1 bowl",400,"Meals"],
  ["Garden salad, no dressing","1 bowl",60,"Meals"],
  ["Soup","1 bowl",200,"Meals"],
  ["Meat pie","1",450,"Meals"],
  ["Sausage roll","1",350,"Meals"],
  ["Steak, grilled","200 g",450,"Meals"],
  ["Chicken breast, grilled","150 g",250,"Meals"],
  ["Roast chicken with skin","¼ chicken",450,"Meals"],
  ["Salmon fillet","150 g",310,"Meals"],
  ["Fish and chips","1 serve",850,"Meals"],
  ["Lamb chops","2 chops",400,"Meals"],
  ["Sausages","2 sausages",350,"Meals"],
  ["Mince (beef), cooked","150 g",370,"Meals"],
  ["Spaghetti bolognese","1 plate",650,"Meals"],
  ["Pasta with creamy sauce","1 plate",800,"Meals"],
  ["Lasagne","1 piece",600,"Meals"],
  ["Stir-fry with rice","1 plate",600,"Meals"],
  ["Curry with rice","1 plate",750,"Meals"],
  ["Fried rice","1 plate",650,"Meals"],
  ["Pad thai","1 plate",700,"Meals"],
  ["Roast dinner (meat + veg + gravy)","1 plate",700,"Meals"],
  ["Shepherd's pie","1 plate",500,"Meals"],
  ["Chilli con carne","1 bowl",450,"Meals"],
  ["Tacos","2 tacos",400,"Meals"],
  ["Burrito","1",700,"Meals"],
  ["Rice, cooked","1 cup",210,"Meals"],
  ["Pasta, cooked, plain","1 cup",220,"Meals"],
  ["Potatoes, boiled or mashed","1 cup",180,"Meals"],
  ["Roast potatoes","4 pieces",250,"Meals"],
  ["Vegetables, steamed","1 cup",50,"Meals"],
  ["Bread roll","1",180,"Meals"],
  // Takeaway
  ["Burger (fast food, regular)","1",500,"Takeaway"],
  ["Big burger (double / with bacon)","1",800,"Takeaway"],
  ["Fries / chips","medium",350,"Takeaway"],
  ["Fries / chips","large",450,"Takeaway"],
  ["Chicken nuggets","6 pieces",270,"Takeaway"],
  ["Fried chicken","2 pieces",500,"Takeaway"],
  ["Pizza","1 slice",280,"Takeaway"],
  ["Pizza","whole medium",1900,"Takeaway"],
  ["Kebab / souvlaki","1",750,"Takeaway"],
  ["Hot dog","1",300,"Takeaway"],
  ["Subway-style sub","6 inch",400,"Takeaway"],
  ["Noodle box","1 box",650,"Takeaway"],
  ["Dim sum / dumplings","6 pieces",350,"Takeaway"],
  // Snacks
  ["Banana","1 medium",105,"Snacks"],
  ["Apple","1 medium",95,"Snacks"],
  ["Orange","1",60,"Snacks"],
  ["Grapes","1 cup",100,"Snacks"],
  ["Berries","1 cup",70,"Snacks"],
  ["Yoghurt, flavoured","1 tub (170 g)",150,"Snacks"],
  ["Greek yoghurt, plain","1 cup",220,"Snacks"],
  ["Cheese","1 slice / 20 g",80,"Snacks"],
  ["Cheese and crackers","small plate",250,"Snacks"],
  ["Nuts, mixed","small handful (30 g)",180,"Snacks"],
  ["Peanut butter","1 tablespoon",95,"Snacks"],
  ["Protein bar","1 bar",220,"Snacks"],
  ["Muesli bar","1 bar",130,"Snacks"],
  ["Crisps / chips (packet)","small packet (45 g)",230,"Snacks"],
  ["Chocolate bar","1 bar (50 g)",250,"Snacks"],
  ["Chocolate biscuit (Tim Tam etc.)","1 biscuit",95,"Snacks"],
  ["Plain biscuit","2 biscuits",140,"Snacks"],
  ["Ice cream","2 scoops",270,"Snacks"],
  ["Cake","1 slice",350,"Snacks"],
  ["Donut","1",270,"Snacks"],
  ["Lollies / sweets","small handful",150,"Snacks"],
  ["Rice cakes","2 cakes",70,"Snacks"],
  ["Popcorn","1 cup",35,"Snacks"],
  ["Boiled eggs","2 eggs",150,"Snacks"],
  ["Tuna, tin","95 g tin",100,"Snacks"],
  ["Hummus with carrot","small tub",200,"Snacks"],
  ["Avocado","½ avocado",160,"Snacks"],
];

const MEALS = ["Breakfast","Lunch","Dinner","Snacks"];
const mealFor = d => { const h = d.getHours(); return h < 11 ? "Breakfast" : h < 15 ? "Lunch" : h >= 17 && h < 22 ? "Dinner" : "Snacks"; };
const fset = () => ({kind:"foodsettings", goal:0, mine:[], ...(Store.get("food-settings") || {})});
const saveF = patch => Store.put("food-settings", {...fset(), ...patch, kind:"foodsettings"});
const entries = day => Store.all("food").filter(f => f.date === day).sort((a,b) => a.ts - b.ts);
const kcalOf = f => Math.round((+f.kcal || 0) * (+f.qty || 1));
const dayTotal = day => entries(day).reduce((a,f) => a + kcalOf(f), 0);
let sampler = null;
async function getSampler(){
  if (sampler) return sampler;
  if (!window.claude || !window.claude.use) throw new Error("Claude estimates only work inside the Claude app version of Kettle Hell.");
  sampler = await window.claude.use("sample");
  return sampler;
}
const fmtQty = q => q === 0.5 ? "½" : q === 1.5 ? "1½" : q === 2.5 ? "2½" : String(q);

let day = todayKey();
let query = "";
let photoItems = null; // [{name, portion, kcal, on}]

function addFood({name, portion = "", kcal, src = "list", qty = 1, desc = ""}){
  const d = parseKey(day), now = new Date(); d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
  const ts = d.getTime() + Math.floor(Math.random() * 1000);
  const meal = day === todayKey() ? mealFor(now) : mealFor(d);
  Store.put("f-" + ts, {kind:"food", date:day, ts, name, portion, desc, kcal:Math.round(+kcal || 0), qty, meal, src});
  toast(`Added ${name} · ${Math.round(kcal * qty)} kcal`);
}

/* ---------- Layout (built once) ---------- */
const view = $("#v-food");
view.innerHTML = `
  <style>
    .fd-total{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
    .fd-total b{font:800 52px/1 var(--display);font-variant-numeric:tabular-nums}
    .fd-bar{height:10px;border-radius:99px;background:var(--sunk);overflow:hidden}
    .fd-bar i{display:block;height:100%;background:var(--good);border-radius:99px}
    .fd-bar.over i{background:var(--bad)}
    .fd-list{display:flex;flex-direction:column}
    .fd-item{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line);background:transparent;border-left:0;border-right:0;border-bottom:0;text-align:left;width:100%}
    .fd-item:first-child{border-top:0}
    .fd-item .k{font:700 18px/1 var(--display);font-variant-numeric:tabular-nums;white-space:nowrap}
    .fd-item p{margin:2px 0 0;font-size:14px;color:var(--muted)}
    .fd-plus{flex:none;width:36px;height:36px;border-radius:50%;background:var(--accent);color:var(--accent-fg);display:flex;align-items:center;justify-content:center;font:700 22px/1 var(--body)}
    .fd-qty{display:flex;align-items:center;gap:2px}
    .fd-qty button{width:32px;height:32px;border-radius:8px;border:1px solid var(--line);background:var(--sunk);font-weight:700;padding:0}
    .fd-qty span{min-width:26px;text-align:center;font-weight:600;font-variant-numeric:tabular-nums}
    .fd-meal{font:700 13px/1 var(--body);text-transform:uppercase;letter-spacing:.08em;color:var(--muted);display:flex;justify-content:space-between;padding-top:14px}
    .fd-meal:first-child{padding-top:0}
    .fd-week{width:100%;height:auto;display:block}
    .fd-week text{fill:var(--muted);font:12px var(--body)}
    .fd-photo img{width:100%;max-height:240px;object-fit:cover;border-radius:10px}
    .fd-pi{display:grid;grid-template-columns:28px 1fr 86px;gap:8px;align-items:center;padding:8px 0;border-top:1px solid var(--line)}
    .fd-pi:first-child{border-top:0}
    .fd-pi input[type=checkbox]{width:22px;height:22px;min-height:0}
    .fd-pi input[type=number]{padding:6px 8px;min-height:38px}
    .fd-pi p{margin:2px 0 0;font-size:13px;color:var(--muted)}
  </style>
  <div class="card">
    <div class="cal-head">
      <button class="icon-btn" id="fd-prev" aria-label="Previous day">‹</button>
      <h2 id="fd-day"></h2>
      <button class="icon-btn" id="fd-next" aria-label="Next day">›</button>
    </div>
    <div class="fd-total"><b id="fd-sum">0</b><span class="muted" id="fd-goaltxt">kcal</span></div>
    <div class="fd-bar" id="fd-bar" hidden><i></i></div>
    <button class="btn sm ghost" id="fd-goalbtn" style="align-self:flex-start">Set a daily goal</button>
    <form id="fd-goalform" class="row" hidden>
      <input id="fd-goal" type="number" inputmode="numeric" min="0" max="9000" step="50" placeholder="e.g. 2200" style="flex:1;width:auto">
      <button class="btn primary" type="submit">Save</button>
    </form>
  </div>

  <div class="card">
    <h2>Add food</h2>
    <form id="fd-ask" class="stack">
      <div class="field"><label class="label" for="fd-desc">Describe what you ate</label>
        <textarea id="fd-desc" placeholder="e.g. two slices of toast with butter and a flat white"></textarea></div>
      <div id="fd-thumb" class="fd-photo" hidden></div>
      <div class="row" style="flex-wrap:nowrap"><button class="btn primary" type="submit" id="fd-askbtn" style="flex:1">Estimate calories</button><button class="btn" type="button" id="fd-photobtn">📷 Photo</button></div>
    </form>
    <input type="file" id="fd-file" accept="image/*" capture="environment" hidden>
    <div id="fd-photo" class="stack fd-photo" hidden></div>
    <p class="label" style="margin:6px 0 0">Or pick from the list</p>
    <input id="fd-q" type="search" placeholder="Search foods, e.g. pie, latte, banana" autocomplete="off">
    <div id="fd-results" class="fd-list"></div>
    <button class="btn sm ghost" id="fd-custombtn" style="align-self:flex-start">+ Type in your own food</button>
    <form id="fd-custom" class="stack" hidden>
      <div class="field"><label class="label" for="fd-cname">What was it?</label><input id="fd-cname" required placeholder="e.g. Mum's lasagne"></div>
      <div class="grid2">
        <div class="field"><label class="label" for="fd-ckcal">Calories (guess is fine)</label><input id="fd-ckcal" type="number" inputmode="numeric" min="0" max="5000" required placeholder="kcal"></div>
        <div class="field"><label class="label" for="fd-cport">Portion (optional)</label><input id="fd-cport" placeholder="e.g. 1 plate"></div>
      </div>
      <label class="row" style="gap:10px"><input type="checkbox" id="fd-csave" checked style="width:22px;height:22px;min-height:0"> Save it to my foods for next time</label>
      <div class="row"><button class="btn primary" type="submit">Add</button><button class="btn ghost" type="button" id="fd-ccancel">Cancel</button></div>
    </form>
  </div>

  <div class="card">
    <h3>Eaten</h3>
    <div id="fd-eaten"></div>
  </div>

  <div class="card">
    <h3>Last 7 days</h3>
    <div id="fd-week"></div>
  </div>`;

/* ---------- Rendering ---------- */
function render(){
  const isToday = day === todayKey();
  $("#fd-day").textContent = isToday ? "Today" : fmtDay(day);
  $("#fd-next").disabled = isToday; $("#fd-next").style.visibility = isToday ? "hidden" : "";
  const total = dayTotal(day), goal = +fset().goal || 0;
  $("#fd-sum").textContent = total.toLocaleString();
  if (goal) {
    const left = goal - total;
    $("#fd-goaltxt").textContent = left >= 0 ? `of ${goal.toLocaleString()} kcal · ${left.toLocaleString()} left` : `of ${goal.toLocaleString()} kcal · ${(-left).toLocaleString()} over`;
    $("#fd-bar").hidden = false; $("#fd-bar").classList.toggle("over", left < 0);
    $("#fd-bar i").style.width = Math.min(100, total / goal * 100) + "%";
    $("#fd-goalbtn").textContent = "Change goal";
  } else { $("#fd-goaltxt").textContent = "kcal"; $("#fd-bar").hidden = true; $("#fd-goalbtn").textContent = "Set a daily goal"; }
  renderResults(); renderEaten(); renderWeek();
}

function recent(){
  const seen = new Map();
  Store.all("food").sort((a,b) => b.ts - a.ts).forEach(f => { const k = f.name + "|" + f.kcal; if (!seen.has(k)) seen.set(k, f); });
  return [...seen.values()].slice(0, 8).map(f => ({name:f.name, portion:f.portion, desc:f.desc || "", kcal:f.kcal, src:f.src === "photo" ? "custom" : f.src}));
}
function allFoods(){
  return [...fset().mine.map(m => ({...m, mine:true})), ...FOODS.map(([name, portion, kcal, group]) => ({name, portion, kcal, group}))];
}
let shown = [];
function renderResults(){
  const q = query.trim().toLowerCase();
  let head = "";
  if (!q) { shown = recent(); head = shown.length ? `<p class="label" style="margin:0 0 4px">Recent</p>` : `<p class="muted" style="margin:0">Foods you add show up here for one-tap logging next time.</p>`; }
  else {
    const words = q.split(/\s+/);
    shown = allFoods().filter(f => words.every(w => (f.name + " " + (f.group || "") + " " + (f.desc || "")).toLowerCase().includes(w))).slice(0, 25);
    if (!shown.length) head = `<p class="muted" style="margin:0">Nothing matches “${esc(query)}”. Describe it in the box above and let Claude estimate it.</p>`;
  }
  $("#fd-results").innerHTML = head + shown.map((f, i) => `
    <button class="fd-item" data-add="${i}" type="button">
      <div><h3>${esc(f.name)}${f.mine ? ' <span class="muted" style="font-weight:400">· mine</span>' : ""}</h3><p>${esc(f.portion || "1 serve")}</p>${f.desc ? `<p>${esc(f.desc)}</p>` : ""}</div>
      <div class="row" style="flex-wrap:nowrap"><span class="k">${f.kcal}</span><span class="fd-plus" aria-hidden="true">+</span></div>
    </button>`).join("");
}

function renderEaten(){
  const list = entries(day);
  if (!list.length) { $("#fd-eaten").innerHTML = `<p class="muted" style="margin:0">Nothing logged ${day === todayKey() ? "yet today" : "on this day"}.</p>`; return; }
  $("#fd-eaten").innerHTML = MEALS.map(m => {
    const its = list.filter(f => (f.meal || "Snacks") === m); if (!its.length) return "";
    return `<div class="fd-meal"><span>${m}</span><span>${its.reduce((a,f)=>a+kcalOf(f),0).toLocaleString()} kcal</span></div>` + its.map(f => `
      <div class="entry"><div class="body"><h3>${esc(f.name)}</h3><p>${esc([f.portion, kcalOf(f) + " kcal", f.src === "photo" ? "Claude estimate" : ""].filter(Boolean).join(" · "))}</p></div>
        <div class="fd-qty"><button data-q="${esc(f.id)}" data-d="-0.5" aria-label="Less">−</button><span>×${fmtQty(+f.qty || 1)}</span><button data-q="${esc(f.id)}" data-d="0.5" aria-label="More">+</button></div>
        <span class="confirm" data-wrap="${esc(f.id)}"><button class="icon-btn" data-askdel="${esc(f.id)}" aria-label="Delete">🗑</button></span></div>`).join("");
  }).join("");
}

function renderWeek(){
  const goal = +fset().goal || 0, days = [];
  for (let i = 6; i >= 0; i--) { const d = parseKey(day); d.setDate(d.getDate() - i); const k = dkey(d); days.push({k, d, t:dayTotal(k)}); }
  const logged = days.filter(x => x.t > 0);
  const avg = logged.length ? Math.round(logged.reduce((a,x) => a + x.t, 0) / logged.length) : 0;
  const W = 340, H = 150, B = 22, T = 16, max = Math.max(goal, ...days.map(x => x.t), 500) * 1.1;
  const bw = (W - 8) / 7, Y = v => T + (H - T - B) * (1 - v / max);
  const bars = days.map((x, i) => {
    const y = Y(x.t), col = goal && x.t > goal ? "var(--bad)" : x.k === day ? "var(--accent)" : "var(--muted)";
    return `<rect x="${4 + i*bw + 6}" y="${y}" width="${bw - 12}" height="${Math.max(0, H - B - y)}" rx="4" fill="${col}" opacity="${x.k === day ? 1 : .55}"/>
      ${x.t ? `<text x="${4 + i*bw + bw/2}" y="${y - 4}" text-anchor="middle">${x.t >= 1000 ? (x.t/1000).toFixed(1) + "k" : x.t}</text>` : ""}
      <text x="${4 + i*bw + bw/2}" y="${H - 6}" text-anchor="middle">${x.d.toLocaleDateString(undefined, {weekday:"short"})}</text>`;
  }).join("");
  const gl = goal ? `<line x1="4" x2="${W-4}" y1="${Y(goal)}" y2="${Y(goal)}" stroke="var(--good)" stroke-dasharray="4 4" stroke-width="1.5"/>` : "";
  $("#fd-week").innerHTML = `<div class="summary" style="margin-bottom:8px"><div class="stat"><span class="label">Daily average</span><b>${avg ? avg.toLocaleString() : "–"}<small style="font-size:16px"> kcal</small></b></div>
    <div class="stat"><span class="label">Days logged</span><b>${logged.length}<small style="font-size:16px"> of 7</small></b></div></div>
    <svg class="fd-week" viewBox="0 0 ${W} ${H}" role="img" aria-label="Calories for the last 7 days">${gl}${bars}</svg>`;
}

/* ---------- Events ---------- */
$("#fd-prev").onclick = () => { const d = parseKey(day); d.setDate(d.getDate() - 1); day = dkey(d); render(); };
$("#fd-next").onclick = () => { const d = parseKey(day); d.setDate(d.getDate() + 1); if (dkey(d) <= todayKey()) { day = dkey(d); render(); } };
$("#fd-goalbtn").onclick = () => { $("#fd-goalform").hidden = false; $("#fd-goal").value = fset().goal || ""; $("#fd-goal").focus(); };
$("#fd-goalform").onsubmit = e => { e.preventDefault(); $("#fd-goalform").hidden = true; saveF({goal: Math.max(0, Math.round(+$("#fd-goal").value || 0))}); toast("Goal saved"); };
$("#fd-q").oninput = e => { query = e.target.value; renderResults(); };
$("#fd-results").onclick = e => { const b = e.target.closest("[data-add]"); if (!b) return; const f = shown[+b.dataset.add]; if (f) addFood({...f, src: f.mine ? "custom" : (f.src || "list")}); };
$("#fd-custombtn").onclick = () => { $("#fd-custom").hidden = false; $("#fd-cname").value = query; $("#fd-cname").focus(); };
$("#fd-ccancel").onclick = () => { $("#fd-custom").hidden = true; };
$("#fd-custom").onsubmit = e => {
  e.preventDefault();
  const name = $("#fd-cname").value.trim(), kcal = Math.round(+$("#fd-ckcal").value || 0), portion = $("#fd-cport").value.trim();
  if (!name) return;
  if ($("#fd-csave").checked) { const s = fset(); saveF({mine: [{name, portion, kcal}, ...s.mine.filter(m => m.name.toLowerCase() !== name.toLowerCase())].slice(0, 100)}); }
  addFood({name, portion, kcal, src:"custom"});
  $("#fd-custom").reset(); $("#fd-csave").checked = true; $("#fd-custom").hidden = true; query = ""; $("#fd-q").value = ""; render();
};
$("#fd-eaten").onclick = e => {
  const b = e.target.closest("[data-q]"); if (!b) return;
  const f = Store.get(b.dataset.q); if (!f) return;
  const q = Math.max(0.5, Math.min(10, (+f.qty || 1) + +b.dataset.d));
  Store.put(b.dataset.q, {...f, qty:q});
};
/* ---------- Claude estimate (description and/or photo) ---------- */
let photoImg = null;
const closeResults = () => { photoItems = null; $("#fd-photo").hidden = true; $("#fd-photo").innerHTML = ""; };
const clearPhoto = () => { photoImg = null; $("#fd-thumb").hidden = true; $("#fd-thumb").innerHTML = ""; };
$("#fd-photobtn").onclick = () => $("#fd-file").click();
$("#fd-ask").onsubmit = e => {
  e.preventDefault();
  const text = $("#fd-desc").value.trim();
  if (!text && !photoImg) { toast("Describe what you ate, or add a photo"); $("#fd-desc").focus(); return; }
  askClaude(photoImg, text);
};
$("#fd-thumb").addEventListener("click", e => { if (e.target.id === "fd-thumbx") clearPhoto(); });
$("#fd-photo").addEventListener("click", e => {
  if (e.target.id === "fd-photoclose") closeResults();
  if (e.target.id === "fd-photoadd") {
    $$p(".fd-pi").forEach((row, i) => { photoItems[i].on = row.querySelector("input[type=checkbox]").checked; photoItems[i].kcal = Math.round(+row.querySelector("input[type=number]").value || 0); });
    const picked = photoItems.filter(p => p.on);
    if (!picked.length) { toast("Tick at least one item"); return; }
    if ($("#fd-save") && $("#fd-save").checked) {
      const s = fset(), names = new Set(picked.map(p => p.name.toLowerCase()));
      saveF({mine: [...picked.map(p => ({name:p.name, portion:p.portion, kcal:p.kcal, desc:p.desc})), ...s.mine.filter(m => !names.has(m.name.toLowerCase()))].slice(0, 200)});
    }
    picked.forEach(p => addFood({name:p.name, portion:p.portion, kcal:p.kcal, desc:p.desc, src:"photo"}));
    if (picked.length > 1) toast(`Added ${picked.length} items · ${picked.reduce((a,p)=>a+p.kcal,0)} kcal`);
    closeResults(); clearPhoto(); $("#fd-desc").value = "";
  }
});
const $$p = s => Array.from($("#fd-photo").querySelectorAll(s));

function shrink(file){
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const max = 1024, sc = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("img")); };
    img.src = url;
  });
}
$("#fd-file").onchange = async e => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  try { photoImg = await shrink(f); } catch(_) { toast("Couldn't read that photo"); return; }
  $("#fd-thumb").hidden = false;
  $("#fd-thumb").innerHTML = `<img src="${photoImg}" alt="Your meal"><button class="btn sm ghost" type="button" id="fd-thumbx">Remove photo</button>`;
  $("#fd-desc").placeholder = "Optional: anything the photo doesn't show, e.g. large serve, cooked in butter";
};

function toBlob(dataUrl){
  const [head, b64] = dataUrl.split(","), bin = atob(b64), arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], {type:(head.match(/data:([^;]+)/) || [])[1] || "image/jpeg"});
}
async function askClaude(dataUrl, text){
  const box = $("#fd-photo"); box.hidden = false;
  box.innerHTML = `<p class="muted" style="margin:0">Working it out…</p>`;
  const btn = $("#fd-askbtn"); btn.disabled = true;
  const prompt = `I'm logging what I ate in a calorie tracker. Rough numbers are fine.
${dataUrl ? "The photo shows what I ate." : ""}${text ? ` My description: "${text}".` : ""}
List each separate food or drink. For each one give:
- name: a short, tidy name I'd recognise in a list (e.g. "Toast with butter")
- portion: the amount I said, or a typical portion if I didn't say (e.g. "2 slices")
- kcal: your best single calorie estimate for that portion (a whole number)
- desc: one short line describing it, useful if I log it again (e.g. "White bread, toasted, thin spread of butter")
Reply with only JSON, no other text: {"items":[{"name":"","portion":"","kcal":0,"desc":""}],"note":"optional short sentence"}. If it isn't food or drink, reply {"items":[],"note":"why"}.`;
  try {
    const sample = await getSampler();
    const opts = dataUrl ? {images:[toBlob(dataUrl)]} : undefined;
    const res = await sample(prompt, opts);
    const out = String((res && res.text) || res || "");
    const o = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
    photoItems = (o.items || []).map(it => ({name:String(it.name || "Food").slice(0, 60), portion:String(it.portion || "").slice(0, 40),
      desc:String(it.desc || "").slice(0, 120), kcal:Math.max(0, Math.round(+it.kcal || 0)), on:true}));
    showPhotoItems(o.note);
  } catch(err) {
    const msg = err && err.message && !/JSON|Unexpected|position/.test(err.message) ? err.message : (navigator.onLine ? "Couldn't get an estimate that time. Try again." : "You're offline. Estimates need internet.");
    box.innerHTML = `<p style="margin:0;color:var(--bad)">${esc(msg)}</p><div class="row"><button class="btn sm ghost" type="button" id="fd-photoclose">Close</button></div>`;
  } finally { btn.disabled = false; }
}

function showPhotoItems(note){
  const box = $("#fd-photo");
  if (!photoItems.length) {
    box.innerHTML = `<p style="margin:0">${esc(note || "Couldn't spot any food in that.")}</p><div class="row"><button class="btn ghost" type="button" id="fd-photoclose">Close</button></div>`; return;
  }
  const total = photoItems.reduce((a,p) => a + p.kcal, 0);
  box.innerHTML = `
    <div class="fd-total"><b style="font-size:36px">${total.toLocaleString()}</b><span class="muted">kcal, roughly</span></div>
    ${note ? `<p class="muted" style="margin:0">${esc(note)}</p>` : ""}
    <div>${photoItems.map((p, i) => `<label class="fd-pi"><input type="checkbox" checked><div><h3>${esc(p.name)}</h3><p>${esc(p.portion)}</p>${p.desc ? `<p>${esc(p.desc)}</p>` : ""}</div>
      <input type="number" inputmode="numeric" min="0" max="5000" value="${p.kcal}" aria-label="Calories for ${esc(p.name)}"></label>`).join("")}</div>
    <label class="row" style="gap:10px;flex-wrap:nowrap"><input type="checkbox" id="fd-save" checked style="width:22px;height:22px;min-height:0;flex:none"> Save these to my foods for one-tap logging next time</label>
    <p class="muted" style="margin:0;font-size:14px">Untick anything that's wrong or fix a number, then add.</p>
    <div class="row"><button class="btn primary" type="button" id="fd-photoadd">Add to ${day === todayKey() ? "today" : "this day"}</button><button class="btn ghost" type="button" id="fd-photoclose">Cancel</button></div>`;
}

window.KHFood = {render};
render();
// Roll over to the new day if the app is left open overnight.
let lastToday = todayKey();
document.addEventListener("visibilitychange", () => { if (document.hidden) return; const t = todayKey(); if (t !== lastToday) { if (day === lastToday) day = t; lastToday = t; render(); } });
})();
