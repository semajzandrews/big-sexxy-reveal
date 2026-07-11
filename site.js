import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/* ---------- smooth scroll ---------- */

const lenis = new Lenis({ anchors: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- catalog ---------- */

export const CATALOG = {
  single: { name: "Signature Blend", detail: "1 bottle", price: 12 },
  "3pack": { name: "Signature Blend", detail: "3 pack", price: 33 },
  "5pack": { name: "Signature Blend", detail: "5 pack", price: 50 },
};

/* ---------- cart ---------- */

const CART_KEY = "bigsexxy-cart";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function cartCount(cart) {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function cartTotal(cart) {
  return Object.entries(cart).reduce(
    (sum, [sku, qty]) => sum + (CATALOG[sku]?.price || 0) * qty,
    0,
  );
}

/* ---------- cart drawer UI ---------- */

const drawer = document.createElement("div");
drawer.className = "cart-drawer";
drawer.innerHTML = `
  <div class="cart-overlay"></div>
  <aside class="cart-panel" aria-label="Cart">
    <div class="cart-head">
      <h3>Your Cart</h3>
      <button class="cart-close" aria-label="Close cart">&times;</button>
    </div>
    <div class="cart-items"></div>
    <div class="cart-foot">
      <p class="cart-ship"></p>
      <p class="cart-subtotal"></p>
      <a class="cart-checkout" href="#">Checkout</a>
    </div>
  </aside>`;
document.body.appendChild(drawer);

const FREE_SHIP = 40;

function renderCart() {
  const cart = loadCart();
  const count = cartCount(cart);

  document.querySelectorAll(".cart-link .cart-count").forEach((el) => {
    el.textContent = count;
    el.style.display = count ? "inline-flex" : "none";
  });

  const itemsEl = drawer.querySelector(".cart-items");
  if (!count) {
    itemsEl.innerHTML = `<p class="cart-empty">Nothing in here yet. Fix that.</p>`;
  } else {
    itemsEl.innerHTML = Object.entries(cart)
      .map(([sku, qty]) => {
        const p = CATALOG[sku];
        return `
        <div class="cart-item" data-sku="${sku}">
          <img src="/bottle.svg" alt="" />
          <div>
            <p class="cart-item-name">${p.name}</p>
            <p class="cart-item-detail">${p.detail} &middot; $${p.price}</p>
          </div>
          <div class="cart-item-qty">
            <button data-delta="-1" aria-label="Less">&minus;</button>
            <span>${qty}</span>
            <button data-delta="1" aria-label="More">+</button>
          </div>
        </div>`;
      })
      .join("");
  }

  const total = cartTotal(cart);
  drawer.querySelector(".cart-subtotal").textContent = count
    ? `Subtotal: $${total}`
    : "";
  drawer.querySelector(".cart-ship").textContent = count
    ? total >= FREE_SHIP
      ? "Free shipping unlocked."
      : `$${FREE_SHIP - total} away from free shipping.`
    : "";

  const summary = Object.entries(cart)
    .map(([sku, qty]) => `${qty} x ${CATALOG[sku].detail}`)
    .join(", ");
  drawer.querySelector(".cart-checkout").href =
    `mailto:orders@bigsexxyhotsauce.com?subject=Big%20Sexxy%20Order&body=${encodeURIComponent(
      `Order: ${summary}. Subtotal $${total}.`,
    )}`;
  drawer.querySelector(".cart-checkout").style.display = count ? "" : "none";
}

function openCart() {
  drawer.classList.add("open");
}
function closeCart() {
  drawer.classList.remove("open");
}

drawer.querySelector(".cart-overlay").addEventListener("click", closeCart);
drawer.querySelector(".cart-close").addEventListener("click", closeCart);

drawer.querySelector(".cart-items").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-delta]");
  if (!btn) return;
  const sku = btn.closest(".cart-item").dataset.sku;
  const cart = loadCart();
  cart[sku] = (cart[sku] || 0) + Number(btn.dataset.delta);
  if (cart[sku] <= 0) delete cart[sku];
  saveCart(cart);
});

document.querySelectorAll(".cart-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    openCart();
  });
});

/* ---------- add-to-cart buttons ---------- */

document.querySelectorAll(".add-to-cart").forEach((btn) => {
  btn.addEventListener("click", () => {
    const sku = btn.dataset.sku || "single";
    const label = btn.querySelector(".atc-label") || btn;
    const original = label.textContent;
    label.textContent = "Adding";
    btn.disabled = true;

    const cart = loadCart();
    const qtyEl = btn
      .closest("[data-product]")
      ?.querySelector(".qty-value");
    const qty = qtyEl ? Number(qtyEl.textContent) : 1;
    cart[sku] = (cart[sku] || 0) + qty;

    setTimeout(() => {
      saveCart(cart);
      label.textContent = "Added";
      setTimeout(() => {
        label.textContent = original;
        btn.disabled = false;
        openCart();
      }, 500);
    }, 350);
  });
});

/* ---------- size / pack pickers ---------- */

document.querySelectorAll(".size-picker").forEach((picker) => {
  picker.addEventListener("click", (e) => {
    const opt = e.target.closest("[data-sku]");
    if (!opt) return;
    picker
      .querySelectorAll("[data-sku]")
      .forEach((o) => o.classList.toggle("active", o === opt));
    const scope = picker.closest("[data-product]");
    const btn = scope.querySelector(".add-to-cart");
    btn.dataset.sku = opt.dataset.sku;
    const priceEl = scope.querySelector(".price-now");
    if (priceEl) priceEl.textContent = `$${CATALOG[opt.dataset.sku].price}`;
  });
});

/* ---------- qty steppers ---------- */

document.querySelectorAll(".qty-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const el = btn.parentElement.querySelector(".qty-value");
    el.textContent = Math.min(
      24,
      Math.max(1, Number(el.textContent) + Number(btn.dataset.qty)),
    );
  });
});

/* ---------- mobile nav ---------- */

const nav = document.querySelector("nav");
const navToggle = document.querySelector(".nav-toggle");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open);
  });
  document.querySelectorAll(".nav-items a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- forms (demo: mailto handoff) ---------- */

document.querySelectorAll("form[data-mailto]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const body = [...data.entries()]
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    window.location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(
      form.dataset.subject || "Big Sexxy",
    )}&body=${encodeURIComponent(body)}`;
  });
});

/* ---------- scroll reveals ---------- */

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (!reduceMotion) {
  gsap.utils.toArray("[data-reveal]").forEach((el, i) => {
    gsap.fromTo(
      el,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    );
  });
}

renderCart();
