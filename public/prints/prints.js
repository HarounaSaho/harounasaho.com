(function () {
  var mounts = document.querySelectorAll("[data-print-for]");
  var grid = document.getElementById("print-grid");
  var preview = document.getElementById("order-preview");
  var cartRoot = document.getElementById("print-cart");
  var loading = document.getElementById("print-loading");
  var cartKey = "saho-print-cart";
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
      link.textContent = names.length ? "Cart · " + names.length : "Cart";
    });
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
    if (document.querySelector("[data-cart-count]")) return;
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
    if (image.charAt(0) === "/") return image;
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
    ship.textContent = "Ships in " + days + " business days · Unframed";

    function paint() {
      var variant = variants[selected] || {};
      price.textContent = formatPrice(variant.price);
      Array.prototype.forEach.call(sizes.children, function (button, index) {
        button.setAttribute("aria-pressed", index === selected ? "true" : "false");
      });
      if (variant.soldOut) {
        buy.textContent = "Sold out";
        buy.removeAttribute("href");
        buy.classList.add("is-disabled");
        buy.setAttribute("aria-disabled", "true");
      } else if (buyable(variant)) {
        buy.textContent = "Buy print";
        buy.href = variant.stripeLink;
        buy.classList.remove("is-disabled");
        buy.removeAttribute("aria-disabled");
      } else {
        buy.textContent = "Buy print";
        buy.removeAttribute("href");
        buy.classList.add("is-disabled");
        buy.setAttribute("aria-disabled", "true");
      }
    }

    variants.forEach(function (variant, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "print-size";
      button.textContent = variant.size || "";
      button.addEventListener("click", function () {
        selected = index;
        paint();
      });
      sizes.appendChild(button);
    });

    buy.addEventListener("click", function (event) {
      if (!buy.getAttribute("href")) event.preventDefault();
    });

    if (frame) article.appendChild(frame);
    if (withImage) {
      article.appendChild(title);
      article.appendChild(year);
    }
    article.appendChild(edition);
    if (print.paper) article.appendChild(paper);
    if (variants.length) article.appendChild(sizes);
    article.appendChild(price);
    article.appendChild(buy);
    article.appendChild(ship);
    paint();
    return article;
  }

  function offer(print) {
    var section = document.createElement("section");
    section.className = "print-offer";
    var heading = document.createElement("h3");
    heading.className = "print-offer-heading";
    heading.textContent = "Prints available";
    section.appendChild(heading);
    section.appendChild(card(print, false));
    return section;
  }

  function uniquePrints(prints) {
    var seen = {};
    var list = [];
    prints.forEach(function (print) {
      if (!print || print.set) return;
      var key = String(print.image || print.work || "").toLowerCase();
      if (!key || seen[key]) return;
      seen[key] = true;
      list.push(print);
    });
    return list;
  }

  function setCard(item) {
    var article = document.createElement("article");
    article.className = "print-card";
    if (item.image) {
      var frame = document.createElement("div");
      frame.className = "print-frame";
      var tag = document.createElement("span");
      tag.className = "print-tag";
      tag.textContent = "PRINT";
      var img = document.createElement("img");
      img.alt = item.work + ", " + item.year;
      img.loading = "lazy";
      img.decoding = "async";
      img.src = imageSrc(item);
      frame.appendChild(tag);
      frame.appendChild(img);
      article.appendChild(frame);
    }
    var title = document.createElement("h3");
    title.className = "print-title";
    var em = document.createElement("em");
    em.textContent = item.work || "";
    title.appendChild(em);
    var year = document.createElement("p");
    year.className = "print-year";
    year.textContent = item.year == null ? "" : String(item.year);
    var edition = document.createElement("p");
    edition.className = "print-edition";
    edition.textContent = "Edition of 25, signed and numbered";
    var size = document.createElement("p");
    size.className = "print-paper";
    size.textContent = item.size || "";
    var price = document.createElement("p");
    price.className = "print-price";
    price.textContent = formatPrice(item.price);
    var ship = document.createElement("p");
    ship.className = "print-ship";
    ship.textContent = "Unframed";
    article.appendChild(title);
    article.appendChild(year);
    article.appendChild(edition);
    article.appendChild(size);
    article.appendChild(price);
    article.appendChild(addButton(item));
    article.appendChild(ship);
    return article;
  }

  function addButton(item) {
    var buy = document.createElement("button");
    buy.type = "button";
    buy.className = "print-buy";
    if (item && item.soldOut) {
      buy.textContent = "Sold out";
      buy.classList.add("is-disabled");
      buy.disabled = true;
      return buy;
    }
    buy.setAttribute("data-cart-for", item.work || "");
    buy.addEventListener("click", function () {
      toggleCart(item.work);
      if (cartRoot && window.__sahoRenderCart) window.__sahoRenderCart();
    });
    return buy;
  }

  function renderCart(checkout) {
    if (!cartRoot || !checkout) return;
    var names = readCart();
    var chosen = checkout.items.filter(function (item) {
      return names.indexOf(item.work) !== -1;
    });
    cartRoot.replaceChildren();
    if (!chosen.length) {
      var empty = document.createElement("p");
      empty.className = "print-status";
      empty.textContent = "Your cart is empty.";
      var back = document.createElement("p");
      back.className = "cart-empty-link";
      var shop = document.createElement("a");
      shop.href = "/prints/";
      shop.textContent = "Browse prints";
      back.appendChild(shop);
      cartRoot.appendChild(empty);
      cartRoot.appendChild(back);
      cartRoot.hidden = false;
      return;
    }
    var list = document.createElement("div");
    list.className = "order-list";
    var total = 0;
    chosen.forEach(function (item) {
      total += typeof item.price === "number" ? item.price : 0;
      var row = document.createElement("div");
      row.className = "order-line" + (item.image ? "" : " no-thumb");
      if (item.image) {
        var img = document.createElement("img");
        img.alt = item.work + ", " + item.year;
        img.src = imageSrc(item);
        row.appendChild(img);
      }
      var copy = document.createElement("div");
      copy.className = "order-copy";
      var name = document.createElement("h2");
      name.className = "order-name";
      name.textContent = item.work;
      var meta = document.createElement("p");
      meta.className = "order-meta";
      meta.textContent = (item.year == null ? "" : item.year) + " · " + (item.size || "") + " · " + formatPrice(item.price);
      copy.appendChild(name);
      copy.appendChild(meta);
      var actions = document.createElement("div");
      actions.className = "cart-actions";
      if (buyable({ stripeLink: item.stripeLink })) {
        var pay = document.createElement("a");
        pay.className = "print-buy";
        pay.href = item.stripeLink;
        pay.textContent = "Checkout";
        actions.appendChild(pay);
      }
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "cart-remove";
      remove.textContent = "Remove";
      remove.addEventListener("click", function () {
        var next = readCart().filter(function (work) { return work !== item.work; });
        writeCart(next);
        paintCart();
        renderCart(checkout);
      });
      actions.appendChild(remove);
      row.appendChild(copy);
      row.appendChild(actions);
      list.appendChild(row);
    });
    var sum = document.createElement("p");
    sum.className = "order-total";
    var label = document.createElement("span");
    label.textContent = "Total";
    var amount = document.createElement("span");
    amount.textContent = formatPrice(total);
    sum.appendChild(label);
    sum.appendChild(amount);
    var note = document.createElement("p");
    note.className = "print-ship";
    note.textContent = "Each print checks out on its own Stripe page.";
    cartRoot.appendChild(list);
    cartRoot.appendChild(sum);
    cartRoot.appendChild(note);
    cartRoot.hidden = false;
  }

  function setOffer(item) {
    var section = document.createElement("section");
    section.className = "print-offer";
    var heading = document.createElement("h3");
    heading.className = "print-offer-heading";
    heading.textContent = "Prints available";
    var edition = document.createElement("p");
    edition.className = "print-edition";
    edition.textContent = "Edition of 25, signed and numbered";
    var size = document.createElement("p");
    size.className = "print-paper";
    size.textContent = item.size || "";
    var price = document.createElement("p");
    price.className = "print-price";
    price.textContent = formatPrice(item.price);
    var note = document.createElement("p");
    note.className = "print-ship";
    note.textContent = "Unframed";
    section.appendChild(heading);
    section.appendChild(edition);
    section.appendChild(size);
    section.appendChild(price);
    section.appendChild(addButton(item));
    section.appendChild(note);
    return section;
  }

  function renderCheckout(checkout) {
    if (!checkout || !Array.isArray(checkout.items)) throw new Error("checkout");
    window.__sahoRenderCart = function () { renderCart(checkout); };
    ensureCartLink();
    mounts.forEach(function (mount) {
      var name = mount.getAttribute("data-print-for");
      var match = null;
      checkout.items.forEach(function (item) {
        if (match) return;
        if (item.work === name) match = item;
      });
      mount.replaceChildren();
      if (match) mount.appendChild(setOffer(match));
    });
    if (grid) {
      grid.replaceChildren();
      checkout.items.forEach(function (item) {
        grid.appendChild(setCard(item));
      });
      grid.hidden = false;
    }
    renderCart(checkout);
    paintCart();
    if (loading) loading.hidden = true;
  }

  function fail() {
    var note = document.createElement("p");
    note.className = "print-status";
    note.textContent = "Prints could not be loaded.";
    mounts.forEach(function (mount) {
      mount.replaceChildren(note.cloneNode(true));
    });
    if (grid) {
      grid.hidden = false;
      grid.replaceChildren(note);
    }
    if (preview) {
      preview.hidden = false;
      preview.replaceChildren(note.cloneNode(true));
    }
    if (loading) loading.hidden = true;
  }

  function loadPrintList() {
    fetch("/data/prints.json")
    .then(function (response) {
      if (!response.ok) throw new Error("prints");
      return response.json();
    })
    .then(function (prints) {
      if (!Array.isArray(prints)) throw new Error("prints");
      var once = uniquePrints(prints);
      mounts.forEach(function (mount) {
        var name = mount.getAttribute("data-print-for");
        var match = null;
        once.forEach(function (print) {
          if (match) return;
          if (print.work === name) match = print;
        });
        mount.replaceChildren();
        if (match) mount.appendChild(offer(match));
      });
      if (grid) {
        grid.replaceChildren();
        once.forEach(function (print) {
          grid.appendChild(card(print, true));
        });
        grid.hidden = false;
      }
      if (loading) loading.hidden = true;
    })
    .catch(fail);
  }

  fetch("/data/checkout.json")
    .then(function (response) {
      if (!response.ok) throw new Error("checkout");
      return response.json();
    })
    .then(renderCheckout)
    .catch(loadPrintList);
}());
