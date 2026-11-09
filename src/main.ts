const root = document.documentElement;
const themeButton = document.querySelector<HTMLButtonElement>("#theme");
const menuButton = document.querySelector<HTMLButtonElement>("#menu");
const mobilePanel = document.querySelector<HTMLElement>("#mobile");
const header = document.querySelector("header.site-header");
const year = document.querySelector("#year");

function syncTheme(dark: boolean): void {
  root.classList.toggle("dark", dark);
  themeButton?.setAttribute("aria-pressed", String(dark));
  themeButton?.setAttribute("aria-label", dark ? "切换到浅色主题" : "切换到深色主题");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#111111" : "#f7f7f5");
}

syncTheme(root.classList.contains("dark"));

themeButton?.addEventListener("click", () => {
  const next = !root.classList.contains("dark");
  syncTheme(next);
  try {
    localStorage.setItem("daijiaobu-theme", next ? "dark" : "light");
  } catch {
    /* privacy mode keeps the choice for this page only */
  }
});

function closeMenu(restoreFocus = false): void {
  mobilePanel?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "打开导航");
  if (restoreFocus) menuButton?.focus();
}

menuButton?.addEventListener("click", () => {
  const open = mobilePanel?.classList.toggle("open") ?? false;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
});

mobilePanel?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => closeMenu());
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobilePanel?.classList.contains("open")) {
    closeMenu(true);
  }
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Node)) return;
  if (mobilePanel?.contains(event.target) || menuButton?.contains(event.target)) return;
  closeMenu();
});

if (header) {
  header.addEventListener("focusout", (event) => {
    const next = event instanceof FocusEvent ? event.relatedTarget : null;
    if (next instanceof Node && header.contains(next)) return;
    closeMenu();
  });
}

matchMedia("(min-width: 1001px)").addEventListener("change", () => closeMenu());

if (year) year.textContent = String(new Date().getFullYear());

const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>(".toc a")];
const tocTargets = tocLinks
  .map((link) => {
    const id = decodeURIComponent(link.hash.replace(/^#/, ""));
    const section = id ? document.getElementById(id) : null;
    return section ? { link, section } : null;
  })
  .filter((item): item is { link: HTMLAnchorElement; section: HTMLElement } => item !== null);

if (tocTargets.length > 0 && "IntersectionObserver" in window) {
  const visible = new Map<Element, number>();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visible.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
      });
      const current = tocTargets
        .map((item) => ({ ...item, ratio: visible.get(item.section) ?? 0 }))
        .sort((a, b) => b.ratio - a.ratio)[0];
      tocLinks.forEach((link) => link.classList.remove("is-current"));
      if (current && current.ratio > 0) current.link.classList.add("is-current");
    },
    { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.6] },
  );
  tocTargets.forEach((item) => observer.observe(item.section));
}

const dialog = document.querySelector<HTMLDialogElement>("#lightbox");
const stage = document.querySelector<HTMLElement>("#lightbox-stage");
const caption = document.querySelector<HTMLElement>("#lightbox-caption");

document.querySelectorAll<HTMLButtonElement>(".shot-open").forEach((button) => {
  button.addEventListener("click", () => {
    if (!dialog || !stage || !caption) return;
    const phone = button.querySelector(".phone");
    if (!phone) return;
    stage.replaceChildren(phone.cloneNode(true));
    const title = button.dataset.title ?? "示意图";
    const note = button.dataset.note ?? "替代示意图，不是原站录屏。";
    caption.textContent = `${title}。${note}`;
    dialog.showModal();
  });
});

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dialog?.addEventListener("close", () => {
  stage?.replaceChildren();
});
