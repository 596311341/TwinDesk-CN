#!/usr/bin/env node
// 把中文文案应用到已反编译的 TwinDesk Android 目录（替换 const-string 字面量）。
// 用法: node scripts/android/apply.js <decoded 目录> [strings-zh.json]
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || 'decoded');
const mapFile = path.resolve(process.argv[3] || path.join(__dirname, '..', '..', 'android', 'strings-zh.json'));
const dict = JSON.parse(fs.readFileSync(mapFile, 'utf8'));

function decode(s) {
  return s.replace(/\\(u[0-9a-fA-F]{4}|n|t|r|'|"|\\)/g, (m, g) => {
    if (g[0] === 'u') return String.fromCharCode(parseInt(g.slice(1), 16));
    if (g === 'n') return '\n';
    if (g === 't') return '\t';
    if (g === 'r') return '\r';
    return g;
  });
}
const encode = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

function lookup(s) {
  if (Object.prototype.hasOwnProperty.call(dict, s)) return dict[s];
  const t = s.trim();
  if (t !== s && Object.prototype.hasOwnProperty.call(dict, t)) {
    const i = s.indexOf(t);
    return s.slice(0, i) + dict[t] + s.slice(i + t.length);
  }
  return null;
}

function smaliDirs() {
  return fs.readdirSync(root).filter((n) => /^smali(_classes\d+)?$/.test(n)).map((n) => path.join(root, n));
}

let replaced = 0, files = 0;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith('.smali')) continue;
    const src = fs.readFileSync(p, 'utf8');
    let hit = false;
    const out = src.split('\n').map((line) => {
      const m = line.match(/^(\s*const-string(?:\/jumbo)?\s+[vp]\d+,\s*)"((?:[^"\\]|\\.)*)"\s*$/);
      if (!m) return line;
      const zh = lookup(decode(m[2]));
      if (!zh) return line;
      hit = true; replaced++;
      return m[1] + '"' + encode(zh) + '"';
    });
    if (hit) { fs.writeFileSync(p, out.join('\n'), 'utf8'); files++; }
  }
}

for (const d of smaliDirs()) {
  const appDir = path.join(d, 'com', 'twindesk');
  if (fs.existsSync(appDir)) walk(appDir);
}
console.log('replaced ' + replaced + ' strings in ' + files + ' files');
