import fs from 'fs';
let file = 'src/components/InteractiveSandbox.tsx';
let txt = fs.readFileSync(file, 'utf8');
txt = txt.replace(/err => console\.error/g, 'err => err?.code !== "PGRST205" && console.error');
txt = txt.replace(/catch \(e\) \{\n            console\.error\('Failed to sync order update to Supabase:', e\);\n          \}/g, "catch (e: any) { if (e?.code !== 'PGRST205') console.error('Failed to sync order update to Supabase:', e); }");
txt = txt.replace(/catch \(e\) \{\n            console\.error\('Failed to sync restaurant update to Supabase:', e\);\n          \}/g, "catch (e: any) { if (e?.code !== 'PGRST205') console.error('Failed to sync restaurant update to Supabase:', e); }");
fs.writeFileSync(file, txt);
