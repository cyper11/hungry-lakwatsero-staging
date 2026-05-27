const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js') && f !== 'authRoutes.js');

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add the tag header
  const tagName = file.replace('Routes.js', '');
  const capitalizedTag = tagName.charAt(0).toUpperCase() + tagName.slice(1);
  
  if (!content.includes(`@swagger\n * tags:`)) {
    const lines = content.split('\n');
    const importIndex = lines.findIndex(line => line.includes('const router = express.Router()'));
    if (importIndex !== -1) {
      lines.splice(importIndex + 1, 0, `\n/**\n * @swagger\n * tags:\n *   name: ${capitalizedTag}\n *   description: ${capitalizedTag} management\n */\n`);
      content = lines.join('\n');
    }
  }

  // Regex to match router routes
  const routeRegex = /router\.(get|post|put|patch|delete)\(['"`](.+?)['"`],/g;
  
  let newContent = '';
  let lastIndex = 0;
  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1];
    const rawPath = match[2];
    
    // Convert express paths like /:id to swagger paths like /{id}
    const swaggerPath = rawPath.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
    const fullPath = `/api/${tagName}${swaggerPath === '/' ? '' : swaggerPath}`;

    // Extract params
    const params = [];
    const paramMatches = rawPath.match(/:([a-zA-Z0-9_]+)/g);
    if (paramMatches) {
      paramMatches.forEach(p => {
        const paramName = p.substring(1);
        params.push(` *       - in: path\n *         name: ${paramName}\n *         required: true\n *         schema:\n *           type: string`);
      });
    }

    // Check if it requires auth
    const lineStr = content.substring(match.index, content.indexOf('\n', match.index));
    const requiresAuth = lineStr.includes('verifyToken') || lineStr.includes('authMiddleware');

    // Skip if already documented
    const textBefore = content.substring(Math.max(0, match.index - 50), match.index);
    if (!textBefore.includes('*/')) {
      const swaggerBlock = `/**
 * @swagger
 * ${fullPath}:
 *   ${method}:
 *     summary: ${method.toUpperCase()} ${rawPath}
 *     tags: [${capitalizedTag}]${requiresAuth ? '\n *     security:\n *       - bearerAuth: []' : ''}${params.length > 0 ? '\n *     parameters:\n' + params.join('\n') : ''}
 *     responses:
 *       200:
 *         description: Success
 */
`;
      newContent += content.substring(lastIndex, match.index) + swaggerBlock;
    } else {
      newContent += content.substring(lastIndex, match.index);
    }
    lastIndex = match.index;
  }
  newContent += content.substring(lastIndex);

  fs.writeFileSync(filePath, newContent, 'utf8');
});

console.log('Swagger stubs generated.');
