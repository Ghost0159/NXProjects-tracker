# NX Projects Tracker - Web Interface

A modern and professional web interface for visualizing Nintendo Switch homebrew projects, built with HTML5, CSS3 and vanilla JavaScript.

## 🌟 Features

- **Modern interface** : Clean and professional design with smooth animations
- **Dark mode** : Automatic dark theme support based on system preferences
- **Responsive** : Optimized for all devices (desktop, tablet, mobile)
- **Advanced search** : Real-time search by name, author or description
- **Smart filtering** : Filter by programming language
- **Multiple sorting** : Sort by stars, forks, name, author, dates
- **Statistics** : Overview of projects with key metrics
- **Detailed modals** : Complete information on each project
- **Keyboard navigation** : Full keyboard navigation support
- **Performance** : Fast and optimized loading

## 🚀 Quick Start

### Local Development

1. **Open the HTML file** :
   ```bash
   # In the webapp folder
   open index.html
   ```

2. **Or use a local server** :
   ```bash
   # With Python
   python -m http.server 8000
   
   # With Node.js (if http-server is installed)
   npx http-server
   
   # With PHP
   php -S localhost:8000
   ```

3. **Access the application** :
   ```
   http://localhost:8000
   ```

### Production

The interface is designed to be deployed on GitHub Pages or any other static hosting service.

## 📁 Project Structure

```
webapp/
├── index.html              # Main page
├── styles/
│   ├── main.css           # Main styles
│   ├── components.css     # Component styles
│   └── responsive.css     # Responsive styles
├── js/
│   ├── app.js            # Main application
│   ├── components.js     # Additional components
│   └── utils.js          # Utilities
├── data/
│   └── projects.json     # Test data
└── assets/
    └── favicon.svg       # Site icon
```

## 🎨 Design System

### Colors
- **Primary** : `#6366f1` (Indigo)
- **Secondary** : `#8b5cf6` (Violet)
- **Accent** : `#06b6d4` (Cyan)
- **Success** : `#10b981` (Green)
- **Warning** : `#f59e0b` (Orange)
- **Error** : `#ef4444` (Red)

### Typography
- **Font** : Inter (Google Fonts)
- **Sizes** : Consistent scale system (xs to 4xl)
- **Weights** : 300, 400, 500, 600, 700

### Spacing
- **System** : Based on `rem` with consistent scale
- **Grid** : CSS Grid and Flexbox for layout

## 🔧 Configuration

### Data

The application loads data from several sources in this order:

1. `/output/projects.json` (real tracker data)
2. `/data/projects.json` (local test data)

**Note** : No data is embedded in the JavaScript code. The application displays an appropriate error message if no data file is available.

### Customization

#### Colors
Modify CSS variables in `styles/main.css` :

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* ... other colors */
}
```

#### Dark theme
The dark theme is automatically activated based on system preferences. You can force a theme by modifying `data-theme` on the `html` element.

## 📱 Responsive Design

The interface automatically adapts to all screens:

- **Desktop** : ≥1200px - Complete layout
- **Tablet** : 768px-1199px - Adapted grid
- **Mobile** : <768px - Optimized vertical layout

## ♿ Accessibility

- **Keyboard navigation** : Arrows to navigate, Enter to select
- **Shortcuts** : `/` to focus search, `Escape` to close modals
- **Contrast** : WCAG standards compliance
- **Motion reduction** : User preference support
- **Screen readers** : Semantic structure and ARIA labels

## 🔍 Advanced Features

### Search
- Real-time search
- Search in name, author and description
- Quick clear button

### Filtering
- Filter by programming language
- Automatic options update

### Sorting
- By popularity (stars, forks)
- By name (A-Z)
- By author (A-Z)
- By dates (creation, update)

### Statistics
- Total number of projects
- Total stars
- Total forks
- Number of languages

## 🚀 Performance

- **Fast loading** : Optimized CSS and JS
- **Lazy loading images** : Deferred avatar loading
- **Debouncing** : Optimized search
- **Intersection Observer** : On-demand loading

## 🛠️ Development

### Adding new features

1. **Styles** : Add in `styles/components.css`
2. **JavaScript** : Extend the `NXProjectsTracker` class
3. **Utilities** : Use functions in `js/utils.js`

### Testing

Open the browser console to see performance and analytics logs.

## 📄 License

MIT License - See the main project LICENSE file.

---

**Developed with ❤️ for the Nintendo Switch community** 