# Android 汉化说明

Android 版没有使用系统语言资源，界面文字以 `const-string` 字面量编译进 `classes2.dex`，
所以汉化方式是：反编译 → 替换字符串 → 回编译 → 重新签名。

## 准备

- [apktool](https://github.com/iBotPeaches/Apktool/releases) 2.11.1（需要 JDK 17+）
- Android SDK build-tools（`zipalign`、`apksigner`）
- 官方 APK：`TwinDesk-2.4.0-full.apk`（也可从 Windows 版 `resources/app/windows/vendor/twindesk-android-full.apk` 取）

## 步骤

```bash
# 1. 反编译
java -jar apktool.jar d TwinDesk-2.4.0-full.apk -o decoded

# 2. 修改字符串
#    目标文件：decoded/smali_classes2/com/twindesk/android/**/*.smali
#    只替换界面文案对应的 const-string，例如：
#      const-string v0, "Connected to "   ->   const-string v0, "已连接到 "

# 3. 回编译
java -jar apktool.jar b decoded -o out-unsigned.apk

# 4. 对齐
zipalign -f -p 4 out-unsigned.apk out-aligned.apk

# 5. 签名（keytool 生成自己的密钥，不要公开私钥）
keytool -genkeypair -keystore my.keystore -alias tw -keyalg RSA -keysize 2048 \
        -validity 10000 -storepass <密码> -keypass <密码> -dname "CN=TwinDesk CN"
apksigner sign --ks my.keystore --ks-pass pass:<密码> --key-pass pass:<密码> \
        --out TwinDesk-中文版.apk out-aligned.apk
```

## 注意事项

- 包名仍为 `com.twindesk.android`，但签名不同：手机上必须先卸载官方版才能安装，配对信息会丢失。
- 不要公开自己的签名密钥（keystore）；一旦泄露，别人可以伪造更新包。
- 升级官方版本后需重新做一遍，因为字符串在 dex 里，不在资源表中。

## 已汉化的范围

主界面（概览/屏幕/光标/文件/更多）、配对引导、权限申请、以及全部二级页面：
通话、信息、照片、文件访问、键盘、远程、剪贴板、通知、声音、相机、常规。
