
/*
  EULLIYAN'S PERSONAL PORTFOLIO
  Shared Page System
  Version: 1.2.0
*/

(function () {
  "use strict";

  const PAGE_CONFIG = {
    "about.html": {
      template: "about-content",
      bodyClass: "about-page"
    },
    "projects.html": {
      template: "projects-content",
      bodyClass: "projects-page"
    },
    "websites.html": {
      template: "websites-content",
      bodyClass: "websites-page"
    },
    "videos.html": {
      template: "videos-content",
      bodyClass: "videos-page"
    },
    "reels.html": {
      template: "reels-content",
      bodyClass: "reels-page"
    },
    "qr.html": {
      template: "qr-content",
      bodyClass: "qr-page"
    }
  };

  const pageName = window.location.pathname
    .split("/")
    .pop()
    .toLowerCase();

  const page = PAGE_CONFIG[pageName];

  // Never interfere with Home.
  if (!page) return;

  document.body.classList.add(page.bodyClass);

  async function loadPageTemplate() {
    const pageRoot = document.getElementById("page-root");

    if (!pageRoot) {
      console.error(
        "Portfolio Page System: #page-root not found."
      );
      return;
    }

    try {
      const response = await fetch("page-template.html");

      if (!response.ok) {
        throw new Error("Template file could not be loaded.");
      }

      const html = await response.text();

      const parser = new DOMParser();

      const templateDocument = parser.parseFromString(
        html,
        "text/html"
      );

      const contentTemplate =
        templateDocument.getElementById(page.template);

      const headerTemplate =
        templateDocument.getElementById("shared-header");

      const footerTemplate =
        templateDocument.getElementById("shared-footer");

      if (!contentTemplate || !headerTemplate || !footerTemplate) {
        throw new Error("A required page template is missing.");
      }

      // Load page content.
      pageRoot.replaceChildren(
        contentTemplate.content.cloneNode(true)
      );

      // Add shared header.
      const header = headerTemplate.content
        .firstElementChild.cloneNode(true);

      // Add shared footer.
      const footer = footerTemplate.content
        .firstElementChild.cloneNode(true);

      // Prevent duplicate shared elements.
      document.querySelector("header")?.remove();
      document.querySelector("footer")?.remove();

      pageRoot.before(header);
      pageRoot.after(footer);

      initializeSharedPage();
      initializeLanguageSystem();

      if (pageName === "qr.html") {
        initializeQR();
      }

      document.dispatchEvent(
        new CustomEvent("portfolio:pageLoaded", {
          detail: {
            page: pageName,
            template: page.template
          }
        })
      );

    } catch (error) {
      console.error("Portfolio Page System:", error);

      pageRoot.textContent =
        "This page could not be loaded. Please refresh.";
    }
  }

  // Shared page setup.
  function initializeSharedPage() {
    document.documentElement.dataset.portfolioPage =
      pageName.replace(".html", "");

    const homeLink = document.querySelector(
      '.main-nav a[href="index.html"]'
    );

    if (homeLink) {
      homeLink.href = "index.html";
    }
  }

  // Shared Language System.
  function initializeLanguageSystem() {
    const engine = window.EULLIYANS_LANG;
    const dictionary = window.PORTFOLIO_DICTIONARY;

    if (!engine || !dictionary) {
      console.warn(
        "Portfolio Page System: Language Engine or dictionary not found."
      );
      return;
    }

    const supportedLanguages = [
      "en",
      "bn",
      "ar",
      "hi",
      "ur"
    ];

    supportedLanguages.forEach(function (language) {
      if (dictionary[language]) {
        engine.register(language, dictionary[language]);
      }
    });

    engine.init({
      defaultLanguage: "en",
      fallbackLanguage: "en",
      storageKey: "eulliyans_language",
      directionMap: {
        en: "ltr",
        bn: "ltr",
        ar: "rtl",
        hi: "ltr",
        ur: "rtl"
      }
    });

    const toggle = document.getElementById("languageToggle");
    const menu = document.getElementById("languageMenu");
    const currentLanguage =
      document.getElementById("currentLanguage");

    if (!toggle || !menu || !currentLanguage) return;

    function updateLanguageButton(language) {
      currentLanguage.textContent =
        language.toUpperCase();
    }

    updateLanguageButton(engine.getLanguage());

    toggle.addEventListener("click", function () {
      const isOpen = menu.classList.toggle("show");

      toggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });

    menu.querySelectorAll("[data-language]").forEach(
      function (button) {
        button.addEventListener("click", function () {
          const language = button.dataset.language;

          if (engine.setLanguage(language)) {
            updateLanguageButton(language);
            menu.classList.remove("show");
            toggle.setAttribute("aria-expanded", "false");
          }
        });
      }
    );

    document.addEventListener("click", function (event) {
      if (
        !toggle.contains(event.target) &&
        !menu.contains(event.target)
      ) {
        menu.classList.remove("show");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener(
      "eulliyans:languageChanged",
      function (event) {
        updateLanguageButton(event.detail.language);
      }
    );
  }

  // QR Code functionality.
  function initializeQR() {
    const portfolioURL =
      "https://eulliyans.github.io/personal-portfolio/";

    const qrContainer = document.getElementById("qrcode");
    const status = document.getElementById("qrStatus");
    const downloadButton =
      document.getElementById("downloadQRButton");

    if (!qrContainer || !status || !downloadButton) return;

    function generateQR() {
      if (typeof QRCode === "undefined") {
        status.textContent =
          "QR Code could not load. Please refresh.";
        return;
      }

      qrContainer.replaceChildren();

      new QRCode(qrContainer, {
        text: portfolioURL,
        width: 170,
        height: 170,
        colorDark: "#123b2b",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });

      status.textContent = "QR Code ready!";
    }

    function downloadQR() {
      const canvas = qrContainer.querySelector("canvas");
      const image = qrContainer.querySelector("img");

      let imageURL = "";

      if (canvas) {
        imageURL = canvas.toDataURL("image/png");
      } else if (image && image.src) {
        imageURL = image.src;
      }

      if (!imageURL) {
        status.textContent =
          "QR Code is not ready yet.";
        return;
      }

      const link = document.createElement("a");

      link.href = imageURL;
      link.download = "eulliyans-portfolio-qr.png";
      link.click();
    }

    downloadButton.addEventListener("click", downloadQR);

    if (typeof QRCode !== "undefined") {
      generateQR();
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

    script.onload = generateQR;

    script.onerror = function () {
      status.textContent =
        "QR Code could not load. Please refresh.";
    };

    document.head.appendChild(script);
  }

  loadPageTemplate();

})();
