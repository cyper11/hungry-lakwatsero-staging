const fs = require('fs');
const path = require('path');

const directory = './src';

const replacements = {
  'bg-dark-950': 'bg-background',
  'bg-dark-900': 'bg-surface',
  'text-cream-100': 'text-primary',
  'text-cream-200': 'text-secondary',
  'text-sage-400': 'text-muted',
  'border-forest-800': 'border-default'
};

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir(directory);
let totalReplacements = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  for (const [literal, semantic] of Object.entries(replacements)) {
    // We use a regex with word boundaries or matching class names to avoid partial matches
    const regex = new RegExp(`(?<!-)\\b${literal}\\b`, 'g');
    content = content.replace(regex, semantic);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    totalReplacements++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`\nMigration complete. Modified ${totalReplacements} files.`);
