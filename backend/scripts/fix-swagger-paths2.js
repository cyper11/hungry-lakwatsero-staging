const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../routes');
const replacements = [
  { file: 'postRoutes.js', from: /\/api\/post/g, to: '/api/posts' },
  { file: 'storyRoutes.js', from: /\/api\/story/g, to: '/api/stories' }
];

replacements.forEach(({ file, from, to }) => {
  const filePath = path.join(routesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(from, to);
    fs.writeFileSync(filePath, content);
    console.log(`Updated paths in ${file}: ${from} -> ${to}`);
  }
});
