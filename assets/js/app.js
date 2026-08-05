/**
 * Tools.PrasunBarua.com - Core Application Architecture
 * Pure JavaScript, Client-Side Search Engine & Dynamic Rendering
 */

// ==========================================
// CENTRAL TOOL DATASET (Easily expand to 100+ tools)
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
    id: "solar-calculator",
    title: "Solar PV Calculator",
    icon: "☀️",
    category: "Solar PV Tools",
    categorySlug: "solar",
    description: "Estimate solar capacity, battery sizing, and daily energy output.",
    keywords: ["solar", "pv", "panel", "energy", "battery", "inverter", "renewable", "kw", "kwh", "sun"],
    url: "/tools/solar-calculator.html"
  },
  {
    id: "json-formatter",
    title: "JSON Formatter",
    icon: "📄",
    category: "Developer Tools",
    categorySlug: "developer",
    description: "Format, validate, beautify, and minify JSON data online.",
    keywords: ["json", "formatter", "developer", "validator", "beautify", "minify", "code", "programming"],
    url: "/tools/json-formatter.html"
  },
  {
    id: "unit-converter",
    title: "Unit Converter",
    icon: "🔄",
    category: "Converter Tools",
    categorySlug: "converter",
    description: "Convert engineering units, lengths, masses, temperatures, and areas.",
    keywords: ["unit", "converter", "engineering", "conversion", "measurement", "metric", "imperial"],
    url: "/tools/unit-converter.html"
  },
  {
    id: "password-generator",
    title: "Password Generator",
    icon: "🔐",
    category: "Utility Tools",
    categorySlug: "utility",
    description: "Generate cryptographically secure random passwords.",
    keywords: ["password", "generator", "security", "random", "privacy", "lock", "safety"],
    url: "/tools/password-generator.html"
  },
  {
    id: "word-counter",
    title: "Word Counter",
    icon: "📝",
    category: "Text Tools",
    categorySlug: "text",
    description: "Count words, characters, sentences, and estimated reading time.",
    keywords: ["word", "counter", "character", "text", "writing", "editor", "reading time"],
    url: "/tools/word-counter.html"
  }
];

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initThemeSystem();
  initMobileMenu();
  initToolRenderer();
  initCategoryFilter();
  initGoogleSearch();
});

// ==========================================
// 1. THEME SWITCHER (Light / Dark Mode)
// ==========================================
function initThemeSystem() {
  const themeToggleBtn = document.getElementById('themeToggle');
  if (!themeToggleBtn) return;

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// ==========================================
// 2. MOBILE NAVIGATION
// ==========================================
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (!menuBtn || !navMenu) return;

  menuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Close nav when clicking any link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('open'));
  });
}

// ==========================================
// 3. DYNAMIC TOOL GRID RENDERER
// ==========================================
let currentFilter = 'all';

function initToolRenderer() {
  renderTools(TOOLS_DATA);
}

function renderTools(toolsList) {
  const grid = document.getElementById('toolsGrid');
  const noResults = document.getElementById('noResultsState');

  if (!grid) return;

  grid.innerHTML = '';

  if (toolsList.length === 0) {
    grid.style.display = 'none';
    if (noResults) noResults.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  if (noResults) noResults.style.display = 'none';

  toolsList.forEach(tool => {
    const card = document.createElement('a');
    card.href = tool.url;
    card.className = 'tool-card';
    card.setAttribute('data-category', tool.categorySlug);

    card.innerHTML = `
      <div class="tool-card-header">
        <span class="tool-card-icon">${tool.icon}</span>
        <h3 class="tool-card-title">${tool.title}</h3>
      </div>
      <p class="tool-card-desc">${tool.description}</p>
      <div class="tool-card-footer">
        <span class="tool-card-cat">${tool.category}</span>
        <span class="tool-card-action">Open &rarr;</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ==========================================
// 4. CATEGORY FILTERING ENGINE
// ==========================================
function initCategoryFilter() {
  const categoryCards = document.querySelectorAll('.category-card[data-category]');
  const resetBtn = document.getElementById('resetFilterBtn');

  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const category = card.getAttribute('data-category');

      categoryCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      filterCategory(category);
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      filterCategory('all');
      categoryCards.forEach(c => c.classList.remove('active'));
      const allCard = document.querySelector('.category-card[data-category="all"]');
      if (allCard) allCard.classList.add('active');
    });
  }
}

function filterCategory(categorySlug) {
  currentFilter = categorySlug;
  const badge = document.getElementById('activeFilterBadge');

  if (categorySlug === 'all') {
    renderTools(TOOLS_DATA);
    if (badge) badge.textContent = 'Showing All Tools';
  } else {
    const filtered = TOOLS_DATA.filter(t => t.categorySlug === categorySlug);
    renderTools(filtered);
    if (badge && filtered.length > 0) {
      badge.textContent = `Filtered: ${filtered[0].category}`;
    }
  }
}

// ==========================================
// 5. GOOGLE-STYLE LIVE SEARCH ENGINE
// ==========================================
function initGoogleSearch() {
  const searchInput = document.getElementById('toolSearch');
  const searchResults = document.getElementById('searchResults');
  const clearBtn = document.getElementById('clearSearch');

  if (!searchInput || !searchResults) return;

  let highlightedIndex = -1;

  // Search Input Event Listener
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (query.length > 0) {
      if (clearBtn) clearBtn.style.display = 'block';
      performSearch(query);
    } else {
      if (clearBtn) clearBtn.style.display = 'none';
      hideDropdown();
    }
  });

  // Clear Search Button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      hideDropdown();
      searchInput.focus();
    });
  }

  // Keyboard Navigation (Arrow keys, Enter, Escape)
  searchInput.addEventListener('keydown', (e) => {
    const items = searchResults.querySelectorAll('.search-result-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        highlightedIndex = (highlightedIndex + 1) % items.length;
        updateHighlight(items);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
        updateHighlight(items);
      }
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && items[highlightedIndex]) {
        e.preventDefault();
        items[highlightedIndex].click();
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.google-search')) {
      hideDropdown();
    }
  });

  function performSearch(query) {
    const matches = TOOLS_DATA.filter(tool => {
      return (
        tool.title.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.keywords.some(k => k.toLowerCase().includes(query))
      );
    });

    renderDropdownResults(matches);
  }

  function renderDropdownResults(matches) {
    searchResults.innerHTML = '';
    highlightedIndex = -1;

    if (matches.length === 0) {
      searchResults.innerHTML = `<div class="search-no-match">No tools match your query</div>`;
      searchResults.style.display = 'block';
      return;
    }

    matches.forEach(tool => {
      const item = document.createElement('a');
      item.href = tool.url;
      item.className = 'search-result-item';

      item.innerHTML = `
        <span class="search-result-icon">${tool.icon}</span>
        <div class="search-result-content">
          <div class="search-result-header">
            <span class="search-result-title">${tool.title}</span>
            <span class="search-result-category">${tool.category}</span>
          </div>
          <div class="search-result-desc">${tool.description}</div>
        </div>
      `;

      searchResults.appendChild(item);
    });

    searchResults.style.display = 'block';
    searchInput.setAttribute('aria-expanded', 'true');
  }

  function updateHighlight(items) {
    items.forEach((item, index) => {
      if (index === highlightedIndex) {
        item.classList.add('highlighted');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('highlighted');
      }
    });
  }

  function hideDropdown() {
    searchResults.style.display = 'none';
    searchInput.setAttribute('aria-expanded', 'false');
    highlightedIndex = -1;
  }
}
