# macOS 使用说明

## 安装

双击 `dsh-purge-1.1.72-macos.1.pkg`，按安装器提示完成。安装器会通过 DeepSeek Harness 自带的插件管理器写入 `desktop` profile，然后重新打开应用。

## 第一次使用

1. 打开 DeepSeek Harness。
2. 点击输入框附近的 `dsh-purge` 按钮。
3. 在“清洗”页点击一次“应用”。
4. 出现重启提示时选择“现在重启”。
5. 重启后再次打开面板，确认版本显示 `v1.1.72-macos.1`。

启动阶段不会自动扫描整个用户目录，也不会自动重写宿主文件。更新 Harness 后如果补丁显示“待处理”，再手动点击一次“应用”。

## 卡住或打不开时

打开“终端”，运行：

```sh
dsh-harness-restart
```

该命令只停止 DeepSeek Harness 的残留主进程和 Host 进程，然后重新打开应用；不会删除会话、邮箱或插件配置。

## 扫描范围

macOS 桌面模式只处理当前 `/Applications/DeepSeek Harness.app` 内的宿主包，以及显式配置的 `DSH_BASE`。默认不递归扫描 `$HOME`、外接盘或已挂载 DMG。

如确实要让桌面进程同时寻找 Web/CLI 宿主，可在启动前设置：

```sh
export DSH_PURGE_INCLUDE_WEB_HOST=1
```

日常桌面使用不要设置这个变量。
