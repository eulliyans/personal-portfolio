
/*
  EULLIYAN'S PERSONAL PORTFOLIO
  Shared Page System
  Version: 1.0.0

  Purpose:
  - Load the correct page template automatically.
  - Keep the original page URLs.
  - Initialize QR Code functionality.
  - Avoid changing the existing Home page.
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

  // Do not interfere with the Home page.
  if (!page) return;

  document.body.classList.add(page.bodyClass);

  async function loadPageTemplate() {
    try {
      const response = await fetch("page-template.html");

      if (!response.ok) {
        throw new Error("Template file could not be loaded.");
      }

      const html = await response.text();

      const parser = new DOMParser();
      const documentTemplate = parser.parseFromString(
        html,
        "text/html"
      );

      const template = documentTemplate.getElementById(
        page.template
      );

      if (!template) {
        throw new Error("Page template not found: " + page.template);
      }

      const pageRoot = document.getElementById("page-root");

      if (!pageRoot) {
        throw new Error(
          'Missing <div id="page-root"></div> in the page HTML.'
        );
      }

      pageRoot.replaceChildren(
        template.content.cloneNode(true)
      );

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

      const pageRoot = document.getElementById("page-root");

      if (pageRoot) {
        pageRoot.textContent =
          "This page could not be loaded. Please refresh.";
      }
    }
  }

  // QR Code functionality
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
        status.textContent = "QR Code is not ready yet.";
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
