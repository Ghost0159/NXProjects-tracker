/**
 * NX Projects Tracker - Main Application
 * Modern vanilla JavaScript application for tracking Nintendo Switch homebrew projects
 */

class NXProjectsTracker {
    constructor() {
        this.projects = [];
        this.filteredProjects = [];
        this.currentFilters = {
            search: '',
            language: 'all',
            sortBy: 'stars'
        };
        
        this.init();
    }

    async init() {
        try {
            // Initialize Lucide icons
            lucide.createIcons();
            
            // Load projects data
            await this.loadProjects();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.updateStats();
            this.updateLanguageFilter();
            this.filterProjects(); // Initialize filtered projects
            this.renderProjects();
            
            // Reinitialize icons after rendering
            lucide.createIcons();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load projects. Please try again.');
        }
    }

    async loadProjects() {
        try {
            // Load from data file
            const response = await fetch('./data/projects.json');
            if (response.ok) {
                const data = await response.json();
                this.projects = data.projects || [];
                return;
            }
        } catch (error) {
            console.warn('Could not load from ./data/projects.json');
        }

        // No fallback data - show empty state
        this.projects = [];
        console.warn('No project data available. Please ensure ./data/projects.json exists.');
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const clearSearchBtn = document.getElementById('clear-search');
        
        searchInput.addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.updateClearSearchButton();
            this.filterAndRender();
        });

        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            this.currentFilters.search = '';
            this.updateClearSearchButton();
            this.filterAndRender();
        });

        // Language filter
        const languageFilter = document.getElementById('language-filter');
        languageFilter.addEventListener('change', (e) => {
            this.currentFilters.language = e.target.value;
            this.filterAndRender();
        });

        // Sort functionality
        const sortSelect = document.getElementById('sort-select');
        sortSelect.addEventListener('change', (e) => {
            this.currentFilters.sortBy = e.target.value;
            this.filterAndRender();
        });

        // Retry button
        const retryBtn = document.getElementById('retry-button');
        retryBtn.addEventListener('click', () => {
            this.retry();
        });

        // Modal functionality
        const modal = document.getElementById('project-modal');
        const modalClose = document.getElementById('modal-close');
        const modalOverlay = document.querySelector('.modal-overlay');
        const modalContent = document.querySelector('.modal-content');

        // Only add close button functionality on desktop
        if (modalClose && window.innerWidth > 767) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        modalOverlay.addEventListener('click', () => this.closeModal());
        
        // Mobile swipe to close functionality
        this.setupMobileSwipe(modal, modalContent);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
            if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                searchInput.focus();
            }
        });

        // Update last updated time
        this.updateLastUpdated();
    }

    updateClearSearchButton() {
        const clearSearchBtn = document.getElementById('clear-search');
        if (this.currentFilters.search) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    }

    filterAndRender() {
        this.filterProjects();
        this.renderProjects();
    }

    filterProjects() {
        let filtered = [...this.projects];

        // Search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(project =>
                project.name.toLowerCase().includes(searchTerm) ||
                project.author.toLowerCase().includes(searchTerm) ||
                (project.description && project.description.toLowerCase().includes(searchTerm))
            );
        }

        // Language filter
        if (this.currentFilters.language !== 'all') {
            filtered = filtered.filter(project => project.language === this.currentFilters.language);
        }

        // Sort projects
        filtered.sort((a, b) => {
            switch (this.currentFilters.sortBy) {
                case 'stars':
                    return b.stars - a.stars;
                case 'forks':
                    return b.forks - a.forks;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'author':
                    return a.author.localeCompare(b.author);
                case 'latest':
                    return new Date(b.lastUpdated) - new Date(a.lastUpdated);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return b.stars - a.stars;
            }
        });

        this.filteredProjects = filtered;
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        const noResults = document.getElementById('no-results');

        if (this.projects.length === 0) {
            // No data available at all
            projectsGrid.innerHTML = '';
            noResults.style.display = 'block';
            noResults.innerHTML = `
                <div class="no-results-content">
                    <i data-lucide="database-off"></i>
                    <h3>No project data available</h3>
                    <p>Please ensure the tracker has generated data or check your configuration.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i data-lucide="refresh-cw"></i>
                        Refresh Page
                    </button>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        if (this.filteredProjects.length === 0) {
            // No results from search/filter
            projectsGrid.innerHTML = '';
            noResults.style.display = 'block';
            noResults.innerHTML = `
                <div class="no-results-content">
                    <i data-lucide="search-x"></i>
                    <h3>No projects found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        noResults.style.display = 'none';
        projectsGrid.innerHTML = this.filteredProjects.map(project => this.createProjectCard(project)).join('');

        // Add click listeners to project cards
        const projectCards = projectsGrid.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                this.openProjectModal(this.filteredProjects[index]);
            });
        });

        // Reinitialize icons in project cards
        lucide.createIcons();
    }

    createProjectCard(project) {
        const languageColor = this.getLanguageColor(project.language);
        const formattedStars = this.formatNumber(project.stars);
        const formattedForks = this.formatNumber(project.forks);
        const lastUpdated = this.formatDate(project.lastUpdated);

        return `
            <div class="project-card">
                <div class="project-header">
                    <img src="${project.authorAvatar}" alt="${project.author}" class="project-avatar" loading="lazy">
                    <div class="project-info">
                        <h3 class="project-name">${this.escapeHtml(project.name)}</h3>
                        <p class="project-author">
                            by <a href="${project.authorUrl}" target="_blank" rel="noopener">${this.escapeHtml(project.author)}</a>
                        </p>
                    </div>
                </div>
                
                ${project.description ? `<p class="project-description">${this.escapeHtml(project.description)}</p>` : ''}
                
                <div class="project-stats">
                    <div class="stat-item">
                        <i data-lucide="star"></i>
                        <span>${formattedStars}</span>
                    </div>
                    <div class="stat-item">
                        <i data-lucide="git-fork"></i>
                        <span>${formattedForks}</span>
                    </div>
                    <div class="stat-item">
                        <i data-lucide="tag"></i>
                        <span>Latest Version: ${project.latestVersion || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="project-meta">
                    ${project.language ? `
                        <div class="project-language">
                            <span class="language-dot" style="background-color: ${languageColor}"></span>
                            ${this.escapeHtml(project.language)}
                        </div>
                    ` : ''}
                    <div class="project-firmware">
                        FW ${project.requiredFirmware}
                    </div>
                </div>
                
                <div class="project-actions">
                    <a href="${project.projectFullUrl}" target="_blank" rel="noopener" class="btn btn-primary">
                        <i data-lucide="external-link"></i>
                        View Project
                    </a>
                    ${project.latestReleaseUrl ? `
                        <a href="${project.latestReleaseUrl}" target="_blank" rel="noopener" class="btn btn-secondary">
                            <i data-lucide="download"></i>
                            Latest Release
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    }

    openProjectModal(project) {
        const modal = document.getElementById('project-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.textContent = project.name;
        modalBody.innerHTML = this.createModalContent(project);

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Reinitialize icons in modal
        lucide.createIcons();
    }

    createModalContent(project) {
        const languageColor = this.getLanguageColor(project.language);
        const formattedStars = this.formatNumber(project.stars);
        const formattedForks = this.formatNumber(project.forks);
        const lastUpdated = this.formatDate(project.lastUpdated);
        const createdAt = this.formatDate(project.createdAt);
        const latestReleaseDate = project.latestReleaseDate ? this.formatDate(project.latestReleaseDate) : 'N/A';

        return `
            <div class="modal-project-header">
                <img src="${project.authorAvatar}" alt="${project.author}" class="modal-project-avatar" loading="lazy">
                <div class="modal-project-info">
                    <h2>${this.escapeHtml(project.name)}</h2>
                    <p class="modal-project-author">
                        by <a href="${project.authorUrl}" target="_blank" rel="noopener">${this.escapeHtml(project.author)}</a>
                    </p>
                    ${project.description ? `<p class="modal-project-description">${this.escapeHtml(project.description)}</p>` : ''}
                </div>
            </div>

            <div class="modal-project-stats">
                <div class="modal-stat">
                    <div class="modal-stat-value">${formattedStars}</div>
                    <div class="modal-stat-label">Stars</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-value">${formattedForks}</div>
                    <div class="modal-stat-label">Forks</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-value">${project.language || 'N/A'}</div>
                    <div class="modal-stat-label">Language</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-value">${project.requiredFirmware}</div>
                    <div class="modal-stat-label">Firmware</div>
                </div>
            </div>

            <div class="modal-project-details">
                <div class="detail-group">
                    <div class="detail-label">Repository</div>
                    <div class="detail-value">${this.escapeHtml(project.projectUrl)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Latest Version</div>
                    <div class="detail-value">${project.latestVersion || 'N/A'}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Last Updated</div>
                    <div class="detail-value">${lastUpdated}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Created</div>
                    <div class="detail-value">${createdAt}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Latest Release</div>
                    <div class="detail-value">${latestReleaseDate}</div>
                </div>
                ${project.language ? `
                    <div class="detail-group">
                        <div class="detail-label">Language</div>
                        <div class="detail-value">
                            <span style="color: ${languageColor}">●</span> ${this.escapeHtml(project.language)}
                        </div>
                    </div>
                ` : ''}
            </div>

            <div class="modal-project-actions">
                <a href="${project.projectFullUrl}" target="_blank" rel="noopener" class="btn btn-primary">
                    <i data-lucide="external-link"></i>
                    View on GitHub
                </a>
                ${project.latestReleaseUrl ? `
                    <a href="${project.latestReleaseUrl}" target="_blank" rel="noopener" class="btn btn-secondary">
                        <i data-lucide="download"></i>
                        Latest Release
                    </a>
                ` : ''}
                <a href="${project.authorUrl}" target="_blank" rel="noopener" class="btn btn-secondary">
                    <i data-lucide="user"></i>
                    View Author
                </a>
            </div>
        `;
    }

    closeModal() {
        const modal = document.getElementById('project-modal');
        
        // Add hiding class for animation
        modal.classList.add('hiding');
        
        // Wait for animation to complete
        setTimeout(() => {
            modal.classList.remove('show', 'hiding');
            document.body.style.overflow = '';
        }, 300);
    }

    updateStats() {
        const totalProjects = this.projects.length;
        const totalStars = this.projects.reduce((sum, project) => sum + project.stars, 0);
        const totalForks = this.projects.reduce((sum, project) => sum + project.forks, 0);
        const languages = [...new Set(this.projects.map(project => project.language).filter(Boolean))];

        document.getElementById('total-projects').textContent = this.formatNumber(totalProjects);
        document.getElementById('total-stars').textContent = this.formatNumber(totalStars);
        document.getElementById('total-forks').textContent = this.formatNumber(totalForks);
        document.getElementById('total-languages').textContent = languages.length;
    }

    updateLanguageFilter() {
        const languageFilter = document.getElementById('language-filter');
        const languages = [...new Set(this.projects.map(project => project.language).filter(Boolean))].sort();

        // Clear existing options except "All Languages"
        languageFilter.innerHTML = '<option value="all">All Languages</option>';

        // Add language options
        languages.forEach(language => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language;
            languageFilter.appendChild(option);
        });
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }

    showError(message) {
        const errorState = document.getElementById('error-state');
        const errorMessage = document.getElementById('error-message');
        const loadingScreen = document.getElementById('loading-screen');
        const main = document.querySelector('.main');

        errorMessage.textContent = message;
        loadingScreen.style.display = 'none';
        main.style.display = 'none';
        errorState.style.display = 'block';
    }

    async retry() {
        const errorState = document.getElementById('error-state');
        const main = document.querySelector('.main');
        const loadingScreen = document.getElementById('loading-screen');

        errorState.style.display = 'none';
        loadingScreen.style.display = 'flex';
        main.style.display = 'block';

        try {
            await this.loadProjects();
            this.updateStats();
            this.updateLanguageFilter();
            this.filterAndRender();
            this.hideLoadingScreen();
        } catch (error) {
            this.showError('Failed to load projects. Please try again.');
        }
    }

    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('last-updated');
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        lastUpdatedElement.textContent = `Last updated: ${formattedDate}`;
    }

    // Utility functions
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else if (diffDays <= 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    getLanguageColor(language) {
        const colors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#2b7489',
            'Python': '#3572A5',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'C': '#555555',
            'C#': '#178600',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'Swift': '#ffac45',
            'Kotlin': '#F18E33',
            'Scala': '#c22d40',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Shell': '#89e051',
            'Makefile': '#427819',
            'Objective-C': '#438eff'
        };
        return colors[language] || '#6c757d';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupMobileSwipe(modal, modalContent) {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        let startTime = 0;

        const handleTouchStart = (e) => {
            startY = e.touches[0].clientY;
            startTime = Date.now();
            isDragging = true;
            modalContent.style.transition = 'none';
        };

        const handleTouchMove = (e) => {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            // Only allow downward swipe
            if (deltaY > 0) {
                const translateY = Math.min(deltaY, 100);
                modalContent.style.transform = `translateY(${translateY}px)`;
                
                // Add opacity effect
                const opacity = Math.max(0.7, 1 - (deltaY / 200));
                modalContent.style.opacity = opacity;
            }
        };

        const handleTouchEnd = (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            const deltaY = currentY - startY;
            const duration = Date.now() - startTime;
            const velocity = deltaY / duration;
            
            modalContent.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
            
            // Close modal if swiped down enough or with enough velocity
            if (deltaY > 100 || velocity > 0.5) {
                this.closeModal();
            } else {
                // Reset position
                modalContent.style.transform = 'translateY(0)';
                modalContent.style.opacity = '1';
            }
        };

        // Add touch event listeners
        modalContent.addEventListener('touchstart', handleTouchStart, { passive: true });
        modalContent.addEventListener('touchmove', handleTouchMove, { passive: true });
        modalContent.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NXProjectsTracker();
}); 