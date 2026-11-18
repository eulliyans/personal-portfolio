
/*
  EULLIYAN'S PERSONAL PORTFOLIO
  Shared Page System
  Version: 1.1.0

  Purpose:
  - Load the correct page template.
  - Preserve original page URLs.
  - Prepare shared Header and Footer support.
  - Prepare Language Engine integration.
  - Keep QR Code functionality.
  - Never interfere with the Home page.
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

  // Keep the Home page untouched.
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

      const template = templateDocument.getElementById(
        page.template
      );

      if (!template) {
        throw new Error(
          "Page template not found: " + page.template
        );
      }

      pageRoot.replaceChildren(
        template.content.cloneNode(true)
      );

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
      console.error(
        "Portfolio Page System:",
        error
      );

      pageRoot.textContent =
        "This page could not be loaded. Please refresh.";
    }
  }

  // Shared page initialization.
  function initializeSharedPage() {
    document.documentElement.dataset.portfolioPage =
      pageName.replace(".html", "");

    // Shared Header and Footer will be connected
    // after their templates are added.
  }

  // Language Engine integration.
  function initializeLanguageSystem() {
    const engine = window.EULLIYANS_LANG;

    if (!engine) {
      console.warn(
        "Portfolio Page System: Language Engine not found."
      );
      return;
    }

    if (typeof engine.init === "function") {
      engine.init();
    }

    const currentLanguage =
      typeof engine.getLanguage === "function"
        ? engine.getLanguage() || "en"
        : "en";

    document.documentElement.lang = currentLanguage;

    document.documentElement.dir =
      currentLanguage === "ar" ||
      currentLanguage === "ur"
        ? "rtl"
        : "ltr";

    document.dispatchEvent(
      new CustomEvent("portfolio:languageReady", {
        detail: {
          language: currentLanguage
        }
      })
    );
  }

  // QR Code functionality.
  function initializeQR() {
    const portfolioURL =
      "https://eulliyans.github.io/personal-portfolio/";

    const qrContainer =
      document.getElementById("qrcode");

    const status =
      document.getElementById("qrStatus");

    const downloadButton =
      document.getElementById("downloadQRButton");

    if (!qrContainer || !status || !downloadButton) {
      return;
    }

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
      const canvas =
        qrContainer.querySelector("canvas");

      const image =
        qrContainer.querySelector("img");

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
      link.download =
        "eulliyans-portfolio-qr.png";

      link.click();
    }

    downloadButton.addEventListener(
      "click",
      downloadQR
    );

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
