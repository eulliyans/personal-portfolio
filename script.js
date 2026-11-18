
(() => {
  "use strict";

  const data = window.PORTFOLIO_DATA;
  const dictionary = window.PORTFOLIO_DICTIONARY;
  const engine = window.EULLIYANS_LANG;

  if (!data || !dictionary || !engine) {
    console.error("EULLIYAN'S Portfolio: Required files not found.");
    return;
  }

  const projectGrid = document.getElementById("projectGrid");
  const languageButton = document.querySelector(".language-button");

  const languages = ["en", "bn", "ar", "hi", "ur", "fr"];

  const languageLabels = {
    en: "EN",
    bn: "বাংলা",
    ar: "العربية",
    hi: "हिन्दी",
    ur: "اردو",
    fr: "FR"
  };

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function safeURL(value) {
    const url = String(value || "#").trim();

    return /^(https?:\/\/|mailto:|tel:|#)/i.test(url)
      ? escapeHTML(url)
      : "#";
  }

  function renderProjects(lang) {
    if (!projectGrid) return;

    const projectSlugs = [
      "digital-mosque",
      "fawaz-cafeteria",
      "bufia-zamzam",
      "arthik-swachchhota"
    ];

    projectGrid.innerHTML = data.projects.map((project, i) => `
      <article class="project-card">

        <a class="project-visual"
           href="project-card.html?project=${projectSlugs[i]}"
           aria-label="Open ${escapeHTML(project.name)} card">

          <span>${escapeHTML(
            engine.t("projectLabels." + i, {}, lang)
          )}</span>

        </a>

        <div class="project-content">

          <h3>${escapeHTML(project.name)}</h3>

          <p>${escapeHTML(
            engine.t("projectDescriptions." + i, {}, lang)
          )}</p>

          <a class="button button-outline"
             href="project-card.html?project=${projectSlugs[i]}"
             style="margin-bottom: 12px;">
            Card
          </a>

          <a class="button button-primary" href="${safeURL(project.link)}">
            ${escapeHTML(engine.t("viewProject", {}, lang))}&nbsp; →
          </a>

        </div>
      </article>
    `).join("");
  }

  const socialMarkup = data.socials.map(item => `
    <a class="social-link ${escapeHTML(item.className)}"
       href="${safeURL(item.url)}"
       aria-label="${escapeHTML(item.name)}"
       title="${escapeHTML(item.name)}">
       ${escapeHTML(item.short)}
    </a>
  `).join("");

  const socialLinks = document.getElementById("socialLinks");
  const footerSocial = document.getElementById("footerSocial");

  if (socialLinks) socialLinks.innerHTML = socialMarkup;
  if (footerSocial) footerSocial.innerHTML = socialMarkup;

  document.querySelectorAll('[data-link="videos"]').forEach(link => {
    link.href = safeURL(data.links.videos);
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  function updatePortfolioContent(lang) {
    document.querySelectorAll("[data-profile]").forEach(el => {
      const key = el.dataset.profile;

      if (dictionary[lang] && typeof dictionary[lang][key] === "string") {
        el.textContent = engine.t(key, {}, lang);
      } else if (data.profile[key] !== undefined) {
        el.textContent = data.profile[key];
      }
    });

    renderProjects(lang);

    if (languageButton) {
      const label = languageButton.querySelector("span");

      if (label) {
        label.textContent = languageLabels[lang] || lang.toUpperCase();
      }

      languageButton.setAttribute("aria-label", "Change language");
    }
  }

  // Register all Portfolio dictionaries
  languages.forEach(lang => {
    if (dictionary[lang]) {
      engine.register(lang, dictionary[lang]);
    }
  });

  // Keep the previous saved-language storage key
  engine.init({
    defaultLanguage: "en",
    fallbackLanguage: "en",
    storageKey: "eulliyans-language"
  });

  updatePortfolioContent(engine.getLanguage());

  // Update dynamic Portfolio content when language changes
  document.addEventListener("eulliyans:languageChanged", event => {
    updatePortfolioContent(event.detail.language);
  });

  // Existing language button, now supporting six languages
  if (languageButton) {
    languageButton.addEventListener("click", () => {
      const currentLanguage = engine.getLanguage();
      const index = languages.indexOf(currentLanguage);
      const nextLanguage = languages[(index + 1) % languages.length];

      engine.setLanguage(nextLanguage);
    });
  }

  // Existing mobile menu behavior
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");

      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "×" : "☰";
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      });
    });
  }
})();
