import fs from 'fs';

const files = [
  'src/components/InteractiveSandbox.tsx',
  'src/App.tsx',
  'src/components/BlueprintExplorer.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  
  let content = fs.readFileSync(f, 'utf8');
  
  content = content.replace(/text-slate-/g, 'text-gray-');
  content = content.replace(/bg-slate-/g, 'bg-gray-');
  content = content.replace(/border-slate-/g, 'border-gray-');
  content = content.replace(/rounded-full px/g, 'rounded-md px');
  content = content.replace(/rounded-2xl/g, 'rounded-xl');
  content = content.replace(/bg-gray-50/g, 'bg-[#FCFCFD]');
  
  fs.writeFileSync(f, content);
  console.log(`Updated ${f}`);
});
