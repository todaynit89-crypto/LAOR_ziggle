const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-red-500/g, 'text-slate-500 dark:text-slate-400 hover:text-red-500');
code = code.replace(/text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-emerald-500/g, 'text-slate-500 dark:text-slate-400 hover:text-emerald-500');

fs.writeFileSync('src/App.tsx', code);
