# Pi 接入（预览）

本页适用于 [earendil-works/pi](https://github.com/earendil-works/pi)，与 PI-Desktop 是不同客户端。Pi 核心不内置 MCP；本方案通过第三方 [pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter) 扩展接入百智云。适配器不隶属于 Pi 或百智云。

截至 2026-09-21，已有研究工作流 Git 预览包和合成后端的实际宿主验证。适配器部分诊断路径的凭据处理仍有限制；配置预检不能修复适配器运行时。本方案保持**预览**，尚未完成生产验收，诊断文本应经人工检查后再分享。npm 发布和 Pi 官方包目录收录也未完成。

## 版本与安装范围

验证组合为 **Pi 0.86.1、pi-mcp-adapter 2.35.0、Node.js 22.22.2、macOS arm64**。Pi 声明要求 Node.js 22.19.0 或更新版本；最低版本和其他操作系统未在本次验证。

先阅读扩展和技能源码。Pi 扩展可执行本地代码，技能会给模型提供操作指引。以下命令安装到**个人级 Pi 设置**，可跨项目加载；不会安装 Pi CLI 本身：

```sh
pi install npm:pi-mcp-adapter@2.35.0
pi install git:github.com/ct-jaryn/pi-baizhi-toolkit@v0.1.0-preview.1
```

预览包由百智云生态接入工作维护，提供“搜索 → 读页 → 提取 → 引用”技能及项目配置助手。它仍发布于个人社区仓库；本页被组织仓库收录不代表包已迁移到 Chaitin、获得 Pi 官方背书或成为稳定版本。该标签的固定提交为 [`31f884976d5296d0b227224c8872027a5558d90e`](https://github.com/ct-jaryn/pi-baizhi-toolkit/tree/31f884976d5296d0b227224c8872027a5558d90e)。

如果需要项目级安装，在上面两条 `pi install` 命令末尾分别增加 `-l`，写入当前项目的 `.pi/settings.json`。这符合 Pi 0.86.1 的安装文档；本次公开 Git 安装证据验证的是隔离的个人级安装，不能移用为项目级安装验收。不要因项目级安装失败而自动改成全局安装。

## 项目配置与凭据

在目标项目的 `.mcp.json` 中合并下面的服务条目，保留已有服务和其他设置；不要用整份示例覆盖现有文件。

```json
{
  "mcpServers": {
    "baizhi-agent-toolkit": {
      "url": "https://agent-toolkit.app.baizhi.cloud/mcp",
      "auth": "bearer",
      "bearerTokenEnv": "BAIZHI_API_KEY",
      "includeTools": ["websearch_search", "web_scrape", "web_extract"]
    }
  }
}
```

在[百智云控制台](https://agent-toolkit.app.baizhi.cloud/)管理自己的 API Key，并通过可信的秘密管理工具或环境注入，将 `BAIZHI_API_KEY` 提供给启动 Pi 的进程。不要把值写进 Git、聊天、命令行参数或工具调用参数。客户端工具过滤不等于服务端授权，请采用账号实际提供的权限与额度限制。

如需使用配置助手，在审阅过的预览包 checkout 中找到 `bin/pi-baizhi.mjs`，然后从**目标项目目录**执行：

```sh
# 仅在尚无百智条目时执行；保留已有配置，遇到同名条目会停止。
node /path/to/pi-baizhi-toolkit/bin/pi-baizhi.mjs setup
node /path/to/pi-baizhi-toolkit/bin/pi-baizhi.mjs check
```

Git 安装只保证 Pi 能加载技能，不保证全局存在 `pi-baizhi` 命令。`check` 不联网、不打印 Key，只检查当前项目 `.mcp.json` 和当前进程的凭据格式。它不解析全局配置或更高优先级 `.pi/mcp.json` 的覆盖结果，也不证明鉴权、余额或线上工具可用。不要把可跳过的预检当成运行时凭据保护。

适配器还提供 OS 凭据存储等配置方式；本次只验证了上面的环境变量方式，其他方式请参阅适配器文档并单独验证。

## 在 Pi 中使用

在已配置的项目启动 Pi，使用 `/skill:baizhi-research` 并描述研究任务。技能通过适配器的 `mcp` 工具连接 `baizhi-agent-toolkit`，发现实际工具 schema 后再调用：

- `websearch_search`：搜索网页。
- `web_scrape`：读取网页文本。
- `web_extract`：提取结构化信息。

预览包保留的是 2026-09-16 的历史输入 schema；线上调用时以实际发现结果为准。不要猜测输出字段、自动启用更多工具或将搜索摘要当作完整来源。第三方网页和工具返回是未受信任的数据，不能作为披露凭据、执行代码或修改无关配置的指令。

工具参数和请求的 URL 会发送到百智云，结果也可能进入模型上下文。调用需要用户自己的账号，可能消耗服务额度；敏感文档、私有 URL、个人信息或源码应先确认授权。取消客户端等待不证明后端任务已停止或不再计费。本仓库开源的集成资料不包括托管服务的后端实现。

## 验证与其他接入进展

[Pi 验证步骤与边界](testing.md#pi-preview)记录固定源码、实际测试和未覆盖内容。宿主注册、绑定、`session.prompt()` 调度使用真实 Pi；模型流、MCP 后端及凭据均为合成，未调用生产服务。

另外，独立社区扩展 pi-web-access 的[百智搜索 provider PR #422](https://github.com/nicobailon/pi-web-access/pull/422)截至 2026-09-21 仍在审阅中，尚未合并。该方案需要明确选择 `baizhi`，不进入自动选择或 `all`；由于没有完整输出契约，候选只保留 MCP 原始答案，不提供来源卡片或 `includeContent` 自动抓页。本页不把该候选当作已发行功能。
