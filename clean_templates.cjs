const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Clean up template literals
code = code.replace(/bg-slate-100 bg-\[\#1a2236\]/g, 'bg-[#1a2236]');
code = code.replace(/border-slate-200 border-\[\#1e2d4a\]/g, 'border-[#1e2d4a]');
code = code.replace(/text-slate-900 text-\[\#e8edf5\]/g, 'text-[#e8edf5]');
code = code.replace(/placeholder:text-slate-500 text-\[\#5a6a85\]/g, 'placeholder:text-[#5a6a85]');
code = code.replace(/text-emerald-600 text-\[\#34d399\]/g, 'text-[#34d399]');
code = code.replace(/text-slate-600 text-\[\#8896b0\]/g, 'text-[#8896b0]');
code = code.replace(/hover:text-emerald-600 text-\[\#34d399\]/g, 'hover:text-[#34d399]');
code = code.replace(/text-slate-500 text-\[\#5a6a85\]/g, 'text-[#5a6a85]');
code = code.replace(/hover:text-slate-900 text-\[\#e8edf5\]/g, 'hover:text-[#e8edf5]');
code = code.replace(/bg-white bg-\[\#1e293b\]/g, 'bg-[#1e293b]');
code = code.replace(/text-slate-800 text-\[\#e8edf5\]/g, 'text-[#e8edf5]');
code = code.replace(/hover:bg-slate-200 hover:bg-\[\#1e2d4a\]/g, 'hover:bg-[#1e2d4a]');
code = code.replace(/hover:text-red-500 text-\[\#f87171\]/g, 'hover:text-[#f87171]');

fs.writeFileSync('src/App.tsx', code);
console.log('Cleaned up template literals');
