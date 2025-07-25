/**
 * Add Project Script
 * 
 * Utility script to add new projects to the NX Projects Tracker configuration.
 * Updates both projects.yml and firmware.yml files automatically.
 * 
 * @author ghost
 * @version 1.0.0
 */

const yaml = require('js-yaml');
const fs = require('fs-extra');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  PROJECTS_FILE: path.join(__dirname, '..', 'config', 'projects.yml'),
  FIRMWARE_FILE: path.join(__dirname, '..', 'config', 'firmware.yml'),
  DEFAULT_FIRMWARE: '20.2.0'
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate repository format
 * @param {string} repo - Repository string to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidRepoFormat(repo) {
  return repo.includes('/') && repo.split('/').length === 2;
}

/**
 * Validate firmware version format
 * @param {string} firmware - Firmware version to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidFirmwareFormat(firmware) {
  // Basic validation: should be in format X.Y.Z
  const firmwareRegex = /^\d+\.\d+\.\d+$/;
  return firmwareRegex.test(firmware);
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Load YAML configuration file
 * @param {string} filePath - Path to the YAML file
 * @returns {Promise<Object>} Parsed YAML content
 */
async function loadYamlFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    throw new Error(`Failed to load ${filePath}: ${error.message}`);
  }
}

/**
 * Save YAML configuration file
 * @param {string} filePath - Path to the YAML file
 * @param {Object} data - Data to save
 * @returns {Promise<void>}
 */
async function saveYamlFile(filePath, data) {
  try {
    await fs.writeFile(filePath, yaml.dump(data, { lineWidth: 120 }));
  } catch (error) {
    throw new Error(`Failed to save ${filePath}: ${error.message}`);
  }
}

// ============================================================================
// PROJECT MANAGEMENT
// ============================================================================

/**
 * Add project to projects.yml configuration
 * @param {string} repo - Repository string (owner/repo)
 * @returns {Promise<boolean>} True if added, false if already exists
 */
async function addToProjectsConfig(repo) {
  const config = await loadYamlFile(CONFIG.PROJECTS_FILE);
  
  // Check if project already exists
  const existingProject = config.projects.find(p => p.repo === repo);
  if (existingProject) {
    console.log(`Project ${repo} already exists in projects.yml`);
    return false;
  }
  
  // Add new project
  config.projects.push({ repo });
  await saveYamlFile(CONFIG.PROJECTS_FILE, config);
  
  console.log(`Added ${repo} to projects.yml`);
  return true;
}

/**
 * Add firmware requirement to firmware.yml configuration
 * @param {string} projectName - Name of the project
 * @param {string} firmware - Required firmware version
 * @returns {Promise<boolean>} True if added, false if already exists
 */
async function addToFirmwareConfig(projectName, firmware) {
  const config = await loadYamlFile(CONFIG.FIRMWARE_FILE);
  
  // Check if firmware requirement already exists
  if (config.firmware_requirements[projectName]) {
    const existingFirmware = config.firmware_requirements[projectName];
    console.log(`Firmware requirement for ${projectName} already exists: ${existingFirmware}`);
    return false;
  }
  
  // Add new firmware requirement
  config.firmware_requirements[projectName] = firmware;
  await saveYamlFile(CONFIG.FIRMWARE_FILE, config);
  
  console.log(`Added firmware requirement ${firmware} for ${projectName} to firmware.yml`);
  return true;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Add a new project to both configuration files
 * @param {string} repo - Repository string (owner/repo)
 * @param {string} firmware - Required firmware version
 * @returns {Promise<void>}
 */
async function addProject(repo, firmware = CONFIG.DEFAULT_FIRMWARE) {
  try {
    console.log(`Adding project: ${repo} with firmware ${firmware}\n`);
    
    // Validate inputs
    if (!isValidRepoFormat(repo)) {
      throw new Error(`Invalid repo format: "${repo}". Expected format: "owner/repo"`);
    }
    
    if (!isValidFirmwareFormat(firmware)) {
      throw new Error(`Invalid firmware format: "${firmware}". Expected format: "X.Y.Z"`);
    }
    
    // Extract project name from repo
    const projectName = repo.split('/')[1];
    
    // Add to both configuration files
    const projectsAdded = await addToProjectsConfig(repo);
    const firmwareAdded = await addToFirmwareConfig(projectName, firmware);
    
    // Summary
    console.log('\nSummary:');
    if (projectsAdded) {
      console.log(`  - Project added to projects.yml`);
    } else {
      console.log(`  - Project already exists in projects.yml`);
    }
    
    if (firmwareAdded) {
      console.log(`  - Firmware requirement added to firmware.yml`);
    } else {
      console.log(`  - Firmware requirement already exists in firmware.yml`);
    }
    
    console.log('\nProject configuration completed successfully!');
    
  } catch (error) {
    console.error('Error adding project:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// COMMAND LINE INTERFACE
// ============================================================================

/**
 * Display usage information
 */
function showUsage() {
  console.log('Usage: npm run add <owner/repo> [firmware_version]');
  console.log('');
  console.log('Arguments:');
  console.log('  owner/repo      Repository in format "owner/repo"');
  console.log('  firmware_version Optional firmware version (default: 20.2.0)');
  console.log('');
  console.log('Examples:');
  console.log('  npm run add "THZoria/NX_Firmware"');
  console.log('  npm run add "Atmosphere-NX/Atmosphere" "20.2.0"');
  console.log('  npm run add "someuser/oldproject" "15.0.1"');
}

// ============================================================================
// ENTRY POINT
// ============================================================================

// Run if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    showUsage();
    process.exit(1);
  }
  
  const repo = args[0];
  const firmware = args[1] || CONFIG.DEFAULT_FIRMWARE;
  
  addProject(repo, firmware);
}

// Export for testing or external use
module.exports = {
  addProject,
  isValidRepoFormat,
  isValidFirmwareFormat,
  addToProjectsConfig,
  addToFirmwareConfig
}; 