/**
 * Deploy Sync Script
 * Synchronizes frontend assets from project root to deploy/ and public/ folders
 * 
 * Usage: node deploy-sync.js
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = __dirname;
const DEPLOY_DIR = path.join(__dirname, 'deploy');
const PUBLIC_DIR = path.join(__dirname, 'public');

// File extensions that should be synced
const SYNC_EXTENSIONS = new Set([
    '.html', '.css', '.js', '.png', '.jpg', '.jpeg',
    '.svg', '.ico', '.woff', '.woff2', '.ttf', '.json',
    '.xml', '.webmanifest'
]);

// Files/directories to exclude from sync
const EXCLUDE = new Set([
    'backend', 'deploy', 'pptx-build', '_cleanup_backup',
    'node_modules', '.env', '.env.example', '.env.local',
    'package-lock.json', 'deploy-sync.js', '.git', '.gitignore'
]);

function shouldSync(name) {
    if (EXCLUDE.has(name)) return false;
    if (name.startsWith('.')) return false;
    const ext = path.extname(name).toLowerCase();
    if (ext && !SYNC_EXTENSIONS.has(ext)) return false;
    return true;
}

function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        const entries = fs.readdirSync(src);
        for (const entry of entries) {
            if (!shouldSync(entry)) continue;
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

function syncTo(targetDir, label) {
    console.log(`Syncing to ${label}...`);
    
    const entries = fs.readdirSync(SOURCE_DIR);
    let copied = 0;
    
    for (const entry of entries) {
        if (!shouldSync(entry)) continue;
        
        const srcPath = path.join(SOURCE_DIR, entry);
        const destPath = path.join(targetDir, entry);
        
        copyRecursive(srcPath, destPath);
        copied++;
    }
    
    // Also sync js/api-client.js if it exists
    const jsSrc = path.join(SOURCE_DIR, 'js');
    const jsDest = path.join(targetDir, 'js');
    if (fs.existsSync(jsSrc)) {
        if (!fs.existsSync(jsDest)) {
            fs.mkdirSync(jsDest, { recursive: true });
        }
        const jsFiles = fs.readdirSync(jsSrc);
        for (const file of jsFiles) {
            if (shouldSync(file)) {
                fs.copyFileSync(path.join(jsSrc, file), path.join(jsDest, file));
                copied++;
            }
        }
    }
    
    console.log(`  -> Synced ${copied} items to ${label}`);
}

// Main
console.log('=== DS Financial Deploy Sync ===\n');

try {
    syncTo(DEPLOY_DIR, 'deploy/');
    syncTo(PUBLIC_DIR, 'public/');
    console.log('\n✅ Sync complete!');
} catch (err) {
    console.error('\n❌ Sync failed:', err.message);
    process.exit(1);
}
