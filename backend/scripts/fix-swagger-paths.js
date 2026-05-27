const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../routes');
const replacements = [
  { file: 'hiddenGemRoutes.js', from: /\/api\/hiddenGem/g, to: '/api/hidden-gems' },
  { file: 'favoriteRoutes.js', from: /\/api\/favorite/g, to: '/api/favorites' },
  { file: 'restaurantRoutes.js', from: /\/api\/restaurant/g, to: '/api/restaurants' },
  { file: 'reviewRoutes.js', from: /\/api\/review/g, to: '/api/reviews' },
  { file: 'communityRoutes.js', from: /\/api\/community/g, to: '/api/posts' },
  { file: 'municipalityRoutes.js', from: /\/api\/municipality/g, to: '/api/municipalities' },
  { file: 'reportRoutes.js', from: /\/api\/report/g, to: '/api/reports' }
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
