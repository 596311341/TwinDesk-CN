# 版权与修改说明

## 上游

- 项目：TwinDesk
- 作者：inukaasith（及贡献者）
- 许可证：GNU General Public License v3.0
- 仓库：https://github.com/InukaAsith/TwinDesk

本仓库的分发内容基于 TwinDesk v2.4.0。

## 本仓库的修改

1. 新增 `windows/i18n-zh.js`：简体中文运行时翻译层（字典 + DOM 文本替换）。
2. 修改若干 HTML 文件，在 `<head>` 中引入上述脚本。
3. 修改 `shared/traymenu.js`：托盘菜单标签中文化。
4. 修改 `windows/ipc.js`：文件对话框标题中文化。
5. Android：替换 APK 内 `classes2.dex` 的界面字符串字面量，并用自有密钥重新签名。

以上修改不改变程序逻辑，仅涉及界面文字。

## 分发说明

- 本仓库按 GPL-3.0 分发修改后的成果，并保留原始版权声明。
- 修改后的 Windows 程序以解包形式提供（`resources/app` 内为可读的 JS/HTML），可自行查看与再修改。
- Android 版的构建方法见 `android/README.md`，可据此复现。
- 本项目与上游作者无隶属关系，"TwinDesk" 名称与图标版权归原作者所有。
