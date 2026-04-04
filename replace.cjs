const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace text-slate-400 with text-slate-500 for light mode text
code = code.replace(/text-slate-400 dark:text-\[\#5a6a85\]/g, 'text-slate-500 dark:text-[#5a6a85]');
code = code.replace(/text-slate-400 hover:text-red-500/g, 'text-slate-500 dark:text-slate-400 hover:text-red-500');
code = code.replace(/text-slate-400 hover:text-emerald-500/g, 'text-slate-500 dark:text-slate-400 hover:text-emerald-500');
code = code.replace(/text-slate-400 hover:text-slate-600/g, 'text-slate-500 dark:text-slate-400 hover:text-slate-700');

// Fix toast
code = code.replace(
  /bg-slate-800 dark:bg-\[\#1e293b\] border border-slate-200 dark:border-\[\#1e2d4a\] text-slate-900 dark:text-\[\#e8edf5\]/,
  'bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#1e2d4a] text-slate-800 dark:text-[#e8edf5]'
);

// Fix header text
code = code.replace(/text-cyan-800 dark:text-\[\#22d3ee\]/g, 'text-cyan-700 dark:text-[#22d3ee]');
code = code.replace(/text-slate-600 dark:text-\[\#5a6a85\]/g, 'text-slate-700 dark:text-[#5a6a85]');
code = code.replace(/text-slate-600 dark:text-\[\#8896b0\]/g, 'text-slate-700 dark:text-[#8896b0]');

// Fix buttons
code = code.replace(/hover:bg-\[\#1e2d4a\]/g, 'hover:bg-slate-200 dark:hover:bg-[#1e2d4a]');

// Fix ticker list background in light mode
code = code.replace(/bg-\[\#1e2d4a\] text-slate-900 dark:text-\[\#e8edf5\]/g, 'bg-slate-200 dark:bg-[#1e2d4a] text-slate-800 dark:text-[#e8edf5]');

fs.writeFileSync('src/App.tsx', code);
console.log('Replaced successfully');
