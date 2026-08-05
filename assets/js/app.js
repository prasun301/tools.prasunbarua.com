// ==========================================
// CENTRAL TOOL DATASET
// ==========================================
const TOOLS_DATA = [
  {
    id: "ohms-law-calculator",
    title: "Ohm's Law Calculator",
    icon: "⚡",
    category: "Electrical Tools",
    categorySlug: "electrical",
    description: "Calculate voltage, current, resistance, and power instantly.",
    keywords: ["ohm", "law", "voltage", "current", "resistance", "power", "amps", "volts", "watts", "electrical"],
    url: "/tools/ohms-law-calculator.html"
  },
  {
    id: "solar-pv-calculator", // ✅ corrected ID
    title: "Solar PV Calculator",
    icon: "☀️",
    category: "Solar PV Tools",
    categorySlug: "solar",
    description: "Estimate solar capacity, battery sizing, and daily energy output.",
    keywords: ["solar", "pv", "panel", "energy", "battery", "inverter", "renewable", "kw", "kwh", "sun"],
    url: "/tools/solar-pv-calculator.html"
  },
  ...
];

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================
function initApp() {
  try { initThemeSystem(); } catch(e) { console.warn("Theme module skipped:", e.message); }
  try { initMobileMenu(); } catch(e) { console.warn("Menu module skipped:", e.message); }
  try { initToolRenderer(); } catch(e) { console.warn("Renderer module skipped:", e.message); }
  try { initCategoryFilter(); } catch(e) { console.warn("Filter module skipped:", e.message); }
  try { initGoogleSearch(); } catch(e) { console.warn("Search module skipped:", e.message); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
