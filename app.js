// Keep the service inventory here: adding a service only requires a new entry.
const SERVICES = [
  { id: "xng", name: "Search Engine", hint: "SearXNG instance", icon: "1F50D", href: "/xng/" },
  { id: "kutt", name: "Link Shortener", hint: "Versatile URLs", icon: "1F517", href: "/kutt/" },
  { id: "files", name: "File Drop", hint: "Temporary storage", icon: "1F4E4", href: "/copyparty/" },
  { id: "yt", name: "YT Frontend", hint: "Invidious instance", icon: "1F3AC", href: "/invidious/" },
  { id: "pics", name: "Picsur", hint: "Imgur alternative", icon: "1F5BC", href: "/picsur/" },
  { id: "bin", name: "PrivateBin", hint: "Pastebin alternative", icon: "1F4CB", href: "/bin/" },
  { id: "git", name: "Gitea", hint: "Git Backup instance", icon: "1F5C3", href: "/git/" },
  { id: "nms", name: "Network Monitoring", hint: "LibreNMS instance", icon: "1F4F0", href: "/nms/" }
  //{ id: "ffmpeg", name: "Media Convert", hint: "ffmpeg-web tools", icon: "1F39E", href: "/ffmpeg/" }
  //{ id: "paint", name: "JSPaint 2D", hint: "Microsoft Paint from Windows 98", icon: "1F3A8", href: "/ffmpeg/" }
];

const THEME_STORAGE_KEY = "theme";
const root = document.documentElement;
root.classList.add("js-enabled");
const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

// Resolve and apply the saved or system theme before the stylesheet can paint.
function getSavedTheme() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : null;
  } catch (error) {
    console.warn("The saved theme could not be read; using the system preference.", error);
    return null;
  }
}

let hasSavedTheme = false;

function applyTheme(theme) {
  root.dataset.theme = theme;

  const toggle = document.getElementById("theme-toggle");
  const label = document.getElementById("theme-toggle-label");

  if (toggle && label) {
    const isDark = theme === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", `Use ${isDark ? "light" : "dark"} theme`);
    label.textContent = `${isDark ? "Light" : "Dark"} theme`;
  }
}

const savedTheme = getSavedTheme();
hasSavedTheme = savedTheme !== null;
applyTheme(savedTheme || (colorScheme.matches ? "dark" : "light"));

// One randomized set of hues and positions is reused for both theme palettes.
// Theme-specific CSS supplies the lightness, so dark mode stays deep and calm.
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setGradientVariation() {
  const hues = {
    "--light-glow-a-hue": randomBetween(250, 315),
    "--light-glow-b-hue": randomBetween(160, 198),
    "--light-glow-c-hue": randomBetween(300, 340),
    "--dark-glow-a-hue": randomBetween(220, 260),
    "--dark-glow-b-hue": randomBetween(160, 190),
    "--dark-glow-c-hue": randomBetween(235, 275)
  };
  const positions = {
    "--glow-a-x": `${randomBetween(12, 40)}%`,
    "--glow-a-y": `${randomBetween(10, 34)}%`,
    "--glow-b-x": `${randomBetween(62, 88)}%`,
    "--glow-b-y": `${randomBetween(24, 55)}%`,
    "--glow-c-x": `${randomBetween(30, 70)}%`,
    "--glow-c-y": `${randomBetween(65, 92)}%`
  };

  Object.entries({ ...hues, ...positions }).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

setGradientVariation();

// Build each card from text and attributes rather than injecting HTML strings.
function createServiceCard(service) {
  const link = document.createElement("a");
  link.className = "service-card";
  link.href = service.href;
  link.setAttribute("aria-labelledby", `${service.id}-name ${service.id}-hint`);

  const icon = document.createElement("img");
  icon.className = "service-card__icon";
  icon.src = `icons/openmoji/${service.icon}.svg`;
  icon.alt = "";
  icon.width = 56;
  icon.height = 56;

  const name = document.createElement("span");
  name.className = "service-card__name";
  name.id = `${service.id}-name`;
  name.textContent = service.name;

  const hint = document.createElement("span");
  hint.className = "service-card__hint";
  hint.id = `${service.id}-hint`;
  hint.textContent = service.hint;

  link.append(icon, name, hint);
  return link;
}

function renderServices() {
  const grid = document.getElementById("service-grid");
  if (!grid) {
    console.error("The service grid element is missing; service links were not rendered.");
    return;
  }

  const cards = document.createDocumentFragment();
  SERVICES.forEach((service) => cards.append(createServiceCard(service)));
  grid.append(cards);
}

function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    hasSavedTheme = true;
  } catch (error) {
    console.warn("The theme changed, but could not be saved in this browser.", error);
  }
}

function setupThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) {
    console.error("The theme toggle button is missing.");
    return;
  }

  // Sync the control after markup exists; the initial theme was applied in <head>.
  applyTheme(root.dataset.theme);

  toggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });

  // Keep following the operating system until the visitor chooses a theme.
  const followSystemTheme = (event) => {
    if (!hasSavedTheme) {
      applyTheme(event.matches ? "dark" : "light");
    }
  };

  if (typeof colorScheme.addEventListener === "function") {
    colorScheme.addEventListener("change", followSystemTheme);
  } else if (typeof colorScheme.addListener === "function") {
    colorScheme.addListener(followSystemTheme);
  }
}

// The head script runs before the page markup; wait until the controls exist.
document.addEventListener("DOMContentLoaded", () => {
  renderServices();
  setupThemeToggle();
});
