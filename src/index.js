/**
 * NX Projects Tracker
 * 
 * Automated tracker for Nintendo Switch homebrew projects that generates
 * a JSON file with project information and firmware requirements.
 * 
 * @author ghost
 * @version 1.0.0
 */

const yaml = require('js-yaml');
const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  GITHUB_API_BASE: 'https://api.github.com',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  RATE_LIMIT_DELAY: 100, // ms between API requests
  DEFAULT_FIRMWARE: '20.2.0',
  // Rate limits: 1000/hour for GITHUB_TOKEN, 5000/hour for personal tokens
  API_RATE_LIMIT: process.env.GITHUB_TOKEN ? 5000 : 1000
};

// ============================================================================
// FIRMWARE CONFIGURATION MANAGEMENT
// ============================================================================

let firmwareMapping = {};
let defaultFirmware = CONFIG.DEFAULT_FIRMWARE;

/**
 * Load firmware requirements from configuration file
 * @returns {Promise<void>}
 */
async function loadFirmwareConfig() {
  try {
    const firmwareConfigPath = path.join(__dirname, '..', 'config', 'firmware.yml');
    const firmwareConfigContent = await fs.readFile(firmwareConfigPath, 'utf8');
    const firmwareConfig = yaml.load(firmwareConfigContent);
    
    firmwareMapping = firmwareConfig.firmware_requirements || {};
    defaultFirmware = firmwareConfig.default_firmware || CONFIG.DEFAULT_FIRMWARE;
    
    console.log(`Loaded ${Object.keys(firmwareMapping).length} firmware requirements`);
  } catch (error) {
    console.error('Error loading firmware config:', error.message);
    console.log('Using default firmware configuration');
    firmwareMapping = {};
    defaultFirmware = CONFIG.DEFAULT_FIRMWARE;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract owner and repository name from repo string
 * @param {string} repoString - Repository string in format "owner/repo"
 * @returns {{owner: string, repo: string}} Object with owner and repo
 * @throws {Error} If repo format is invalid
 */
function parseRepoString(repoString) {
  const parts = repoString.split('/');
  
  if (parts.length !== 2) {
    throw new Error(`Invalid repo format: "${repoString}". Expected format: "owner/repo"`);
  }
  
  return {
    owner: parts[0],
    repo: parts[1]
  };
}

/**
 * Get firmware requirement for a project
 * @param {string} projectName - Name of the project
 * @returns {string} Required firmware version
 */
function getFirmwareRequirement(projectName) {
  return firmwareMapping[projectName] || defaultFirmware;
}

/**
 * Create GitHub API headers with optional authentication
 * @returns {Object} Headers object for GitHub API requests
 */
function createGitHubHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'NX-Projects-Tracker/1.0.0'
  };

  if (CONFIG.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${CONFIG.GITHUB_TOKEN}`;
  }

  return headers;
}

// ============================================================================
// GITHUB API INTEGRATION
// ============================================================================

/**
 * Fetch latest release information from GitHub API
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object|null>} Latest release information or null if not found
 */
async function fetchLatestRelease(owner, repo) {
  const headers = createGitHubHeaders();
  const url = `${CONFIG.GITHUB_API_BASE}/repos/${owner}/${repo}/releases/latest`;

  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 404) {
        // No releases found, this is normal for many repositories
        return null;
      }
      
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching latest release for ${owner}/${repo}:`, error.message);
    return null;
  }
}

/**
 * Fetch repository information from GitHub API
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object|null>} Repository information or null if not found
 */
async function fetchRepositoryInfo(owner, repo) {
  const headers = createGitHubHeaders();
  const url = `${CONFIG.GITHUB_API_BASE}/repos/${owner}/${repo}`;

  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Repository not found: ${owner}/${repo}`);
        return null;
      }
      
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${owner}/${repo}:`, error.message);
    return null;
  }
}

// ============================================================================
// PROJECT PROCESSING
// ============================================================================

/**
 * Process a single project and extract relevant information
 * @param {Object} project - Project configuration object
 * @returns {Promise<Object|null>} Processed project data or null if failed
 */
async function processProject(project) {
  try {
    const { owner, repo } = parseRepoString(project.repo);
    console.log(`Processing: ${owner}/${repo}`);
    
    const repoInfo = await fetchRepositoryInfo(owner, repo);
    
    if (!repoInfo) {
      return null;
    }

    // Fetch latest release information
    const latestRelease = await fetchLatestRelease(owner, repo);
    
    const projectData = {
      name: repoInfo.name,
      author: repoInfo.owner.login,
      authorAvatar: repoInfo.owner.avatar_url,
      authorUrl: repoInfo.owner.html_url,
      projectUrl: `${owner}/${repo}`,
      projectFullUrl: repoInfo.html_url,
      description: repoInfo.description || '',
      language: repoInfo.language || '',
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      lastUpdated: repoInfo.updated_at,
      createdAt: repoInfo.created_at,
      latestVersion: latestRelease ? latestRelease.tag_name : null,
      latestReleaseUrl: latestRelease ? latestRelease.html_url : null,
      latestReleaseDate: latestRelease ? latestRelease.published_at : null,
      requiredFirmware: getFirmwareRequirement(repoInfo.name)
    };

    console.log(`Added: ${projectData.name} (${projectData.requiredFirmware}) - ${projectData.author}`);
    return projectData;
  } catch (error) {
    console.error(`Error processing project ${project.repo}:`, error.message);
    return null;
  }
}

/**
 * Process all projects from configuration
 * @param {Array} projects - Array of project configurations
 * @returns {Promise<Array>} Array of processed project data
 */
async function processAllProjects(projects) {
  const processedProjects = [];
  
  for (const project of projects) {
    const projectData = await processProject(project);
    
    if (projectData) {
      processedProjects.push(projectData);
    }
    
    // Rate limiting to be respectful to GitHub API
    await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY));
  }
  
  return processedProjects;
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Load projects configuration from YAML file
 * @returns {Promise<Object>} Configuration object
 */
async function loadProjectsConfig() {
  const configPath = path.join(__dirname, '..', 'config', 'projects.yml');
  const configContent = await fs.readFile(configPath, 'utf8');
  return yaml.load(configContent);
}

/**
 * Write projects data to JSON file
 * @param {Array} projects - Array of project data
 * @returns {Promise<string>} Path to the written file
 */
async function writeProjectsJson(projects) {
  const outputData = { projects };
  const outputPath = path.join(__dirname, '..', 'output', 'projects.json');
  
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeJson(outputPath, outputData, { spaces: 2 });
  
  return outputPath;
}

// ============================================================================
// MAIN APPLICATION LOGIC
// ============================================================================

/**
 * Display GitHub token information
 */
function displayTokenInfo() {
  if (CONFIG.GITHUB_TOKEN) {
    console.log('Using GitHub token (5000 requests/hour limit)');
  } else {
    console.log('No GitHub token found (1000 requests/hour limit)');
    console.log('Set GITHUB_TOKEN environment variable for higher limits');
  }
}

/**
 * Main function to orchestrate the entire tracking process
 * @returns {Promise<Object>} Final output data
 */
async function runTracker() {
  try {
    console.log('Starting NX Projects Tracker...\n');
    
    // Display token information
    displayTokenInfo();
    console.log('');
    
    // Load configurations
    await loadFirmwareConfig();
    const config = await loadProjectsConfig();
    
    console.log(`Found ${config.projects.length} projects to process\n`);
    
    // Process all projects
    const processedProjects = await processAllProjects(config.projects);
    
    // Generate output
    const outputPath = await writeProjectsJson(processedProjects);
    
    console.log(`\nSuccessfully processed ${processedProjects.length} projects`);
    console.log(`Output written to: ${outputPath}`);
    
    return { projects: processedProjects };
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// ENTRY POINT
// ============================================================================

// Run the tracker if this file is executed directly
if (require.main === module) {
  runTracker();
}

// Export functions for testing or external use
module.exports = {
  runTracker,
  processProject,
  fetchRepositoryInfo,
  fetchLatestRelease,
  parseRepoString,
  getFirmwareRequirement,
  loadFirmwareConfig,
  loadProjectsConfig
}; 