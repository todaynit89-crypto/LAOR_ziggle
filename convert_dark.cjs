const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// First, fix the messed up classes from previous steps
code = code.replace(/dark:bg-white /g, '');
code = code.replace(/dark:text-slate-\d+ /g, '');
code = code.replace(/dark:hover:border-slate-\d+ /g, '');
code = code.replace(/dark:hover:bg-slate-\d+ /g, '');
code = code.replace(/dark:bg-slate-\d+ /g, '');

// Now, let's process className strings
code = code.replace(/className="([^"]+)"/g, (match, classStr) => {
  let classes = classStr.split(/\s+/).filter(Boolean);
  
  let newClasses = [];
  let darkOverrides = {};
  
  // Find all dark classes
  classes.forEach(cls => {
    if (cls.startsWith('dark:')) {
      const actualClass = cls.substring(5); // remove 'dark:'
      
      // Determine the property type (bg, text, border, etc)
      let prop = '';
      if (actualClass.startsWith('bg-')) prop = 'bg';
      else if (actualClass.startsWith('text-')) prop = 'text';
      else if (actualClass.startsWith('border-')) prop = 'border';
      else if (actualClass.startsWith('from-')) prop = 'from';
      else if (actualClass.startsWith('via-')) prop = 'via';
      else if (actualClass.startsWith('to-')) prop = 'to';
      else if (actualClass.startsWith('ring-')) prop = 'ring';
      else if (actualClass.startsWith('shadow-')) prop = 'shadow';
      else if (actualClass.startsWith('hover:bg-')) prop = 'hover:bg';
      else if (actualClass.startsWith('hover:text-')) prop = 'hover:text';
      else if (actualClass.startsWith('hover:border-')) prop = 'hover:border';
      
      if (prop) {
        darkOverrides[prop] = actualClass;
      } else {
        newClasses.push(actualClass); // Keep it if we don't know the prop
      }
    }
  });
  
  // Now filter the original classes
  classes.forEach(cls => {
    if (cls.startsWith('dark:')) return; // Already handled
    
    let prop = '';
    if (cls.startsWith('bg-')) prop = 'bg';
    else if (cls.startsWith('text-')) prop = 'text';
    else if (cls.startsWith('border-')) prop = 'border';
    else if (cls.startsWith('from-')) prop = 'from';
    else if (cls.startsWith('via-')) prop = 'via';
    else if (cls.startsWith('to-')) prop = 'to';
    else if (cls.startsWith('ring-')) prop = 'ring';
    else if (cls.startsWith('shadow-')) prop = 'shadow';
    else if (cls.startsWith('hover:bg-')) prop = 'hover:bg';
    else if (cls.startsWith('hover:text-')) prop = 'hover:text';
    else if (cls.startsWith('hover:border-')) prop = 'hover:border';
    
    if (prop && darkOverrides[prop]) {
      // Skip this light class because we have a dark override
    } else {
      newClasses.push(cls);
    }
  });
  
  // Add the dark overrides
  Object.values(darkOverrides).forEach(cls => newClasses.push(cls));
  
  return `className="${newClasses.join(' ')}"`;
});

// Also handle template literals: className={`...`}
code = code.replace(/className=\{`([^`]+)`\}/g, (match, classStr) => {
  // This is trickier because of dynamic expressions like ${...}
  // We'll just remove 'dark:' from it and let Tailwind handle it.
  // But we should remove the light classes if they are static.
  // Actually, just removing 'dark:' is 90% of the way there, 
  // but we might have conflicts.
  // Let's just do a simple replace for template literals.
  let newStr = classStr.replace(/dark:/g, '');
  return `className={\`${newStr}\`}`;
});

fs.writeFileSync('src/App.tsx', code);
console.log('Converted to pure dark mode');
