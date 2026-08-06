document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const iconSpan = themeToggleBtn.querySelector('.material-symbols-outlined');

    // Check user preference from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'light') {
            iconSpan.textContent = 'light_mode';
        } else {
            iconSpan.textContent = 'dark_mode';
        }
    }

    // --- Live Search Filter Logic ---
    const searchInput = document.getElementById('tool-search');
    const toolCards = document.querySelectorAll('.tool-card');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        toolCards.forEach(card => {
            const keywords = card.getAttribute('data-name') || '';
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();

            if (keywords.includes(query) || title.includes(query) || description.includes(query)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
