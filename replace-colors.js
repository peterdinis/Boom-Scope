const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];
const exts = ['.tsx', '.ts'];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (exts.includes(path.extname(fullPath))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We don't want to replace blue-500 in the color picker of the settings page!
      // In app/dashboard/settings/page.tsx, there's `["#3b82f6", "#10b981", ...]` and `text-blue-500` etc.
      // Wait, we DO want to replace `text-blue-500` with `text-primary`, `bg-blue-500` with `bg-primary` etc.
      // But we shouldn't replace literal "#3b82f6" in the array.
      // Since we are replacing `blue-500` and `blue-600` only, it's fine.

      const original = content;
      content = content.replace(/blue-500/g, 'primary');
      content = content.replace(/blue-600/g, 'primary');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

dirs.forEach(processDir);
