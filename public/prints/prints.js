(function () {
  var mounts = document.querySelectorAll("[data-print-for]");
  var grid = document.getElementById("print-grid");
  var preview = document.getElementById("order-preview");
  var cartRoot = document.getElementById("print-cart");
  var loading = document.getElementById("print-loading");
  var cartKey = "saho-print-cart";
  var catalog = null;
  if (!mounts.length && !grid && !preview && !cartRoot) return;

  function readCart() {
    try {
      var parsed = JSON.parse(localStorage.getItem(cartKey) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (name) { return typeof name === "string" && name; });
    } catch (error) {
      return [];
    }
  }

  function writeCart(names) {
    var unique = [];
    names.forEach(function (name) {
      if (unique.indexOf(name) === -1) unique.push(name);
    });
    localStorage.setItem(cartKey, JSON.stringify(unique));
  }

  function paintCart() {
    var names = readCart();
    document.querySelectorAll("[data-cart-for]").forEach(function (button) {
      var on = names.indexOf(button.getAttribute("data-cart-for")) !== -1;
      button.textContent = on ? "Added" : "Add to cart";
      button.setAttribute("aria-pressed", on ? "true" : "false");
      button.classList.toggle("is-added", on);
    });
    document.querySelectorAll("[data-cart-count]").forEach(function (link) {
      link.textContent = names.length ? "Cart \u00b7 " + names.length : "Cart";
    });
    paintCheckoutBar();
  }

  function toggleCart(name) {
    var names = readCart();
    var index = names.indexOf(name);
    if (index === -1) names.push(name);
    else names.splice(index, 1);
    writeCart(names);
    paintCart();
  }

  function ensureCartLink() {
    if (cartRoot || document.querySelector("[data-cart-count]")) return;
    var link = document.createElement("a");
    link.className = "cart-link";
    link.href = "/prints/cart/";
    link.setAttribute("data-cart-count", "");
    link.textContent = "Cart";
    var actions = document.querySelector(".actions");
    var kicker = document.querySelector(".print-page .kicker");
    if (kicker) kicker.insertAdjacentElement("afterend", link);
    else if (actions) actions.appendChild(link);
  }

  function formatPrice(price) {
    if (typeof price !== "number" || !isFinite(price)) return "\u00a0";
    var cents = Math.round(price * 100);
    if (cents % 100 === 0) return "$" + (cents / 100);
    return "$" + (cents / 100).toFixed(2);
  }

  function buyable(variant) {
    if (!variant || variant.soldOut) return false;
    var link = variant.stripeLink || "";
    return /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9_]+/.test(link);
  }

  function editionLine(edition) {
    var text = String(edition || "Open edition").trim();
    if (/print$/i.test(text)) return text;
    return text + " print";
  }

  function imageSrc(print) {
    var image = print.image || "";
    if (image.charAt(0) === "/" || image.indexOf("https://") === 0) return image;
    return "/prints/" + image;
  }

  function card(print, withImage) {
    var article = document.createElement("article");
    article.className = "print-card";
    var variants = Array.isArray(print.variants) ? print.variants : [];
    var selected = 0;

    var frame = null;
    if (withImage) {
      frame = document.createElement("div");
      frame.className = "print-frame";
      var tag = document.createElement("span");
      tag.className = "print-tag";
      tag.textContent = "PRINT";
      var img = document.createElement("img");
      img.alt = (print.work || "Print") + ", " + (print.year || "") + ", open edition print";
      img.loading = "lazy";
      img.decoding = "async";
      img.src = imageSrc(print);
      frame.appendChild(tag);
      frame.appendChild(img);
    }

    var title = document.createElement("h3");
    title.className = "print-title";
    var em = document.createElement("em");
    em.textContent = print.work || "";
    title.appendChild(em);

    var year = document.createElement("p");
    year.className = "print-year";
    year.textContent = print.year == null ? "" : String(print.year);

    var edition = document.createElement("p");
    edition.className = "print-edition";
    edition.textContent = editionLine(print.edition);

    var paper = document.createElement("p");
    paper.className = "print-paper";
    paper.textContent = print.paper || "";

    var sizes = document.createElement("div");
    sizes.className = "print-sizes";
    sizes.setAttribute("role", "group");
    sizes.setAttribute("aria-label", "Size");

    var price = document.createElement("p");
    price.className = "print-price";

    var buy = document.createElement("a");
    buy.className = "print-buy";
    buy.setAttribute("aria-disabled", "true");

    var ship = document.createElement("p");
    ship.className = "print-ship";
    var days = typeof print.shipsIn === "number" ? print.shipsIn : 7;
    ship.textContent = "Ships in " + days + " business days \u00b7 Unframed";
  }
})();
