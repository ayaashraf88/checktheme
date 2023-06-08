import MobileMenu from "mmenu-light";
import Swal from "sweetalert2";
import Anime from "./partials/anime";
import initTootTip from "./partials/tooltip";
import AppHelpers from "./app-helpers";

class App extends AppHelpers {
  constructor() {
    super();
    window.app = this;
  }

  loadTheApp() {
    this.commonThings();
    this.initiateNotifier();
    this.initiateMobileMenu();
    this.initiateStickyMenu();
    this.initAddToCart();
    this.initiateAdAlert();
    this.initiateDropdowns();
    this.initiateModals();
    this.initiateCollapse();
    initTootTip();

    salla.comment.event.onAdded(() => window.location.reload());

    this.status = "ready";
    document.dispatchEvent(new CustomEvent("theme::ready"));
    this.log("Theme Loaded 🎉");
  }

  log(message) {
    salla.log(`ThemeApp(Raed)::${message}`);
    return this;
  }

  commonThings() {
    this.cleanContentArticles(".content-entry");
  }

  cleanContentArticles(elementsSelector) {
    let articleElements = document.querySelectorAll(elementsSelector);

    if (articleElements.length) {
      articleElements.forEach((article) => {
        article.innerHTML = article.innerHTML.replace(/\&nbsp;/g, " ");
      });
    }
  }

  copyToClipboard(event) {
    event.preventDefault();
    let aux = document.createElement("input"),
      btn = event.currentTarget;
    aux.setAttribute("value", btn.dataset.content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    this.toggleElementClassIf(btn, "copied", "code-to-copy", () => true);
    setTimeout(() => {
      this.toggleElementClassIf(btn, "code-to-copy", "copied", () => true);
    }, 1000);
  }

  initiateNotifier() {
    salla.notify.setNotifier(function (message, type, data) {
      if (typeof message == "object") {
        return Swal.fire(message).then(type);
      }

      return Swal.mixin({
        toast: true,
        position: salla.config.get("theme.is_rtl") ? "top-start" : "top-end",
        showConfirmButton: false,
        timer: 3500,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      }).fire({
        icon: type,
        title: message,
        showCloseButton: true,
        timerProgressBar: true,
      });
    });
  }

  initiateMobileMenu() {
    let menu = this.element("#mobile-menu");
    //in landing menu will not be their
    if (!menu) {
      return;
    }
    menu = new MobileMenu(
      menu,
      "(max-width: 1024px)",
      "( slidingSubmenus: false)"
    );
    salla.lang.onLoaded(() => {
      menu.navigation({ title: salla.lang.get("blocks.header.main_menu") });
    });
    const drawer = menu.offcanvas({
      position: salla.config.get("theme.is_rtl") ? "right" : "left",
    });

    this.onClick(
      "a[href='#mobile-menu']",
      (event) => event.preventDefault() || drawer.close() || drawer.open()
    );
    this.onClick(
      ".close-mobile-menu",
      (event) => event.preventDefault() || drawer.close()
    );
  }

  initiateStickyMenu() {
    let header = this.element("#mainnav"),
      height = this.element("#mainnav .inner")?.clientHeight;
    //when it's landing page, there is no header
    if (!header) {
      return;
    }

    window.addEventListener("load", () =>
      setTimeout(() => this.setHeaderHeight(), 500)
    );
    window.addEventListener("resize", () => this.setHeaderHeight());

    window.addEventListener(
      "scroll",
      () => {
        window.scrollY >= header.offsetTop + height
          ? header.classList.add("fixed-pinned", "animated")
          : header.classList.remove("fixed-pinned");
        window.scrollY >= 200
          ? header.classList.add("fixed-header")
          : header.classList.remove("fixed-header", "animated");
      },
      { passive: true }
    );
  }

  setHeaderHeight() {
    let height = this.element("#mainnav .inner").clientHeight,
      header = this.element("#mainnav");
    header.style.height = height + "px";
  }

  /**
   * Because salla caches the response, it's important to keep the alert disabled if the visitor closed it.
   * by store the status of the ad in local storage `salla.storage.set(...)`
   */
  initiateAdAlert() {
    let ad = this.element(".salla-advertisement");

    if (!ad) {
      return;
    }

    if (!salla.storage.get("statusAd-" + ad.dataset.id)) {
      ad.classList.remove("hidden");
    }

    this.onClick(".ad-close", function (event) {
      event.preventDefault();
      salla.storage.set("statusAd-" + ad.dataset.id, "dismissed");

      anime({
        targets: ".salla-advertisement",
        opacity: [1, 0],
        duration: 300,
        height: [ad.clientHeight, 0],
        easing: "easeInOutQuad",
      });
    });
  }

  initiateDropdowns() {
    this.onClick(".dropdown__trigger", ({ target: btn }) => {
      btn.parentElement.classList.toggle("is-opened");
      document.body.classList.toggle("dropdown--is-opened");
      // Click Outside || Click on close btn
      window.addEventListener("click", ({ target: element }) => {
        if (
          (!element.closest(".dropdown__menu") && element !== btn) ||
          element.classList.contains("dropdown__close")
        ) {
          btn.parentElement.classList.remove("is-opened");
          document.body.classList.remove("dropdown--is-opened");
        }
      });
    });
  }

  initiateModals() {
    this.onClick("[data-modal-trigger]", (e) => {
      let id = "#" + e.target.dataset.modalTrigger;
      this.removeClass(id, "hidden");
      setTimeout(() => this.toggleModal(id, true)); //small amont of time to running toggle After adding hidden
    });
    salla.event.document.onClick("[data-close-modal]", (e) =>
      this.toggleModal("#" + e.target.dataset.closeModal, false)
    );
  }

  toggleModal(id, isOpen) {
    this.toggleClassIf(
      `${id} .s-salla-modal-overlay`,
      "ease-out duration-300 opacity-100",
      "opacity-0",
      () => isOpen
    )
      .toggleClassIf(
        `${id} .s-salla-modal-body`,
        "ease-out duration-300 opacity-100 translate-y-0 sm:scale-100", //add these classes
        "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95", //remove these classes
        () => isOpen
      )
      .toggleElementClassIf(
        document.body,
        "modal-is-open",
        "modal-is-closed",
        () => isOpen
      );
    if (!isOpen) {
      setTimeout(() => this.addClass(id, "hidden"), 350);
    }
  }

  initiateCollapse() {
    document.querySelectorAll(".btn--collapse").forEach((trigger) => {
      const content = document.querySelector("#" + trigger.dataset.show);
      const state = { isOpen: false };

      const onOpen = () =>
        anime({
          targets: content,
          duration: 225,
          height: content.scrollHeight,
          opacity: [0, 1],
          easing: "easeOutQuart",
        });

      const onClose = () =>
        anime({
          targets: content,
          duration: 225,
          height: 0,
          opacity: [1, 0],
          easing: "easeOutQuart",
        });

      const toggleState = (isOpen) => {
        state.isOpen = !isOpen;
        this.toggleElementClassIf(
          content,
          "is-closed",
          "is-opened",
          () => isOpen
        );
      };

      trigger.addEventListener("click", () => {
        const { isOpen } = state;
        toggleState(isOpen);
        isOpen ? onClose() : onOpen();
      });
    });
  }

  /**
   * Workaround for seeking to simplify & clean, There are three ways to use this method:
   * 1- direct call: `this.anime('.my-selector')` - will use default values
   * 2- direct call with overriding defaults: `this.anime('.my-selector', {duration:3000})`
   * 3- return object to play it letter: `this.anime('.my-selector', false).duration(3000).play()` - will not play animation unless calling play method.
   * @param {string|HTMLElement} selector
   * @param {object|undefined|null|null} options - in case there is need to set attributes one by one set it `false`;
   * @return {Anime|*}
   */
  anime(selector, options = null) {
    let anime = new Anime(selector, options);
    return options === false ? anime : anime.play();
  }

  /**
   * These actions are responsible for pressing "add to cart" button,
   * they can be from any page, especially when mega-menu is enabled
   */
  initAddToCart() {
    salla.cart.event.onUpdated((summary) => {
      document
        .querySelectorAll("[data-cart-total]")
        .forEach((el) => (el.innerText = salla.money(summary.total)));
      document
        .querySelectorAll("[data-cart-count]")
        .forEach((el) => (el.innerText = salla.helpers.number(summary.count)));
    });

    salla.cart.event.onItemAdded((response, prodId) => {
      app
        .element("salla-cart-summary")
        .animateToCart(app.element(`#product-${prodId} img`));
    });
  }
}
class ProductCard extends HTMLElement {
  connectedCallback() {
    // Handle landing page
    this.source = salla.config.get("page.slug");
    if (this.source == "landing-page") {
      this.hideAddBtn = true;
      this.showQuantity = true;
    }

    // Append host classes and id
    this.classList.add("card");
    this.setAttribute("data-aos", "fade-down-left");
    this.setAttribute("data-aos-duration", "1500");
    this.setAttribute("data-aos-anchor-placement", "center-center");
    this.id = `product_${this.product.id}`;
    if (this.product.is_out_of_stock) {
      this.classList.add("is-out");
    }

    // Add fit type class
    let fitType = salla.config.get("store.settings.product.fit_type");
    if (!!fitType) {
      this.classList.add(`${fitType}`);
    }

    salla.lang.onLoaded(() => {
      AOS.init();
      this.render();
    });

    // Props
    this.horizontal = this.getAttribute("horizontal") === "true";
    this.showWishlist = this.getAttribute("show-wishlist") === "true";

    this.render();
  }

  render() {
    // Translations
    const remained = salla.lang.get("pages.products.remained");
    const donationPH = salla.lang.get("pages.products.donation_placeholder");
    const startingPrice = salla.lang.get("pages.products.starting_price");
    const outOfStock = salla.lang.get("pages.products.out_of_stock");
    const calories = salla.lang.get("pages.products.calories");

    this.innerHTML = `
       
          <div class="product-block__thumb">
      
            <a href="${this.product.url}" class="thumb-wrapper" aria-label="${
      this.product.name
    }">
            <div class="prodImage mx-auto"><img class="lazy-load"  src="${"images/img_loader.png"}" data-src="${
      this.product.image.url
    }" alt="${this.product.image.alt}" /></div>
            </a>
          </div>
          ${
            this.showWishlist
              ? `<span class="btn--product-like">
                  <salla-button loader-position="center" shape="icon" size="small" color="danger" class="btn--delete" onclick="salla.wishlist.remove(${this.product.id})">
                      <i class="sicon-cancel"></i>
                  </salla-button>
                </span>`
              : ""
          }
          <div class=" wide donating-wrap">
            <div class="card-body">
              <a href="${this.product.url}" class="product-title">
                <h2 class="title title--primary title--small">${
                  this.product.name
                }</h2>
                <p>${!!this.product.subtitle ? this.product.subtitle : ""}</p>
              </a>
              <div class="rating_and_discount ">
								<div class="discount ">-
                ${Math.ceil(
                  (this.product.sale_price / this.product.regular_price) * 100
                )}
									%</div>

							</div>
              ${
                this.product.calories
                  ? `<div class="font-sm mt-5 mb-10">
                      <i class="d-inline-block sicon-fire color-danger mr-1 ml-0"></i>
                      <strong>${this.product.calories}</strong> ${calories}
                    </div>`
                  : ""
              }
            ${
              this.product.is_donation
                ? `{% component 'product.donation-progress-bar' with {'product': product, 'is_cart': is_cart} %}
                <div class="form mt-10 mb-10">
                  <div class="form-group">
                    {{ csrf_field() }}
                    <div class="input-group input-group--end">
                      <input placeholder="${donationPH}"
                             type="text"
                             id="donation_amount_${this.product.id}"
                             name="donation_amount"
                             class="form-control form-control--short _parseArabicNumbers"
                             value="${
                               salla.url.is_page("cart")
                                 ? this.product.price
                                 : ""
                             }"
                             data-digits-with-decimal
                             data-digits
                             ${!this.product.can_donate ? "disabled" : ""} />
                      <span class="input-group-addon"> ${
                        salla.config.currency().symbol
                      } </span>
                    </div>
                  </div>
                </div>`
                : ""
            }
      <div class="flex justify-between	 items-center">
            <div class="price-wrapper">
              ${
                this.product.is_on_sale
                  ? `
                <p class="mr-2 first">
								${salla.money(this.product.sale_price)}
								<span class="middle mr-2">
                ${salla.money(this.product.price)}
									</span>
							</p>
                `
                  : this.product.starting_price
                  ? `${startingPrice}<span>${salla.money(
                      this.product.starting_price
                    )}</span>`
                  : `<span>${salla.money(this.product.price)}</span>`
              }</div>

                ${
                  !this.hideAddBtn
                    ? `<div class="  ${
                        this.product.status == "out" ? "disabled" : ""
                      }">
                    <salla-add-product-button
                        
                        product-id="${this.product.id}"
                        product-status="${this.product.status}"
                        product-type="${this.product.type}">
                        ${
                          this.product.type == "booking"
                            ? '<i class="sicon-calendar-date"></i>'
                            : '<i class="fas fa-shopping-cart"></i>'
                        }
                    </salla-add-product-button>
                  </div>
                  </div>
                  `
                    : ""
                }
      <div class="container topBadge" style="">

      ${
        this.product.promotion_title == "جديد"
          ? `
        <div class="flex flex-row justify-between" id="newInfo">
									<div class="newBadge ml-5 ">${this.product.promotion_title}</div>
									<div
										class="favourite mr-5">
										<salla-button shape="icon" color="black" fill="none" aria-label="Add or remove to wishlist" class="btn--wishlist animated " onclick="salla.wishlist.toggle(${this.product.id})" data-id="${this.product.id}">
											<i class="fa-regular fa-heart"></i>
										</salla-button>
									</div>
								</div>`
          : !this.product.promotion_title
          ? `<div class=" lg:flex flex-row justify-end " id="newInfo">
        <div class="favourite ">
          <salla-button shape="icon" color="black" fill="none" aria-label="Add or remove to wishlist" class="btn--wishlist animated " onclick="salla.wishlist.toggle(${this.product.id})" data-id="${this.product.id}">
            <i class="fa-regular fa-heart"></i>
          </salla-button>
        </div>
      </div>`
          : this.showQuantity && this.product.quantity
          ? `<span class="badge badge--ribbon badge--primary">${remained} ${this.product.quantity}</span>`
          : this.showQuantity && this.product.is_out_of_stock
          ? `<div class="out-badge ${
              this.horizontal ? "" : "max-w-[calc(100%-60px)]"
            }">${outOfStock}</div>`
          : ""
      }
      </div>
      `;
    document.lazyLoadInstance?.update(
      document.querySelectorAll(".product-block__thumb .lazy-load")
    );
  }
}
customElements.define("custom-salla-product-card", ProductCard);
var toTopButton = document.getElementById("to-top-button");

// When the user scrolls down 200px from the top of the document, show the button
window.onscroll = function () {
  if (
    document.body.scrollTop > 200 ||
    document.documentElement.scrollTop > 200
  ) {
    toTopButton.classList.remove("hidden");
  } else {
    toTopButton.classList.add("hidden");
  }
};

// When the user clicks on the button, smoothy scroll to the top of the document
function goToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$(document).ready(function () {
  $("#to-top-button").click(function () {
    goToTop();
  });
  $(".hiddenData").hide();
  $('.responsive').on('click', '.contentChange', function() {
    var id = $(this).attr("data-content");
    $(".sliderUpData").hide();
    $("." + id + "_data").show(); 
    console.log("." + id + "_data");
  });
  $(".responsive").slick({
    dots: true,
    arrows: false,
    infinite: false,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 3,
    rtl: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 375,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ],
  });
  
  $(".prductsResponsive").slick({
    dots: true,
    arrows: false,
    infinite: false,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 3,
    rtl: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 375,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ],
  });
});
salla.onReady(() => new App().loadTheApp());
