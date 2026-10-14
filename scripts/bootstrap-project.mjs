import { existsSync, mkdirSync, copyFileSync, readFileSync } from 'node:fs';
import path from 'node:path';

const target = process.argv[2];
if (!target) throw new Error('Usage: pnpm bootstrap:project /absolute/path/to/project');

const targetDir = path.resolve(target);
mkdirSync(targetDir, { recursive: true });
const sourceDir = path.resolve(import.meta.dirname, '..');

for (const file of ['TODO.md', 'AGENTS.md']) {
  const destination = path.join(targetDir, file);
  if (existsSync(destination)) {
    const current = readFileSync(destination, 'utf8');
    if (!current.includes('Enterprise Engine project contract')) {
      console.log(`Preserved existing ${file}; review it and merge the Enterprise Engine contract manually.`);
    } else {
      console.log(`${file} already contains the Enterprise Engine contract.`);
    }
    continue;
  }
  copyFileSync(path.join(sourceDir, file), destination);
  console.log(`Imported ${file}`);
}

console.log(`Project instructions installed in ${targetDir}. Codex should read TODO.md before implementation.`);
