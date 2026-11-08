(() => {
  const data = window.PORTFOLIO_DATA;
  if (!data) return;

  document.querySelectorAll("[data-profile]").forEach(el => {
    const key = el.dataset.profile;
    if (data.profile[key]) el.textContent = data.profile[key];
  });

  const projectGrid = document.getElementById("projectGrid");
  projectGrid.innerHTML = data.projects.map(project => `
    <article class="project-card">
      <div class="project-visual"><span>${escapeHTML(project.label || project.symbol)}</span></div>
      <div class="project-content">
        <h3>${escapeHTML(project.name)}</h3>
        <p>${escapeHTML(project.description)}</p>
        <a class="button button-primary" href="${safeURL(project.link)}">View Project&nbsp; →</a>
      </div>
    </article>`).join("");

  const socialMarkup = data.socials.map(item =>
    `<a class="social-link ${escapeHTML(item.className)}" href="${safeURL(item.url)}" aria-label="${escapeHTML(item.name)}" title="${escapeHTML(item.name)}">${escapeHTML(item.short)}</a>`
  ).join("");
  document.getElementById("socialLinks").innerHTML = socialMarkup;
  document.getElementById("footerSocial").innerHTML = socialMarkup;
  document.querySelectorAll('[data-link="videos"]').forEach(link => link.href = safeURL(data.links.videos));
  document.getElementById("year").textContent = new Date().getFullYear();

  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "×" : "☰";
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "☰";
  }));

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[char]));
  }
  function safeURL(value) {
    const url = String(value || "#").trim();
    return /^(https?:\/\/|mailto:|tel:|#)/i.test(url) ? escapeHTML(url) : "#";
  }
})();
