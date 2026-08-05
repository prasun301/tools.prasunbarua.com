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
    url: "tools/ohms-law-calculator.html"
  },
  {
    id: "solar-pv-calculator",
    title: "Solar PV Calculator",
    icon: "☀️",
    category: "Solar PV Tools",
    categorySlug: "solar",
    description: "Estimate solar capacity, battery sizing, and daily energy output.",
    keywords: ["solar", "pv", "panel", "energy", "battery", "inverter", "renewable", "kw", "kwh", "sun"],
    url: "tools/solar-pv-calculator.html"
  }
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

// ==========================================
// THEME SYSTEM (Dark / Light Mode Toggle)
// ==========================================
function initThemeSystem() {
  const themeToggleBtn = document.getElementById('themeToggle');
  if (!themeToggleBtn) return;

  const userPref = localStorage.getItem('theme');
  const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  let currentTheme = userPref || systemPref;

  applyTheme(currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  const lightIcon = document.querySelector('.theme-icon-light');
  const darkIcon = document.querySelector('.theme-icon-dark');
  
  if (lightIcon && darkIcon) {
    lightIcon.style.display = isDark ? 'none' : 'inline';
    darkIcon.style.display = isDark ? 'inline' : 'none';
  }
}

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  if (!mobileMenuBtn || !navMenu) return;

  mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
  });
}

// ==========================================
// TOOL GRID RENDERER
// ==========================================
function renderTools(toolsToRender) {
  const toolsGrid = document.getElementById('toolsGrid');
  const noResultsState = document.getElementById('noResultsState');
  if (!toolsGrid) return;

  toolsGrid.innerHTML = '';

  if (toolsToRender.length === 0) {
    if (noResultsState) noResultsState.style.display = 'block';
    return;
  }

  if (noResultsState) noResultsState.style.display = 'none';

  toolsToRender.forEach(tool => {
    const card = document.createElement('a');
    card.href = tool.url;
    card.className = 'tool-card';
    card.innerHTML = `
      <div class="tool-card-header">
        <span class="tool-icon">${tool.icon}</span>
        <span class="tool-category-tag">${tool.category}</span>
      </div>
      <h3>${tool.title}</h3>
      <p>${tool.description}</p>
      <span class="tool-card-cta">Launch Tool &rarr;</span>
    `;
    toolsGrid.appendChild(card);
  });
}

function initToolRenderer() {
  renderTools(TOOLS_DATA);
}

// ==========================================
// CATEGORY FILTER SYSTEM
// ==========================================
function initCategoryFilter() {
  const categoryCards = document.querySelectorAll('.category-card');
  const activeFilterBadge = document.getElementById('activeFilterBadge');
  const resetBtn = document.getElementById('resetFilterBtn');

  const filterAction = (category, btnElement) => {
    categoryCards.forEach(c => c.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    if (category === 'all') {
      renderTools(TOOLS_DATA);
      if (activeFilterBadge) activeFilterBadge.textContent = 'Showing All Tools';
    } else {
      const filtered = TOOLS_DATA.filter(t => t.categorySlug === category);
      renderTools(filtered);
      if (activeFilterBadge && btnElement) {
        const title = btnElement.querySelector('h3').textContent;
        activeFilterBadge.textContent = `Showing: ${title}`;
      }
    }
  };

  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      filterAction(cat, card);
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const allBtn = document.querySelector('.category-card[data-category="all"]');
      filterAction('all', allBtn);
    });
  }
}

// ==========================================
// GOOGLE-STYLE LIVE SEARCH
// ==========================================
function initGoogleSearch() {
  const searchInput = document.getElementById('toolSearch');
  const clearBtn = document.getElementById('clearSearch');
  const resultsDropdown = document.getElementById('searchResults');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length > 0) {
      if (clearBtn) clearBtn.style.display = 'block';
      const matches = TOOLS_DATA.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.keywords.some(k => k.toLowerCase().includes(query))
      );
      
      renderDropdownResults(matches, resultsDropdown);
      renderTools(matches); // Filter main grid dynamically too
    } else {
      if (clearBtn) clearBtn.style.display = 'none';
      if (resultsDropdown) resultsDropdown.style.display = 'none';
      renderTools(TOOLS_DATA);
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      if (resultsDropdown) resultsDropdown.style.display = 'none';
      renderTools(TOOLS_DATA);
      searchInput.focus();
    });
  }
}

function renderDropdownResults(matches, dropdown) {
  if (!dropdown) return;
  if (matches.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  dropdown.innerHTML = matches.map(m => `
    <a href="${m.url}" class="search-dropdown-item">
      <span>${m.icon}</span>
      <div>
        <strong>${m.title}</strong>
        <p>${m.category}</p>
      </div>
    </a>
  `).join('');
  dropdown.style.display = 'block';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
