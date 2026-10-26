(function () {
  var mounts = document.querySelectorAll("[data-print-for]");
  var grid = document.getElementById("print-grid");
  var loading = document.getElementById("print-loading");
  if (!mounts.length && !grid) return;

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
    if (loading) loading.hidden = true;
  }

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
}());
