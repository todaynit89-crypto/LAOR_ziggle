const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/bg-slate-800 dark:bg-white dark:bg-\[\#1e293b\]/g, 'bg-white dark:bg-[#1e293b]');

fs.writeFileSync('src/App.tsx', code);
