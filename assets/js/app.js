document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    if (themeToggleBtn) {
        const iconSpan = themeToggleBtn.querySelector('.material-symbols-outlined');

        const updateThemeUI = (theme) => {
            if (iconSpan) {
                // In light mode, display dark_mode icon (moon) indicating the action to switch to dark mode.
                // In dark mode, display light_mode icon (sun) indicating the action to switch to light mode.
                iconSpan.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
            }
            themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
        };

        const savedTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeUI(savedTheme);

        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeUI(newTheme);
        });
    }

    // --- Live Search Filter Logic with Empty State ---
    const searchInput = document.getElementById('tool-search');
    const toolCards = document.querySelectorAll('.tool-card');
    const toolsGrid = document.querySelector('.tools-grid') || (toolCards.length > 0 ? toolCards[0].parentElement : null);

    // Dynamically create a professional empty state message element if not already present
    let emptyStateEl = document.getElementById('search-empty-state');
    if (!emptyStateEl && toolsGrid) {
        emptyStateEl = document.createElement('div');
        emptyStateEl.id = 'search-empty-state';
        emptyStateEl.className = 'search-empty-state';
        emptyStateEl.style.display = 'none';
        emptyStateEl.innerHTML = `
            <span class="material-symbols-outlined" aria-hidden="true">search_off</span>
            <h3>No matching tools found</h3>
            <p>Try searching with different keywords or explore our complete catalog.</p>
        `;
        toolsGrid.insertAdjacentElement('afterend', emptyStateEl);
    }

    if (searchInput && toolCards.length > 0) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            let visibleCount = 0;

            toolCards.forEach(card => {
                const keywords = (card.getAttribute('data-name') || '').toLowerCase();
                const titleEl = card.querySelector('h3');
                const descEl = card.querySelector('p');

                const title = titleEl ? titleEl.textContent.toLowerCase() : '';
                const description = descEl ? descEl.textContent.toLowerCase() : '';

                if (keywords.includes(query) || title.includes(query) || description.includes(query)) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (emptyStateEl) {
                emptyStateEl.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    }
});
