
/*
  EULLIYAN'S PERSONAL PORTFOLIO
  Shared Page System
  Version: 1.3.0
*/

(function () {
  "use strict";

  // ==========================================
  // 01. PAGE CONFIGURATION
  // STATUS: ACTIVE
  // ==========================================

   const PAGE_CONFIG = {
    about: {
      template: "about-content",
      bodyClass: "about-page"
    },
    projects: {
      template: "projects-content",
      bodyClass: "projects-page"
    },
    websites: {
      template: "websites-content",
      bodyClass: "websites-page"
    },
    videos: {
      template: "videos-content",
      bodyClass: "videos-page"
    },
    reels: {
      template: "reels-content",
      bodyClass: "reels-page"
    },
    qr: {
      template: "qr-content",
      bodyClass: "qr-page"
    }
  };

  const pageKey = new URLSearchParams(
    window.location.search
  ).get("page");

  const page = PAGE_CONFIG[pageKey];

  // Never interfere with Home.
  if (!page) return;

  // Keep compatibility with existing page system logic.
  const pageName = pageKey + ".html";

    // Prepare shared page root.
  document.querySelector("header")?.remove();
  document.querySelector("main")?.remove();
  document.querySelector("footer")?.remove();

  const pageRoot = document.createElement("div");
  pageRoot.id = "page-root";

  document.body.appendChild(pageRoot);

  // Load shared page styles.
  const pageStyles = document.createElement("link");
  pageStyles.rel = "stylesheet";
  pageStyles.href = "common.css";
  document.head.appendChild(pageStyles);
  // ==========================================
  // 02. LOAD SHARED PAGE TEMPLATE
  // STATUS: ACTIVE
  // ==========================================

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

      // Create shared header.
      const header = headerTemplate.content
        .firstElementChild.cloneNode(true);

      // Create shared footer.
      const footer = footerTemplate.content
        .firstElementChild.cloneNode(true);

      // Prevent duplicate shared elements.
      document.querySelector("header")?.remove();
      document.querySelector("footer")?.remove();

      pageRoot.before(header);
      pageRoot.after(footer);

      // Prepare translation targets.
      preparePageTranslationTargets(footer);

      initializeSharedPage();

      // Initialize language system.
      initializeLanguageSystem();

      // Initialize QR functionality.
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


  // ==========================================
  // 03. PREPARE TRANSLATION TARGETS
  // STATUS: ACTIVE
  // ==========================================

  function preparePageTranslationTargets(footer) {

    // Projects page.
    if (pageName === "projects.html") {
      document.getElementById("pageTitle")
        ?.setAttribute("data-i18n", "projectsPage.title");

      document.getElementById("pageDescription")
        ?.setAttribute("data-i18n", "projectsPage.description");
    }

    // Videos page.
    if (pageName === "videos.html") {
      document.getElementById("pageTitle")
        ?.setAttribute("data-i18n", "videosPage.title");

      document.getElementById("pageDescription")
        ?.setAttribute("data-i18n", "videosPage.description");

      document.getElementById("placeholderTitle")
        ?.setAttribute("data-i18n", "videosPage.placeholderTitle");

      document.getElementById("placeholderDescription")
        ?.setAttribute("data-i18n", "videosPage.placeholderDescription");
    }

    // Reels page.
    if (pageName === "reels.html") {
      document.getElementById("pageTitle")
        ?.setAttribute("data-i18n", "reelsPage.title");

      document.getElementById("pageDescription")
        ?.setAttribute("data-i18n", "reelsPage.description");

      document.getElementById("placeholderTitle")
        ?.setAttribute("data-i18n", "reelsPage.placeholderTitle");

      document.getElementById("placeholderDescription")
        ?.setAttribute("data-i18n", "reelsPage.placeholderDescription");
    }

    // Shared footer.
    if (footer) {
      footer.setAttribute("data-i18n", "pageFooter");
    }
  }


  // ==========================================
  // 04. SHARED PAGE SETUP
  // STATUS: ACTIVE
  // ==========================================

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


  // ==========================================
  // 05. NESTED DICTIONARY SUPPORT
  // STATUS: ACTIVE
  // ==========================================

  function getNestedValue(object, path) {
    if (!object || !path) return undefined;

    return path.split(".").reduce(function (value, key) {
      if (
        !value ||
        typeof value !== "object" ||
        !Object.prototype.hasOwnProperty.call(value, key)
      ) {
        return undefined;
      }

      return value[key];
    }, object);
  }


  // ==========================================
  // 06. PROJECTS PAGE TRANSLATIONS
  // STATUS: ACTIVE
  // ==========================================

  function translateProjects(language, dictionary) {
    if (pageName !== "projects.html") return;

    const projects = getNestedValue(
      dictionary[language],
      "projectsPage.projects"
    );

    if (!Array.isArray(projects)) return;

    const projectCards = document.querySelectorAll(".project-box");

    projectCards.forEach(function (card, index) {
      const project = projects[index];

      if (!Array.isArray(project)) return;

      const title = card.querySelector("h2");
      const description = card.querySelector("p");

      if (title && typeof project[0] === "string") {
        title.textContent = project[0];
      }

      if (description && typeof project[1] === "string") {
        description.textContent = project[1];
      }
    });
  }


  // ==========================================
  // 07. SHARED LANGUAGE SYSTEM
  // STATUS: ACTIVE
  // ==========================================

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

    // Register page-compatible dictionaries.
    supportedLanguages.forEach(function (language) {
      if (!dictionary[language]) return;

      const pageDictionary = Object.assign(
        {},
        dictionary[language]
      );

      // Websites page uses flat data-i18n keys.
      if (pageName === "websites.html") {
        Object.assign(
          pageDictionary,
          pageDictionary.websitesPage || {}
        );
      }

      // QR page uses flat data-i18n keys.
      if (pageName === "qr.html") {
        Object.assign(
          pageDictionary,
          pageDictionary.qrPage || {}
        );
      }

      engine.register(language, pageDictionary);
    });

    // Initialize Core Language Engine.
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

    // Update language button.
    function updateLanguageButton(language) {
      currentLanguage.textContent =
        language.toUpperCase();
    }

    // Apply page-specific translations.
    function applyPageTranslations(language) {
      translateProjects(language, dictionary);
    }

    updateLanguageButton(engine.getLanguage());

    applyPageTranslations(engine.getLanguage());

    // Open and close language menu.
    toggle.addEventListener("click", function () {
      const isOpen = menu.classList.toggle("show");

      toggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });

    // Select language.
    menu.querySelectorAll("[data-language]").forEach(
      function (button) {
        button.addEventListener("click", function () {
          const language = button.dataset.language;

          if (engine.setLanguage(language)) {
            updateLanguageButton(language);
            applyPageTranslations(language);

            menu.classList.remove("show");

            toggle.setAttribute("aria-expanded", "false");
          }
        });
      }
    );

    // Close menu when clicking outside.
    document.addEventListener("click", function (event) {
      if (
        !toggle.contains(event.target) &&
        !menu.contains(event.target)
      ) {
        menu.classList.remove("show");

        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Listen for language changes from other components.
    document.addEventListener(
      "eulliyans:languageChanged",
      function (event) {
        const language = event.detail.language;

        updateLanguageButton(language);
        applyPageTranslations(language);
      }
    );
  }


  // ==========================================
  // 08. QR CODE FUNCTIONALITY
  // STATUS: ACTIVE
  // ==========================================

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

    // Load QRCode library when needed.
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


  // ==========================================
  // 09. START SHARED PAGE SYSTEM
  // STATUS: ACTIVE
  // ==========================================

  loadPageTemplate();

})();
