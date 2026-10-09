/* ==========================================================
   NUBA Accesorios · Lógica de la tienda
   (los productos están en js/products.js)
   ========================================================== */

/* ===== CONFIGURACIÓN: cambia estos datos ===== */
const CONFIG = {
  whatsapp: "573206503438",
  instagram: "nuba.accesorios.lei",
  instagramUrl: "https://www.instagram.com/nuba.accesorios.lei?stkn=MTgyOHRvaXpzdGJwOQ==",
  ciudad: "Medellín, Colombia"
};
const POLICIES = {
  compras: ["Políticas de compra", "Los pedidos se confirman por WhatsApp. Te indicamos disponibilidad, valor final y medios de pago antes de pagar."],
  envios: ["Envíos", "Enviamos a todo el país. El costo y el tiempo de entrega dependen de la transportadora y tu ciudad."],
  cambios: ["Cambios", "Si tu pedido llega con algún inconveniente, escríbenos pronto con fotos y lo revisamos contigo."]
};
const HERO_CATS = [{
  "cat": "Collares",
  "id": "cad734-104-0"
}, {
  "cat": "Aretes",
  "id": "are719-259-3"
}, {
  "cat": "Pulseras",
  "id": "pul344-206-0"
}, {
  "cat": "Anillos",
  "id": "ani161-190-2"
}, {
  "cat": "Cabello",
  "id": "cab164-a"
}, {
  "cat": "Tendencias",
  "id": "cad695-19-2"
}];
/* ===== Lógica ===== */
const $ = s => document.querySelector(s),
  money = n => n.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  });
const wa = t => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(t)}`;
let cat = "Todos",
  term = "",
  cart = {},
  sel = {};
try {
  cart = JSON.parse(localStorage.getItem("nuba-cart2") || "{}")
} catch (e) {}
const byId = id => PRODUCTS.find(p => p.id === id);
const main = p => p.img || p.variants[0].img;
const cur = (p, vi = 0) => {
  const v = p.variants ? p.variants[vi] : {};
  return {
    img: v.img || p.img,
    price: v.price ?? p.price,
    medidas: v.medidas ?? p.medidas,
    material: v.material ?? p.material,
    label: p.variants ? v.label : ""
  }
};
const info = c => [c.medidas, c.material].filter(Boolean).join(" · ");
const cats = [...new Set(PRODUCTS.map(p => p.cat))];
const order = ["Collares", "Aretes", "Pulseras", "Anillos", "Cabello", "Tendencias", "Complementos"];
cats.sort((a, b) => order.indexOf(a) - order.indexOf(b));

function renderChips() {
  $("#chips").innerHTML = ["Todos", ...cats].map(c => `<button class="chip" aria-pressed="${c===cat}" data-c="${c}">${c}</button>`).join("")
}
const card = p => {
  const vi = sel[p.id] || 0,
    c = cur(p, vi),
    m = info(c);
  const sw = p.variants ? `<div class="sw" role="group" aria-label="Elegir opción">${p.variants.map((v,i)=>`<button class="swb${v.img?"":" t"}" data-pid="${p.id}" data-vi="${i}" aria-pressed="${i===vi}" aria-label="Opción ${v.label}">${v.img?`<img src="${v.img}" alt="" loading="lazy"><i>${v.label}</i>`:v.label}</button>`).join("")}</div><p class="optn">Opción ${c.label}</p>` : "";
  const msg = `Hola NUBA, quiero comprar: ${p.name}${c.label?" - opción "+c.label:""} (${p.code}) - ${money(c.price)}${p.unit?" / "+p.unit:""}${c.medidas?" - "+c.medidas:""}`;
  return `<article class="card" data-pid="${p.id}"><div class="ph"><img src="${c.img}" alt="${p.name}" loading="lazy" decoding="async"><button class="add" data-add="${p.id}" aria-label="Agregar ${p.name} al carrito">+</button></div><h3>${p.name}</h3>${m?`<p class="meta">${m}</p>`:""}${sw}<p class="price">${money(c.price)}${p.unit?" / "+p.unit:""}</p><a class="btn sm" href="${wa(msg)}" target="_blank" rel="noopener">Comprar por WhatsApp</a></article>`
};
let shown = 24;

function renderGrid(reset = true) {
  if (reset) shown = 24;
  const t = term.trim().toLowerCase();
  const list = PRODUCTS.filter(p => (cat === "Todos" || p.cat === cat) && (!t || (p.name + " " + p.cat + " " + p.code + " " + (p.material || "")).toLowerCase().includes(t)));
  $("#grid").innerHTML = list.length ? list.slice(0, shown).map(card).join("") + (list.length > shown ? `<div class="more"><button class="btn ghost" data-more>Ver más piezas (${list.length-shown})</button></div>` : "") : `<p class="empty">No encontramos piezas con esa búsqueda. Prueba con otra palabra o escríbenos por WhatsApp.</p>`;
}

function save() {
  try {
    localStorage.setItem("nuba-cart2", JSON.stringify(cart))
  } catch (e) {}
}
const item = k => {
  const [pid, vi] = k.split(":");
  const p = byId(pid);
  return p ? {
    p,
    vi: +vi,
    c: cur(p, +vi)
  } : null
};

function renderCart() {
  const ks = Object.keys(cart).filter(k => item(k));
  let n = 0,
    tot = 0;
  $("#items").innerHTML = ks.length ? ks.map(k => {
    const {
      p,
      c
    } = item(k), q = cart[k];
    n += q;
    tot += q * c.price;
    const m = info(c);
    return `<li><img src="${c.img}" alt=""><div><b>${p.name}${c.label?" · opción "+c.label:""}</b>${m?m+"<br>":""}${money(c.price)}${p.unit?" / "+p.unit:""}<div class="qty"><button data-q="${k}" data-d="-1" aria-label="Quitar uno">−</button>${q}<button data-q="${k}" data-d="1" aria-label="Agregar uno">+</button></div></div><button class="rm" data-rm="${k}">Quitar</button></li>`
  }).join("") : `<li style="display:block;border:0">Tu carrito está vacío. Agrega una pieza con el botón +.</li>`;
  $("#count").textContent = n || "";
  $("#count").dataset.n = n;
  $("#total").textContent = money(tot);
  const msg = "Hola NUBA, quiero hacer este pedido:\n" + ks.map(k => {
    const {
      p,
      c
    } = item(k);
    return `- ${cart[k]} x ${p.name}${c.label?" (opción "+c.label+")":""} [${p.code}]: ${money(cart[k]*c.price)}`
  }).join("\n") + `\nTotal: ${money(tot)}`;
  $("#checkout").href = ks.length ? wa(msg) : wa("Hola NUBA, quiero hacer un pedido.");
}
const open = v => {
  document.body.classList.toggle("cart-open", v);
  $("#cart").setAttribute("aria-hidden", !v)
};
document.addEventListener("click", e => {
  const t = e.target.closest("button,a");
  if (!t) return;
  if (t.dataset.c) {
    cat = t.dataset.c;
    renderChips();
    renderGrid()
  }
  if (t.dataset.cat) {
    cat = t.dataset.cat;
    renderChips();
    renderGrid();
    $("#coleccion").scrollIntoView()
  }
  if ("more" in t.dataset) {
    shown += 24;
    renderGrid(false)
  }
  if (t.dataset.vi !== undefined) {
    const pid = t.dataset.pid;
    sel[pid] = +t.dataset.vi;
    const el = t.closest(".card"),
      tpl = document.createElement("template");
    tpl.innerHTML = card(byId(pid));
    el.replaceWith(tpl.content.firstElementChild)
  }
  if (t.dataset.add) {
    const k = t.dataset.add + ":" + (sel[t.dataset.add] || 0);
    cart[k] = (cart[k] || 0) + 1;
    save();
    renderCart();
    open(true)
  }
  if (t.dataset.q) {
    const k = t.dataset.q;
    cart[k] += +t.dataset.d;
    if (cart[k] < 1) delete cart[k];
    save();
    renderCart()
  }
  if (t.dataset.rm) {
    delete cart[t.dataset.rm];
    save();
    renderCart()
  }
  if (t.dataset.wa) {
    e.preventDefault();
    window.open(wa(t.dataset.wa), "_blank", "noopener")
  }
  if (t.dataset.pol) {
    $("#polT").textContent = POLICIES[t.dataset.pol][0];
    $("#polP").textContent = POLICIES[t.dataset.pol][1];
    $("#pol").showModal()
  }
  if (t.id === "cartBtn") open(true);
  if (t.id === "closeCart") open(false);
  if (t.id === "menuBtn") {
    const o = $("#nav").classList.toggle("open");
    t.setAttribute("aria-expanded", o)
  }
  if (t.closest("nav") && t.tagName === "A") $("#nav").classList.remove("open");
});
$("#shade").onclick = () => open(false);
document.addEventListener("keydown", e => {
  if (e.key === "Escape") open(false)
});
$("#q").addEventListener("input", e => {
  term = e.target.value;
  renderGrid()
});
addEventListener("scroll", () => $("#top").classList.toggle("scrolled", scrollY > 10), {
  passive: true
});
$("#cats").innerHTML = HERO_CATS.map(c => `<button class="cat" data-cat="${c.cat}"><img src="${main(byId(c.id))}" alt="" loading="lazy"><span>${c.cat}</span></button>`).join("");
$("#shots").innerHTML = PRODUCTS.filter((p, i) => i % 11 === 1).slice(0, 4).map(p => `<img src="${main(p)}" alt="${p.name}" loading="lazy">`).join("");
$("#aboutImg").src = main(byId("cad511-13-0"));
const ig = CONFIG.instagramUrl;
["#igLink", "#igLink2"].forEach(s => $(s).href = ig);
$("#handle").textContent = "@" + CONFIG.instagram;
$("#phone").textContent = "WhatsApp: +" + CONFIG.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, "$1 $2 $3 $4");
$("#yr").textContent = new Date().getFullYear();
renderChips();
renderGrid();
renderCart();
