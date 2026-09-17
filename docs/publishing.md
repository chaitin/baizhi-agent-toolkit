# 发布与组织命名空间迁移

本仓库的目标 Registry 名称为 `io.github.chaitin/baizhi-agent-toolkit`，对应 GitHub 组织 `chaitin`。这不是 `baizhi.cloud` 域名所有权认证，也不代表 Registry 或客户端对服务作出认证。

`server.json` 的 `websiteUrl` 指向本集成仓库。清单有意省略可选的 `repository` 字段：该字段用于服务实现源码，本仓库不是托管服务的后端源码。

## 发布前检查

1. 审查服务地址、命名空间、版本、凭据占位符、文档及测试结果。
2. 执行 `node --test tests/*.test.mjs`。
3. 使用官方 `mcp-publisher v1.8.1` 执行 `mcp-publisher validate server.json`。验证会访问官方 Registry，不需要百智云 Key。
4. 确认拟发布版本已合并到组织仓库 `main`，且验证工作流通过。
5. 确认组织允许该仓库运行 GitHub Actions 和签发 OIDC token；按组织策略设置发布权限或审批规则。

## 官方 MCP Registry

在组织仓库的 Actions 页面手动运行 **Publish MCP Registry**，选择 `main`：

- 仅允许 `chaitin/baizhi-agent-toolkit` 的 `refs/heads/main` 执行发布；Fork 和 PR 不会发布。
- 使用固定提交版本的 Actions，以及固定版本、校验 SHA-256 的官方 Publisher。
- 使用 GitHub Actions OIDC 获取短期凭据，不保存 GitHub PAT 或百智云 API Key。
- 发布前运行测试和官方清单验证；发布后回读准确的名称与版本，校验状态、服务地址和鉴权模板与本地清单一致。
- 若发布后的回读失败，应先核对 Registry 实际状态。发布可能已经成功，不要盲目重复发布或将失败误认为没有写入。

也可手动执行只读回读校验：

```sh
node scripts/verify-registry.mjs
```

命令只读取公开 Registry，不发起 MCP 工具调用。版本号描述本集成清单版本，不能替代托管服务或工具目录版本。修改已发布的集成内容时，按 Registry 版本规则更新版本并重新验证。

Registry 元数据为公开信息，适用其 CC0 条款，不得包含凭据。发布不保证下游立即收录。参见[官方认证说明](https://modelcontextprotocol.io/registry/authentication)与[服务条款](https://modelcontextprotocol.io/registry/terms-of-service)。

## 从个人命名空间迁移

迁移来源为 [ct-jaryn/baizhi-agent-toolkit](https://github.com/ct-jaryn/baizhi-agent-toolkit)，已公开版本为 `io.github.ct-jaryn/baizhi-agent-toolkit@0.1.0`。本次通过 Fork PR 迁入集成文件，不是 GitHub 仓库转移，也不是 Registry 原地改名，因此不会自动创建旧地址重定向。

按以下顺序执行：

1. 合并并验证组织仓库的集成文件。
2. 在组织仓库手动发布 `io.github.chaitin/baizhi-agent-toolkit@0.1.0`，回读确认 `active`、版本、URL 和鉴权字段。
3. 验证组织仓库 URL 安装、凭据设置与工具发现，记录客户端版本和实际测试范围；仅元数据验证不等于生产连接验证。
4. 更新个人仓库迁移提示和下游市场 PR 的链接；需要 Gallery 发现时，在组织仓库设置 `gemini-cli-extension` topic，并单独核查收录结果。
5. 在确认新入口可用后，由拥有旧命名空间权限的维护者将旧版本标记为 `deprecated`，明确指出新名称。组织仓库的 OIDC 身份不能修改个人命名空间。
6. 停止旧仓库后续发布，保留历史与迁移说明，不删除旧条目或历史版本。

初始集成已通过 [PR #1](https://github.com/chaitin/baizhi-agent-toolkit/pull/1) 合并至组织仓库。合并不会自动发布 Registry 或停用旧条目；发布和迁移仍需按上述顺序独立验收。公司仓库地址可用于后续贡献与接入说明；在新 Registry 条目核验前，不将旧条目标记为弃用。首次发布新名称时可以使用 `0.1.0`，但不得覆盖旧名称下的已发布元数据。

官方参考：[GitHub OIDC 鉴权实现](https://github.com/modelcontextprotocol/registry/blob/main/internal/api/handlers/v0/auth/github_oidc.go)、[Publisher 命令](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/cli/commands.md)。

## Gemini CLI、Kilo 与 Cline

Gemini 扩展清单位于仓库根目录。Gallery 按其规则发现并验证仓库；增加 topic 是提交入口，不是收录证明。参见 [Gemini 发布指南](https://geminicli.com/docs/extensions/releasing/)。

Kilo 与 Cline 的市场提交应保持最小改动，明确服务归属、API Key 要求、费用、安全边界与测试证据。分别记录已提交、待审核、已合并和客户端验证状态，不设置未经上游确认的认证标志。
