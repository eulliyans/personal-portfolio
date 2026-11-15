
(() => {
  const data = window.PORTFOLIO_DATA;
  if (!data) return;

  const translations = data.translations;
  const projectGrid = document.getElementById("projectGrid");
  const languageButton = document.querySelector(".language-button");

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
      ? escapeHTML(url) : "#";
  }

  function renderProjects(lang) {
    const t = translations[lang];

    projectGrid.innerHTML = data.projects.map((project, i) => `
      <article class="project-card">
        <div class="project-visual">
          <span>${escapeHTML(t.projectLabels[i] || project.label || project.symbol)}</span>
        </div>
        <div class="project-content">
          <h3>${escapeHTML(project.name)}</h3>
          <p>${escapeHTML(t.projectDescriptions[i] || project.description)}</p>
          <a class="button button-primary" href="${safeURL(project.link)}">
            ${escapeHTML(t.viewProject)}&nbsp; →
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

  document.getElementById("socialLinks").innerHTML = socialMarkup;
  document.getElementById("footerSocial").innerHTML = socialMarkup;

  document.querySelectorAll('[data-link="videos"]').forEach(link => {
    link.href = safeURL(data.links.videos);
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  function setLanguage(lang) {
    if (!translations[lang]) lang = "en";

    const t = translations[lang];

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.textContent = t[key];
    });

    document.querySelectorAll("[data-profile]").forEach(el => {
      const key = el.dataset.profile;
      if (t[key] !== undefined) el.textContent = t[key];
      else if (data.profile[key] !== undefined) {
        el.textContent = data.profile[key];
      }
    });

    renderProjects(lang);

    if (languageButton) {
      const label = languageButton.querySelector("span");
      if (label) {
        label.textContent = lang === "bn" ? "বাংলা" :
                            lang === "ar" ? "العربية" : "EN";
      }
      languageButton.setAttribute("aria-label", "Change language");
    }

    try {
      localStorage.setItem("eulliyans-language", lang);
    } catch (e) {}
  }

  const languages = ["en", "bn", "ar"];
  let currentLanguage = "en";

  try {
    const saved = localStorage.getItem("eulliyans-language");
    if (languages.includes(saved)) currentLanguage = saved;
  } catch (e) {}

  if (languageButton) {
    languageButton.addEventListener("click", () => {
      const index = languages.indexOf(currentLanguage);
      currentLanguage = languages[(index + 1) % languages.length];
      setLanguage(currentLanguage);
    });
  }

  setLanguage(currentLanguage);

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
