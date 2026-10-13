const fs = require('fs');
const parser = require('@babel/parser');
const path = 'src/pages/supervisor/Suivi.jsx';
const code = fs.readFileSync(path, 'utf8');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('parse ok');
} catch (e) {
  console.error('parse failed', e.message);
  if (e.loc) console.error('line', e.loc.line, 'column', e.loc.column);
  const lines = code.split(/\r?\n/);
  const from = Math.max(1, (e.loc?.line || 1) - 5);
  const to = Math.min(lines.length, (e.loc?.line || 1) + 5);
  for (let i = from; i <= to; i += 1) {
    console.error(`${i}: ${lines[i - 1]}`);
  }
}
