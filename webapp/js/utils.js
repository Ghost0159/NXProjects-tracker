/**
 * NX Projects Tracker - Utilities
 * Common utility functions used throughout the application
 */

// Date formatting utilities
const DateUtils = {
    /**
     * Format a date string to a human-readable format
     * @param {string} dateString - ISO date string
     * @param {string} format - Format type ('relative', 'short', 'long')
     * @returns {string} Formatted date string
     */
    format(dateString, format = 'relative') {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        const now = new Date();
        
        switch (format) {
            case 'relative':
                return this.getRelativeTime(date, now);
            case 'short':
                return this.getShortDate(date);
            case 'long':
                return this.getLongDate(date);
            default:
                return this.getRelativeTime(date, now);
        }
    },

    /**
     * Get relative time (e.g., "2 days ago")
     * @param {Date} date - Date to format
     * @param {Date} now - Current date
     * @returns {string} Relative time string
     */
    getRelativeTime(date, now) {
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));

        if (diffMinutes < 60) {
            return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays === 2) {
            return '2 days ago';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else if (diffDays <= 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else if (diffDays <= 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
    },

    /**
     * Get short date format
     * @param {Date} date - Date to format
     * @returns {string} Short date string
     */
    getShortDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    /**
     * Get long date format
     * @param {Date} date - Date to format
     * @returns {string} Long date string
     */
    getLongDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

// Number formatting utilities
const NumberUtils = {
    /**
     * Format a number with appropriate suffix (K, M, B)
     * @param {number} num - Number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number string
     */
    format(num, decimals = 1) {
        if (num === null || num === undefined) return '0';
        
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(decimals) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(decimals) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(decimals) + 'K';
        }
        return num.toString();
    },

    /**
     * Format a number with commas
     * @param {number} num - Number to format
     * @returns {string} Number with commas
     */
    formatWithCommas(num) {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString('en-US');
    },

    /**
     * Format a percentage
     * @param {number} num - Number to format as percentage
     * @param {number} decimals - Number of decimal places
     * @returns {string} Percentage string
     */
    formatPercentage(num, decimals = 1) {
        if (num === null || num === undefined) return '0%';
        return `${(num * 100).toFixed(decimals)}%`;
    }
};

// String utilities
const StringUtils = {
    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML string
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add (default: '...')
     * @returns {string} Truncated text
     */
    truncate(text, maxLength, suffix = '...') {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    },

    /**
     * Convert text to title case
     * @param {string} text - Text to convert
     * @returns {string} Title case text
     */
    toTitleCase(text) {
        if (!text) return '';
        return text.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },

    /**
     * Generate a slug from text
     * @param {string} text - Text to slugify
     * @returns {string} Slug string
     */
    slugify(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
};

// DOM utilities
const DOMUtils = {
    /**
     * Create an element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string|Element} content - Element content
     * @returns {Element} Created element
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Set content
        if (content) {
            if (typeof content === 'string') {
                element.textContent = content;
            } else if (content instanceof Element) {
                element.appendChild(content);
            }
        }
        
        return element;
    },

    /**
     * Add event listener with error handling
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    addEventListener(element, event, handler, options = {}) {
        try {
            element.addEventListener(event, handler, options);
        } catch (error) {
            console.warn(`Failed to add ${event} listener:`, error);
        }
    },

    /**
     * Remove event listener with error handling
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    removeEventListener(element, event, handler, options = {}) {
        try {
            element.removeEventListener(event, handler, options);
        } catch (error) {
            console.warn(`Failed to remove ${event} listener:`, error);
        }
    },

    /**
     * Check if element is in viewport
     * @param {Element} element - Element to check
     * @returns {boolean} True if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Scroll element into view smoothly
     * @param {Element} element - Element to scroll to
     * @param {Object} options - Scroll options
     */
    scrollIntoView(element, options = {}) {
        const defaultOptions = {
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
        };
        
        element.scrollIntoView({ ...defaultOptions, ...options });
    }
};

// Color utilities
const ColorUtils = {
    /**
     * Get language color from GitHub's color palette
     * @param {string} language - Programming language
     * @returns {string} Hex color code
     */
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
            'Objective-C': '#438eff',
            'Assembly': '#6E4C13',
            'Dockerfile': '#384d54',
            'Vue': '#41b883',
            'React': '#61dafb',
            'Angular': '#dd0031',
            'Node.js': '#339933',
            'R': '#198ce7',
            'MATLAB': '#e16737',
            'Perl': '#0298c3',
            'Lua': '#000080',
            'Haskell': '#5e5086',
            'Clojure': '#db5855',
            'Elixir': '#6e4a7e',
            'Erlang': '#b83998',
            'F#': '#b845fc',
            'OCaml': '#3be133',
            'Racket': '#3c5caa',
            'Scheme': '#1e4aec',
            'Common Lisp': '#3fb68b',
            'D': '#ba595e',
            'Nim': '#37775b',
            'Zig': '#ec915c',
            'V': '#4f87c4',
            'Crystal': '#000100',
            'Julia': '#a270ba',
            'Fortran': '#4d41b1',
            'COBOL': '#ff6d6d',
            'Pascal': '#e3f171',
            'Ada': '#02f88c',
            'Lisp': '#3fb68b',
            'Prolog': '#74283c',
            'Smalltalk': '#596706',
            'Logo': '#6b8e23',
            'BASIC': '#ff6600',
            'ALGOL': '#cc0000',
            'APL': '#5a8164',
            'J': '#9eef40',
            'K': '#28430a',
            'Q': '#4b32c3',
            'M': '#ff6db6',
            'B': '#ff6db6',
            'BCPL': '#ff6db6',
            'Befunge': '#ff6db6',
            'Brainfuck': '#ff6db6',
            'Whitespace': '#ff6db6',
            'Malbolge': '#ff6db6',
            'INTERCAL': '#ff6db6',
            'LOLCODE': '#ff6db6',
            'ArnoldC': '#ff6db6',
            'Shakespeare': '#ff6db6',
            'Rockstar': '#ff6db6',
            'Velato': '#ff6db6',
            'Ook!': '#ff6db6',
            'Chef': '#ff6db6',
            'Piet': '#ff6db6',
            'FALSE': '#ff6db6',
            'HQ9+': '#ff6db6',
            'BlooP': '#ff6db6',
            'FlooP': '#ff6db6',
            'GlooP': '#ff6db6',
            'SNOBOL': '#ff6db6',
            'SPITBOL': '#ff6db6',
            'Icon': '#ff6db6',
            'Unicon': '#ff6db6',
            'Object Rexx': '#ff6db6',
            'NetRexx': '#ff6db6',
            'ooRexx': '#ff6db6',
            'Rexx': '#ff6db6',
            'PL/I': '#ff6db6',
            'PL/M': '#ff6db6',
            'PL/C': '#ff6db6',
            'PL/S': '#ff6db6',
            'PL/1': '#ff6db6',
            'PL/360': '#ff6db6',
            'PL/8': '#ff6db6',
            'PL/9': '#ff6db6',
            'PL/10': '#ff6db6',
            'PL/11': '#ff6db6',
            'PL/12': '#ff6db6',
            'PL/13': '#ff6db6',
            'PL/14': '#ff6db6',
            'PL/15': '#ff6db6',
            'PL/16': '#ff6db6',
            'PL/17': '#ff6db6',
            'PL/18': '#ff6db6',
            'PL/19': '#ff6db6',
            'PL/20': '#ff6db6'
        };
        
        return colors[language] || '#6c757d';
    },

    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color code
     * @returns {Object} RGB values
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * Convert RGB to hex
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {string} Hex color code
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
};

// Export utilities
window.NXUtils = {
    DateUtils,
    NumberUtils,
    StringUtils,
    DOMUtils,
    ColorUtils
}; 