
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

  const previewLabels = [
    "PRAYER TIMES",
    "FOOD & ORDER",
    "FOOD MARKET",
    "FINANCIAL DASHBOARD"
  ];

  const previewContent = [
    `<div class="mini-prayer">
       <strong>🕌 DIGITAL MOSQUE</strong>
       <span>FAJR　 DHUHR　 ASR</span>
       <b>04:45　12:45　15:30</b>
       <small>Prayer & Adhkar</small>
     </div>`,

    `<div class="mini-cafe">
       <strong>FAWAZ</strong>
       <span>Fresh Food · Great Taste</span>
       <div class="mini-food">🍔　🍕　🥤</div>
       <b>ORDER NOW →</b>
     </div>`,

    `<div class="mini-bufia">
       <strong>BUFIA ZAMZAM</strong>
       <span>Food Marketplace</span>
       <div class="mini-food">🍗　🍟　🍰</div>
       <b>SHOP & EARN REWARDS</b>
     </div>`,

    `<div class="mini-arthik">
       <strong>📊 FINANCIAL REPORT</strong>
       <span>Total Budget</span>
       <b>৳ 12,50,000</b>
       <div class="mini-bar"><i></i></div>
       <small>Transparency · Accountability</small>
     </div>`
  ];

  projectGrid.innerHTML = data.projects.map((project, i) => `
    <article class="project-card">
      <div class="project-visual project-visual-${i + 1}">
        <div class="project-mini-preview">
          ${previewContent[i]}
        </div>
      </div>

      <div class="project-content">
        <h3>${escapeHTML(project.name)}</h3>
        <p>${escapeHTML(t.projectDescriptions[i] || project.description)}</p>

        <div class="project-actions">
          <a class="button button-primary" href="${safeURL(project.link)}">
            ${escapeHTML(t.viewProject)} →
          </a>

          <button class="button button-secondary"
                  type="button"
                  data-view-card="${i}">
            ${lang === "bn" ? "কার্ড দেখুন" :
              lang === "ar" ? "عرض البطاقة" : "View Card"}
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

  // PROJECT CARD PREVIEW POPUP
  const projectModal = document.createElement("div");
  projectModal.className = "project-modal";
  projectModal.hidden = true;

  projectModal.innerHTML = `
    <div class="project-modal-backdrop" data-modal-close></div>

    <section class="project-modal-dialog"
             role="dialog"
             aria-modal="true"
             aria-labelledby="projectModalTitle">

      <button class="project-modal-close"
              type="button"
              data-modal-close
              aria-label="Close">×</button>

      <span class="project-modal-label">PROJECT PREVIEW</span>

      <h2 id="projectModalTitle"></h2>

      <div class="project-modal-preview"></div>

      <p class="project-modal-description"></p>
    </section>
  `;

  document.body.appendChild(projectModal);

  function closeProjectModal() {
    projectModal.hidden = true;
    document.body.classList.remove("project-modal-open");
  }

  projectGrid.addEventListener("click", function(event) {
    const button = event.target.closest("[data-view-card]");
    if (!button) return;

    const index = Number(button.dataset.viewCard);
    const project = data.projects[index];

    if (!project) return;

    const card = button.closest(".project-card");
    const preview = card.querySelector(".project-visual");

    projectModal.querySelector("#projectModalTitle").textContent =
      project.name;

    projectModal.querySelector(".project-modal-description").textContent =
      translations[document.documentElement.lang]?.projectDescriptions[index]
      || project.description;

    projectModal.querySelector(".project-modal-preview").innerHTML =
      preview.innerHTML;

    projectModal.hidden = false;
    document.body.classList.add("project-modal-open");

    projectModal.querySelector(".project-modal-close").focus();
  });

  projectModal.addEventListener("click", function(event) {
    if (event.target.closest("[data-modal-close]")) {
      closeProjectModal();
    }
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && !projectModal.hidden) {
      closeProjectModal();
    }
  });


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
