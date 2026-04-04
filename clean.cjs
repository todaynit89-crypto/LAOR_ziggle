const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Clean up duplicated classes
code = code.replace(/text-slate-400 dark:text-slate-500 dark:text-\[\#5a6a85\]/g, 'text-slate-500 dark:text-[#5a6a85]');
code = code.replace(/text-slate-600 dark:text-slate-500 dark:text-\[\#5a6a85\]/g, 'text-slate-700 dark:text-[#5a6a85]');
code = code.replace(/text-cyan-800 dark:text-cyan-600 dark:text-\[\#22d3ee\]/g, 'text-cyan-800 dark:text-[#22d3ee]');
code = code.replace(/text-cyan-600 dark:text-cyan-600 dark:text-\[\#22d3ee\]/g, 'text-cyan-700 dark:text-[#22d3ee]');
code = code.replace(/bg-cyan-50 dark:bg-cyan-50 dark:bg-\[rgba\(34,211,238,0\.1\)\]/g, 'bg-cyan-50 dark:bg-[rgba(34,211,238,0.1)]');
code = code.replace(/hover:bg-cyan-100 dark:hover:bg-cyan-100 dark:hover:bg-\[rgba\(34,211,238,0\.2\)\]/g, 'hover:bg-cyan-100 dark:hover:bg-[rgba(34,211,238,0.2)]');
code = code.replace(/bg-slate-100 dark:bg-slate-100 dark:bg-\[\#1a2236\]/g, 'bg-slate-100 dark:bg-[#1a2236]');
code = code.replace(/border-slate-200 dark:border-slate-200 dark:border-\[\#1e2d4a\]/g, 'border-slate-200 dark:border-[#1e2d4a]');
code = code.replace(/text-slate-900 dark:text-slate-900 dark:text-\[\#e8edf5\]/g, 'text-slate-900 dark:text-[#e8edf5]');
code = code.replace(/text-slate-500 dark:text-slate-700 dark:text-\[\#8896b0\]/g, 'text-slate-600 dark:text-[#8896b0]');
code = code.replace(/hover:text-slate-700 dark:hover:text-slate-900 dark:text-\[\#e8edf5\]/g, 'hover:text-slate-700 dark:hover:text-[#e8edf5]');
code = code.replace(/text-slate-500 dark:text-slate-500 dark:text-\[\#5a6a85\]/g, 'text-slate-600 dark:text-[#5a6a85]');
code = code.replace(/text-slate-400 dark:text-slate-500 dark:text-\[\#5a6a85\]/g, 'text-slate-500 dark:text-[#5a6a85]');
code = code.replace(/text-slate-500 dark:text-slate-400 hover:text-red-500/g, 'text-slate-500 dark:text-slate-400 hover:text-red-500');
code = code.replace(/text-slate-500 dark:text-slate-400 hover:text-emerald-500/g, 'text-slate-500 dark:text-slate-400 hover:text-emerald-500');

// Additional cleanups
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
console.log('Cleaned up successfully');
