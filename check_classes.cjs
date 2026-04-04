const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');
const darkClasses = new Set();
lines.forEach(line => {
  const matches = line.match(/dark:[a-zA-Z0-9_\[\]\#\-]+/g);
  if (matches) {
    matches.forEach(m => darkClasses.add(m));
  }
});
console.log(Array.from(darkClasses).sort().join('\n'));
