# NX Projects Tracker

Automated tracker for Nintendo Switch homebrew projects that generates a JSON file with project information and firmware requirements.

## Features

- 🔄 **Automated Updates**: Runs every 6 hours via GitHub Actions
- 📊 **GitHub Integration**: Fetches project data from GitHub repositories
- ⚙️ **Configurable**: Easy project and firmware management
- 📁 **Structured Output**: Generates standardized JSON format
- 🌐 **Modern Web Interface**: Beautiful, responsive React webapp
- 📱 **Mobile Friendly**: Works perfectly on all devices

## Quick Start

```bash
# Install dependencies
npm install

# Run tracker
npm start

# Add new project
npm run add "owner/repo" "firmware_version"
```

## Configuration

### Projects List (`config/projects.yml`)
```yaml
projects:
  - repo: "THZoria/NX_Firmware"
  - repo: "Atmosphere-NX/Atmosphere"
```

### Firmware Requirements (`config/firmware.yml`)
```yaml
firmware_requirements:
  NX_Firmware: "20.2.0"
  Atmosphere: "20.2.0"
default_firmware: "20.2.0"
```

## Output Format

```json
{
  "projects": [
    {
      "name": "NX_Firmware",
      "author": "THZoria",
      "authorAvatar": "https://avatars.githubusercontent.com/u/12345678?v=4",
      "authorUrl": "https://github.com/THZoria",
      "projectUrl": "THZoria/NX_Firmware",
      "projectFullUrl": "https://github.com/THZoria/NX_Firmware",
      "description": "Nintendo Switch firmware files and tools",
      "language": "C",
      "stars": 1500,
      "forks": 250,
      "lastUpdated": "2024-01-15T10:30:00Z",
      "createdAt": "2020-03-15T08:00:00Z",
      "latestVersion": "v20.2.0",
      "latestReleaseUrl": "https://github.com/THZoria/NX_Firmware/releases/tag/v20.2.0",
      "latestReleaseDate": "2024-01-10T15:45:00Z",
      "requiredFirmware": "20.2.0"
    }
  ]
}
```

### Data Fields

| Field | Description |
|-------|-------------|
| `name` | Repository name |
| `author` | GitHub username of the author |
| `authorAvatar` | URL to author's avatar image |
| `authorUrl` | URL to author's GitHub profile |
| `projectUrl` | Repository path (owner/repo) |
| `projectFullUrl` | Full GitHub repository URL |
| `description` | Repository description |
| `language` | Primary programming language |
| `stars` | Number of stars |
| `forks` | Number of forks |
| `lastUpdated` | Last repository update timestamp |
| `createdAt` | Repository creation timestamp |
| `latestVersion` | Latest release version tag |
| `latestReleaseUrl` | URL to latest release |
| `latestReleaseDate` | Latest release publication date |
| `requiredFirmware` | Minimum required Switch firmware |

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run the tracker and generate JSON |
| `npm run add "owner/repo" "firmware"` | Add new project to configuration |

## Web Interface

A modern, professional web interface is included in the `webapp/` directory, built with vanilla HTML/CSS/JavaScript for optimal performance:

```bash
cd webapp
# Open directly in browser
open index.html

# Or use a local server
python3 -m http.server 8000
```

The webapp provides:
- **Modern UI/UX** with professional design and smooth animations
- **Dark mode support** with automatic theme detection
- **Real-time search** through projects with instant results
- **Advanced filtering** by language and multiple sorting options
- **Rich project cards** with detailed information and hover effects
- **Responsive design** optimized for all devices (desktop, tablet, mobile)
- **Keyboard navigation** with full accessibility support
- **Performance optimized** with lazy loading and efficient rendering
- **Automatic deployment** to GitHub Pages

🌐 **Live Demo**: [View the webapp](https://nxhub.pw)

## Automation

The project includes a GitHub Actions workflow that:
- Runs every 6 hours automatically
- Updates `output/projects.json`
- Commits changes to the repository

## Environment Variables

- `GITHUB_TOKEN` (optional): GitHub personal access token for higher API rate limits
  - **GitHub Actions**: Uses `${{ secrets.GITHUB_TOKEN }}` automatically (limited to 1000 requests/hour)
  - **Local development**: Set your own token for higher limits (5000 requests/hour)

📖 **Detailed documentation**: See [docs/GITHUB_TOKEN.md](docs/GITHUB_TOKEN.md) for complete setup instructions.

## License

MIT License
