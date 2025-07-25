/**
 * NX Projects Tracker - Components
 * Additional JavaScript components and utilities
 */

// Debounce utility for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Intersection Observer for lazy loading
function createIntersectionObserver(callback, options = {}) {
    return new IntersectionObserver(callback, {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options
    });
}

// Local storage utilities
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    }
};

// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = this.getPreferredTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
    }

    getPreferredTheme() {
        const saved = Storage.get('theme');
        if (saved) return saved;
        
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        Storage.set('theme', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    setupThemeToggle() {
        // Add theme toggle button to header if needed
        const nav = document.querySelector('.nav');
        if (nav) {
            const themeToggle = document.createElement('button');
            themeToggle.className = 'nav-link theme-toggle';
            themeToggle.innerHTML = `
                <i data-lucide="${this.currentTheme === 'light' ? 'moon' : 'sun'}"></i>
                ${this.currentTheme === 'light' ? 'Dark' : 'Light'}
            `;
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
                themeToggle.innerHTML = `
                    <i data-lucide="${this.currentTheme === 'light' ? 'moon' : 'sun'}"></i>
                    ${this.currentTheme === 'light' ? 'Dark' : 'Light'}
                `;
                lucide.createIcons();
            });
            nav.appendChild(themeToggle);
        }
    }
}

// Keyboard navigation
class KeyboardNavigation {
    constructor() {
        this.currentIndex = -1;
        this.projectCards = [];
        this.init();
    }

    init() {
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    updateProjectCards() {
        this.projectCards = Array.from(document.querySelectorAll('.project-card'));
        this.currentIndex = -1;
    }

    handleKeydown(event) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            this.navigateProjects(event.key === 'ArrowDown' ? 1 : -1);
        } else if (event.key === 'Enter' && this.currentIndex >= 0) {
            event.preventDefault();
            this.projectCards[this.currentIndex].click();
        } else if (event.key === 'Escape') {
            this.clearSelection();
        }
    }

    navigateProjects(direction) {
        if (this.projectCards.length === 0) return;

        // Clear previous selection
        this.clearSelection();

        // Calculate new index
        if (this.currentIndex === -1) {
            this.currentIndex = direction > 0 ? 0 : this.projectCards.length - 1;
        } else {
            this.currentIndex += direction;
            if (this.currentIndex >= this.projectCards.length) {
                this.currentIndex = 0;
            } else if (this.currentIndex < 0) {
                this.currentIndex = this.projectCards.length - 1;
            }
        }

        // Apply selection
        const selectedCard = this.projectCards[this.currentIndex];
        selectedCard.style.outline = '2px solid var(--primary-color)';
        selectedCard.style.outlineOffset = '2px';
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    clearSelection() {
        this.projectCards.forEach(card => {
            card.style.outline = '';
            card.style.outlineOffset = '';
        });
        this.currentIndex = -1;
    }
}

// Analytics (basic)
class Analytics {
    constructor() {
        this.init();
    }

    init() {
        // Track page views
        this.trackPageView();
        
        // Track interactions
        this.trackInteractions();
    }

    trackPageView() {
        // Simple page view tracking
        console.log('Page view tracked:', window.location.pathname);
    }

    trackInteractions() {
        // Track project card clicks
        document.addEventListener('click', (event) => {
            if (event.target.closest('.project-card')) {
                const projectName = event.target.closest('.project-card').querySelector('.project-name')?.textContent;
                if (projectName) {
                    console.log('Project clicked:', projectName);
                }
            }
        });

        // Track search usage
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((event) => {
                if (event.target.value) {
                    console.log('Search performed:', event.target.value);
                }
            }, 1000));
        }
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log('Page load time:', Math.round(loadTime), 'ms');
        });

        // Monitor image loading
        this.monitorImageLoading();
    }

    monitorImageLoading() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                console.log('Image loaded:', img.src);
            });
            img.addEventListener('error', () => {
                console.warn('Image failed to load:', img.src);
            });
        });
    }
}

// Export components for use in main app
window.NXComponents = {
    debounce,
    createIntersectionObserver,
    Storage,
    ThemeManager,
    KeyboardNavigation,
    Analytics,
    PerformanceMonitor
}; 