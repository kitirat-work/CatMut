// Generates src/styles/tokens.css from design-system/tokens.json (the CatMut design system).
// Run: npm run tokens
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(resolve(root, 'design-system/tokens.json'), 'utf8'));

const themes = tokens.color.themes.map((t) => t.id); // first theme is the default
const [base, ...others] = themes;

const valueFor = (value, theme) => (typeof value === 'string' ? value : value[theme] ?? value[base]);

const themed = { [base]: [] };
others.forEach((t) => (themed[t] = []));

const add = (name, value) => {
  themed[base].push(`  --${name}: ${valueFor(value, base)};`);
  if (typeof value !== 'string') {
    others.forEach((t) => {
      if (value[t] !== undefined) themed[t].push(`  --${name}: ${value[t]};`);
    });
  }
};

tokens.color.tokens.forEach((t) => add(t.name, t.value));
(tokens.shadow?.tokens ?? []).forEach((t) => add(t.name, t.value));

const plain = [];
Object.entries(tokens.type.families).forEach(([k, v]) => plain.push(`  --font-${k}: ${v};`));
(tokens.spacing?.tokens ?? []).forEach((t) => plain.push(`  --${t.name}: ${t.value};`));
(tokens.radius?.tokens ?? []).forEach((t) => plain.push(`  --${t.name}: ${t.value};`));

const out = [];
out.push(`/* ${tokens.name} — generated from design-system/tokens.json. Do not edit; run \`npm run tokens\`. */`);
out.push(':root {');
out.push(`  color-scheme: ${base};`);
out.push(...themed[base], ...plain);
out.push('}');
others.forEach((t) => {
  if (!themed[t].length) return;
  out.push(`@media (prefers-color-scheme: ${t}) {`);
  out.push(`  :root:not([data-theme="${base}"]) {`);
  out.push(`    color-scheme: ${t};`);
  out.push(...themed[t].map((l) => '  ' + l));
  out.push('  }');
  out.push('}');
  out.push(`:root[data-theme="${t}"] {`);
  out.push(`  color-scheme: ${t};`);
  out.push(...themed[t]);
  out.push('}');
});

writeFileSync(resolve(root, 'src/styles/tokens.css'), out.join('\n') + '\n');
console.log('wrote src/styles/tokens.css');
