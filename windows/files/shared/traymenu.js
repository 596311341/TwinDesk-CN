// TwinDesk — Copyright (C) 2026 inukaasith. GPL-3.0, see LICENSE.
// The menu bar / tray menu, laid out the same on every platform (each main.js gives the model).
// Connected: the status, the way home, Cursor Sharing, then the switches by kind (Mouse and
// Keyboard, Screen, Clipboard and Sound, Files, Connection) and the app. Not connected: only
// connecting, the window, Quit.
//   template(m) -> an Electron menu template
//   m: {status, connected, home?(), shared: {checked, set(on)}, lock?: {label, checked, set},
//       keyboard: {checked, set}, drive: {label, checked, set}, driven?: {label, checked, set},
//       popup: {checked, set}, screen: [{label, checked, set}], clipboard: {checked, set},
//       sound: {checked, set}, drag: {checked, set}, shortcuts: {label, checked, set},
//       found: [{label, click}], byAddress(), lookAgain(), again?: {label, click},
//       disconnect?: {label, click}, update?: {label, click}, open(), log(), quit()}
'use strict';

const check = (label, o) => ({ label, type: 'checkbox', checked: !!o.checked, click: (i) => o.set(i.checked) });
const sep = { type: 'separator' };

function connectTo(m) {
  return {
    label: 'Connect To',
    submenu: [
      ...(m.found.length ? m.found : [{ label: 'Nobody nearby', enabled: false }]),
      sep,
      { label: 'Connect by Address…', click: m.byAddress },
      { label: 'Look Again', click: m.lookAgain },
    ],
  };
}

function template(m) {
  const status = { label: m.status, enabled: false };
  if (!m.connected) {
    return [status, ...(m.again ? [m.again] : []), connectTo(m), sep, { label: 'Open TwinDesk…', click: m.open }, { label: 'Quit TwinDesk', click: m.quit }];
  }
  return [
    status,
    ...(m.home ? [{ label: 'Bring Mouse and Keyboard Back', click: m.home }] : []),
    check('Cursor Sharing', m.shared),
    sep,
    {
      label: 'Mouse and Keyboard',
      submenu: [
        check('Share Keyboard', m.keyboard),
        ...(m.lock ? [check(m.lock.label, m.lock)] : []),
        sep,
        check(m.drive.label, m.drive),
        ...(m.driven ? [check(m.driven.label, m.driven)] : []),
        sep,
        check('Show a Popup When Switching', m.popup),
      ],
    },
    { label: 'Screen', submenu: m.screen.map((x) => check(x.label, x)) },
    { label: 'Clipboard and Sound', submenu: [check('Share Clipboard', m.clipboard), check('Send Sound', m.sound)] },
    { label: 'Files', submenu: [check('Drag Files Across the Screen Edge', m.drag), check(m.shortcuts.label, m.shortcuts)] },
    { label: 'Connection', submenu: [...(m.disconnect ? [m.disconnect, sep] : []), connectTo(m)] },
    sep,
    ...(m.update ? [m.update] : []),
    { label: 'Open TwinDesk…', click: m.open },
    { label: 'Open Log Folder', click: m.log },
    { label: 'Quit TwinDesk', click: m.quit },
  ];
}





// __zhMenu: 中文菜单标签（非官方翻译层）
const __ZH_MENU = {"Connect To":"连接到","Nobody nearby":"附近没有设备","Connect by Address…":"按地址连接…","Look Again":"重新查找","Open TwinDesk…":"打开 TwinDesk…","Quit TwinDesk":"退出 TwinDesk","Bring Mouse and Keyboard Back":"恢复鼠标和键盘控制","Cursor Sharing":"光标共享","Mouse and Keyboard":"鼠标和键盘","Share Keyboard":"共享键盘","Show a Popup When Switching":"切换时显示提示","Screen":"屏幕","Mirror":"镜像","Extend":"扩展","Off":"关闭","Share Screen":"共享屏幕","Receive Screen":"接收屏幕","Clipboard and Sound":"剪贴板与声音","Share Clipboard":"共享剪贴板","Send Sound":"发送声音","Files":"文件","Drag Files Across the Screen Edge":"跨屏幕边缘拖拽文件","Connection":"连接","Open Log Folder":"打开日志文件夹","Disconnect":"断开连接","Forget":"取消配对","Connect":"连接","Reconnect":"重新连接","Paired":"已配对","Not paired":"未配对","Connected":"已连接","Not connected":"未连接"};
const __ZH_RULES = [["^Connected to (.+)$","已连接到 $1"],["^Lock Cursor on (.+?) \\((.+)\\)$","将光标锁定在 $1（$2）"],["^Use Mouse and Keyboard on (.+)$","在 $1 上使用鼠标和键盘"],["^Let (.+?) Control (.+)$","允许 $1 控制 $2"],["^Copy and Paste Files \\((.+)\\)$","复制粘贴文件（$1）"],["^Take Over (.+)$","接管 $1"],["^Connect to (.+)$","连接到 $1"],["^Disconnect (.+)$","断开与 $1 的连接"],["^Download TwinDesk (.+)$","下载 TwinDesk $1"],["^Paired with (.+)$","已与 $1 配对"]].map((r) => [new RegExp(r[0]), r[1]]);
const __zhLabel = (s) => {
  if (typeof s !== 'string') return s;
  if (__ZH_MENU[s]) return __ZH_MENU[s];
  for (const [re, rep] of __ZH_RULES) { if (re.test(s)) return s.replace(re, rep); }
  return s;
};
const __zhMenu = (items) => (items || []).map((it) => {
  const o = Object.assign({}, it);
  if (typeof o.label === 'string') o.label = __zhLabel(o.label);
  if (Array.isArray(o.submenu)) o.submenu = __zhMenu(o.submenu);
  return o;
});
module.exports = { template: (m) => __zhMenu(template(m)) };
