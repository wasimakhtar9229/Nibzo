const fs = require('fs');

const files = [
  'src/components/InteractiveSandbox.tsx',
  'src/App.tsx',
  'src/components/BlueprintExplorer.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace un-premium patterns
  content = content.replace(/text-slate-/g, 'text-gray-');
  content = content.replace(/bg-slate-/g, 'bg-gray-');
  content = content.replace(/border-slate-/g, 'border-gray-');
  
  // Clean up material-symbols-outlined usages if applicable
  // Wait, we just added the font! It should be fine as material-symbols-outlined.
  // Actually, wait, replacing rounded-full with rounded-lg on pills:
  // We'll replace "rounded-full" with "rounded-lg" but ONLY if it's not a w-2, w-3 circle indicator.
  // We can do this carefully:
  content = content.replace(/rounded-full px/g, 'rounded-md px');
  content = content.replace(/rounded-2xl/g, 'rounded-xl'); // less aggressive
  content = content.replace(/bg-gray-50/g, 'bg-[#FCFCFD]'); // premium neutral background
  
  fs.writeFileSync(f, content);
  console.log(`Updated ${f}`);
});
