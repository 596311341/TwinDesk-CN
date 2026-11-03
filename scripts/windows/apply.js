#!/usr/bin/env node
// 把简体中文汉化层应用到一个已解包的 TwinDesk Windows 应用目录。
// 用法: node scripts/windows/apply.js <resources/app 目录> [i18n-zh.js 路径]
'use strict';
const fs = require('fs');
const path = require('path');

const appDir = path.resolve(process.argv[2] || '.');
const i18nSrc = path.resolve(process.argv[3] || path.join(__dirname, '..', '..', 'windows', 'i18n-zh.js'));
if (!fs.existsSync(appDir)) { console.error('app dir not found: ' + appDir); process.exit(1); }
if (!fs.existsSync(i18nSrc)) { console.error('i18n file not found: ' + i18nSrc); process.exit(1); }

const sharedDir = path.join(appDir, 'shared');
fs.mkdirSync(sharedDir, { recursive: true });
fs.copyFileSync(i18nSrc, path.join(sharedDir, 'i18n-zh.js'));
const target = path.join(sharedDir, 'i18n-zh.js');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '_zh_backup' || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const bakDir = path.join(appDir, '_zh_backup');
function backup(file) {
  const rel = path.relative(appDir, file);
  const dst = path.join(bakDir, rel);
  if (fs.existsSync(dst)) return;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(file, dst);
}

// 1. 给每个 HTML 注入脚本；<base href="../"> 会改变相对路径的解析基准
let injected = 0;
for (const file of walk(appDir).filter((f) => f.endsWith('.html'))) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('i18n-zh.js')) continue;
  backup(file);
  const m = html.match(/<base\s+href=["']([^"']+)["']/i);
  const baseHref = m ? m[1] : '';
  const baseDir = path.resolve(path.dirname(file), baseHref || '.');
  let rel = path.relative(baseDir, target).split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = './' + rel;
  const tag = '  <script src="' + rel + '"></script>\n';
  const idx = html.search(/<\/head>/i);
  if (idx === -1) { console.warn('no </head>: ' + file); continue; }
  html = html.slice(0, idx) + tag + html.slice(idx);
  fs.writeFileSync(file, html, 'utf8');
  injected++;
}
console.log('injected into ' + injected + ' html files');

// 2. 原生托盘菜单
const tray = path.join(sharedDir, 'traymenu.js');
if (fs.existsSync(tray)) {
  let src = fs.readFileSync(tray, 'utf8');
  if (!src.includes('__zhMenu')) {
    backup(tray);
    const ZH = {
      'Connect To': '连接到', 'Nobody nearby': '附近没有设备', 'Connect by Address…': '按地址连接…', 'Look Again': '重新查找',
      'Open TwinDesk…': '打开 TwinDesk…', 'Quit TwinDesk': '退出 TwinDesk',
      'Bring Mouse and Keyboard Back': '恢复鼠标和键盘控制', 'Cursor Sharing': '光标共享',
      'Mouse and Keyboard': '鼠标和键盘', 'Share Keyboard': '共享键盘', 'Show a Popup When Switching': '切换时显示提示',
      'Screen': '屏幕', 'Mirror': '镜像', 'Extend': '扩展', 'Off': '关闭',
      'Share Screen': '共享屏幕', 'Receive Screen': '接收屏幕',
      'Clipboard and Sound': '剪贴板与声音', 'Share Clipboard': '共享剪贴板', 'Send Sound': '发送声音',
      'Files': '文件', 'Drag Files Across the Screen Edge': '跨屏幕边缘拖拽文件', 'Connection': '连接',
      'Open Log Folder': '打开日志文件夹', 'Disconnect': '断开连接', 'Forget': '取消配对',
      'Connect': '连接', 'Reconnect': '重新连接', 'Paired': '已配对', 'Not paired': '未配对',
      'Connected': '已连接', 'Not connected': '未连接'
    };
    const rules = [
      ['^Connected to (.+)$', '已连接到 $1'],
      ['^Lock Cursor on (.+?) \\((.+)\\)$', '将光标锁定在 $1（$2）'],
      ['^Use Mouse and Keyboard on (.+)$', '在 $1 上使用鼠标和键盘'],
      ['^Let (.+?) Control (.+)$', '允许 $1 控制 $2'],
      ['^Copy and Paste Files \\((.+)\\)$', '复制粘贴文件（$1）'],
      ['^Take Over (.+)$', '接管 $1'],
      ['^Connect to (.+)$', '连接到 $1'],
      ['^Disconnect (.+)$', '断开与 $1 的连接'],
      ['^Download TwinDesk (.+)$', '下载 TwinDesk $1'],
      ['^Paired with (.+)$', '已与 $1 配对']
    ];
    const block = '\n\n// __zhMenu: 中文菜单标签（非官方翻译层）\n'
      + 'const __ZH_MENU = ' + JSON.stringify(ZH) + ';\n'
      + 'const __ZH_RULES = ' + JSON.stringify(rules) + '.map((r) => [new RegExp(r[0]), r[1]]);\n'
      + "const __zhLabel = (s) => {\n  if (typeof s !== 'string') return s;\n  if (__ZH_MENU[s]) return __ZH_MENU[s];\n  for (const [re, rep] of __ZH_RULES) { if (re.test(s)) return s.replace(re, rep); }\n  return s;\n};\n"
      + 'const __zhMenu = (items) => (items || []).map((it) => {\n  const o = Object.assign({}, it);\n  if (typeof o.label === \'string\') o.label = __zhLabel(o.label);\n  if (Array.isArray(o.submenu)) o.submenu = __zhMenu(o.submenu);\n  return o;\n});\n'
      + 'module.exports = { template: (m) => __zhMenu(template(m)) };\n';
    if (!/module\.exports\s*=\s*\{\s*template\s*\}/.test(src)) { console.warn('traymenu: export line not found, skipped'); }
    else {
      src = src.replace(/module\.exports\s*=\s*\{\s*template\s*\}\s*;/, block.trim());
      fs.writeFileSync(tray, src, 'utf8');
      console.log('traymenu patched');
    }
  }
}

// 3. 原生文件对话框标题
const ipc = path.join(appDir, 'windows', 'ipc.js');
if (fs.existsSync(ipc)) {
  let s = fs.readFileSync(ipc, 'utf8');
  const before = s;
  backup(ipc);
  s = s.replace("title: 'Send files', buttonLabel: 'Send'", "title: '发送文件', buttonLabel: '发送'")
       .replace("title: 'Folder for received files', buttonLabel: 'Use this folder'", "title: '接收文件的文件夹', buttonLabel: '使用此文件夹'")
       .replace("title: 'Folder to share with the other computer'", "title: '与另一台电脑共享的文件夹'");
  if (s !== before) { fs.writeFileSync(ipc, s, 'utf8'); console.log('ipc dialogs patched'); }
}
console.log('done');
