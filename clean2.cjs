const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Clean up duplicated dark classes
code = code.replace(/dark:text-slate-\d+ dark:text-\[/g, 'dark:text-[');
code = code.replace(/dark:hover:bg-slate-\d+ dark:hover:bg-\[/g, 'dark:hover:bg-[');
code = code.replace(/dark:bg-slate-\d+ dark:bg-\[/g, 'dark:bg-[');
code = code.replace(/dark:hover:text-slate-\d+ dark:hover:text-\[/g, 'dark:hover:text-[');
code = code.replace(/dark:text-cyan-\d+ dark:text-\[/g, 'dark:text-[');
code = code.replace(/dark:text-emerald-\d+ dark:text-\[/g, 'dark:text-[');
code = code.replace(/dark:text-red-\d+ dark:text-\[/g, 'dark:text-[');

fs.writeFileSync('src/App.tsx', code);
