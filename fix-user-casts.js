const fs = require('fs');
const files = [
  'server/modules/workspace/routes.ts',
  'server/modules/canvas/routes.ts',
  'server/modules/ai/routes.ts'
];

for (const file of files) {
  if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      content = content.replace(/\(req\.user as any\)\?/g, 'req.user?');
      content = content.replace(/\(req\.user as any\)\./g, 'req.user!.');
      fs.writeFileSync(file, content);
      console.log(`Replaced in ${file}`);
  }
}
