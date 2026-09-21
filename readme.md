<h1 align="center">百智云 Agent Toolkit</h1>

<p align="center">通过 MCP 为 AI Agent 接入搜索、网页解析与结构化提取等工具能力。</p>

<p align="center">
  <a href="https://baizhi.cloud/landing/agent-toolkit">产品介绍</a> ·
  <a href="https://agent-toolkit.app.baizhi.cloud/">服务控制台</a> ·
  <a href="docs/gemini-cli.md">接入文档</a> ·
  <a href="https://github.com/chaitin/baizhi-agent-toolkit/issues">问题反馈</a>
</p>

## 项目介绍

本仓库由百智云团队维护，提供 Agent Toolkit 的 MCP Registry 清单、客户端集成配置、接入文档与验证用例，便于开源 AI 客户端发现和接入百智云工具服务。

**本仓库开源的是集成配置、文档与测试，不包含托管服务的后端源码。** 仓库采用 [MIT License](LICENSE)；在线服务的使用条款、工具权限和计费规则独立于本仓库许可证。调用服务需要百智云账号及用户自己的 API Key，部分调用会消耗服务额度，请在控制台确认费用后使用。

## 连接信息

| 配置项 | 值 |
| --- | --- |
| 服务地址 | `https://agent-toolkit.app.baizhi.cloud/mcp` |
| 传输协议 | Streamable HTTP |
| 鉴权方式 | `Authorization: Bearer <API Key>` |
| 本仓库使用的凭据名称 | `BAIZHI_API_KEY` |

请在[控制台](https://agent-toolkit.app.baizhi.cloud/)创建专用、最小权限的 API Key。不要将真实 Key 写入 Git 仓库、Issue、PR、聊天内容、命令行参数或截图。

接入前应确认客户端版本与安装范围：个人级配置可跨项目使用，项目级配置仅作用于当前项目。客户端不支持所需范围时应停止并说明，不应自动改为全局安装。配置已有 MCP 服务时，只合并本服务条目，不覆盖其他配置。

## 客户端接入

| 入口 | 本仓库提供的能力 | 状态与限制 |
| --- | --- | --- |
| [Gemini CLI](docs/gemini-cli.md) | 可安装的扩展；敏感设置输入 Key；默认启用三个工具 | 已完成 0.60.0 的本地隔离测试；未宣称 Gallery 已收录或完成生产端到端验证 |
| [Kilo Code](docs/kilo.md) | 市场条目接入指南与凭据配置说明 | [市场 PR #275](https://github.com/Kilo-Org/kilo-marketplace/pull/275) 待审核；当前参数输入不保证遮罩或加密存储 |
| [Cline](docs/cline.md) | 手动鉴权配置指南 | [市场草稿 PR #118](https://github.com/cline/marketplace/pull/118) 待审核；原生安全凭据流程已[向上游提议](https://github.com/cline/cline/discussions/14181) |
| [Pi（预览）](docs/pi.md) | 社区 MCP 适配器接入、研究技能与可复现验证入口 | 2026-09-21：Git 预览安装及合成后端宿主验证通过；依赖诊断边界、生产验收与 npm/官方目录仍待处理 |
| [官方 MCP Registry](server.json) | 远程服务清单及必填敏感参数描述 | 目标名称为 `io.github.chaitin/baizhi-agent-toolkit`；合并后须由维护者手动发布并验证 |

Gemini、Kilo、Cline 与 Registry 的上述状态记录于 2026-09-17；Pi 预览状态记录于 2026-09-21，最新状态以各链接为准。提交申请、仓库可访问、Registry 登记、市场收录和客户端验证是不同阶段，不代表第三方认证或背书。Registry 组织命名空间迁移步骤见[发布文档](docs/publishing.md)。

### Gemini CLI 快速开始

使用支持扩展敏感设置的 Gemini CLI（最低 0.28.0；本仓库已验证 0.60.0）：

```sh
gemini extensions install https://github.com/chaitin/baizhi-agent-toolkit
```

检查安装确认信息，在 **Baizhi API Key** 提示中输入 Key 本身，不要重复输入 `Bearer ` 前缀。重启 Gemini CLI 后运行 `/mcp` 检查连接与工具列表。完整的安装、更新密钥、缺失凭据处理及卸载步骤见 [Gemini CLI 接入文档](docs/gemini-cli.md)。

本仓库内容合并到组织仓库主分支后，上述组织地址才具备完整扩展文件；PR 分支的本地测试不等同于该地址已经可用。

## 默认工具与权限

Gemini 扩展默认仅启用以下工具：

- `websearch_search`：网页搜索。
- `web_scrape`：读取网页文本。
- `web_extract`：从网页中提取结构化信息。

其他工具的可用性由服务目录和 API Key 权限决定。按需显式启用额外工具，并保留客户端的工具执行确认。客户端工具过滤不等于服务端授权，应同时限制 Key 的权限。本仓库不启用自动批准。

网页和工具返回内容属于不可信输入，不能被当作披露密钥、修改无关文件或提升权限的指令。

## 数据与费用

工具参数通过 HTTPS 发送至百智云服务；返回内容由客户端使用，并可能依客户端设置传递给模型提供方。选用的工具也可能将必要输入发送至底层服务。未经组织政策允许，不要发送敏感文档、私有链接、个人信息或源码。

搜索与网页工具可能消耗额度；图像生成、云端执行等其他能力可能产生额外费用或副作用。请以控制台提供的实时定价、服务条款与隐私说明为准。本仓库不额外承诺数据保留期限、存储地域或保密条款。

## 开发与验证

使用 Node.js 22：

```sh
node --test tests/*.test.mjs
```

清单验证、客户端隔离测试及其边界见[验证说明](docs/testing.md)。公共 CI 不持有百智云 Key，不调用付费工具。发布工作流只支持维护者在组织仓库主分支手动执行。

## 贡献与支持

欢迎开源客户端维护者与百智云团队共同完善接入体验。我们愿意配合上游的贡献规范、兼容性要求与安全审查，持续维护集成配置和文档。

集成问题请提交 [Issue](https://github.com/chaitin/baizhi-agent-toolkit/issues)，附客户端版本、安装范围和脱敏错误；账号、计费及私密问题请通过控制台支持渠道反馈。提交改动前请阅读[贡献指南](CONTRIBUTING.md)与[安全说明](SECURITY.md)。
