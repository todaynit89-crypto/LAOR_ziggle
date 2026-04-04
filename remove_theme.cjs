const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove isDarkMode state
code = code.replace(/const \[isDarkMode, setIsDarkMode\] = useState\(true\);\n/g, '');

// 2. Remove theme logic from useEffect
code = code.replace(/    const savedTheme = localStorage\.getItem\('laor_theme'\);\n    const isLight = savedTheme === 'light';\n    \n    setIsDarkMode\(!isLight\);\n    if \(isLight\) {\n      document\.documentElement\.classList\.remove\('dark'\);\n    } else {\n      document\.documentElement\.classList\.add\('dark'\);\n    }\n/g, '');

// 3. Remove toggleTheme function
code = code.replace(/  const toggleTheme = \(\) => \{\n    const newTheme = !isDarkMode;\n    setIsDarkMode\(newTheme\);\n    if \(newTheme\) {\n      document\.documentElement\.classList\.add\('dark'\);\n      localStorage\.setItem\('laor_theme', 'dark'\);\n    } else {\n      document\.documentElement\.classList\.remove\('dark'\);\n      localStorage\.setItem\('laor_theme', 'light'\);\n    }\n  \};\n/g, '');

// 4. Remove the theme toggle button
const buttonRegex = /        <button \n          onClick=\{toggleTheme\}\n          className="absolute left-0 top-5 text-slate-600 dark:text-slate-700 dark:text-\[\#8896b0\] hover:text-amber-600 dark:hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-\[\#1a2236\]"\n          title="테마 변경"\n        >\n          \{isDarkMode \? <Sun size=\{20\} \/> : <Moon size=\{20\} \/>\}\n        <\/button>\n/g;
code = code.replace(buttonRegex, '');

// 5. Replace remaining isDarkMode with true
code = code.replace(/isDarkMode \? /g, 'true ? ');

// 6. Remove Sun, Moon from imports
code = code.replace(/Sun, Moon, /g, '');

fs.writeFileSync('src/App.tsx', code);
