const fs = require('fs');
const path = require('path');

const walkDir = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (f === 'node_modules' || f === '.git' || f === 'dist' || f === 'build' || f === '.agents') return;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
};

const replacements = [
  { regex: /Eaty Wonders/g, target: 'HungryLakwatsero' },
  { regex: /EatyWonders/g, target: 'HungryLakwatsero' },
  { regex: /eaty wonders/gi, target: 'HungryLakwatsero' },
  { regex: /eatywonders/g, target: 'hungrylakwatsero' },
  { regex: /eaty-wonders/g, target: 'hungry-lakwatsero' },
  { regex: /EATY WONDERS/g, target: 'HUNGRYLAKWATSERO' },
  { regex: /EATYWONDERS/g, target: 'HUNGRYLAKWATSERO' },
];

const processFile = (filePath) => {
  const ext = path.extname(filePath);
  if (!['.js', '.jsx', '.html', '.css', '.json', '.md', '.sql', '.env'].includes(ext)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const { regex, target } of replacements) {
    content = content.replace(regex, target);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Rebranded: ${filePath}`);
  }
};

const targetDirs = [
  'C:\\Users\\karen\\.gemini\\antigravity\\scratch\\eaty-wonders\\frontend',
  'C:\\Users\\karen\\.gemini\\antigravity\\scratch\\eaty-wonders\\backend',
  'C:\\Users\\karen\\.gemini\\antigravity\\scratch\\eaty-wonders\\package.json',
  'C:\\Users\\karen\\.gemini\\antigravity\\scratch\\eaty-wonders\\README.md'
];

targetDirs.forEach(target => {
  if (fs.existsSync(target)) {
    if (fs.statSync(target).isDirectory()) {
      walkDir(target, processFile);
    } else {
      processFile(target);
    }
  }
});
console.log('Rebranding complete.');
