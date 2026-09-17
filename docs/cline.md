# Cline

**Current limitation:** the marketplace's `install.env` metadata is setup guidance, not a consistent masked-key prompt or automatic environment-to-header binding. A catalog entry that installs only the endpoint is not an authenticated connection. We have requested the native credential flow in [Cline discussion #14181](https://github.com/cline/cline/discussions/14181); its implementation requires maintainer agreement.

The marketplace submission is an interim manual-setup entry, with `verified` and `featured` false. It contains neither a real key nor a nonfunctional header placeholder. Do not treat a draft PR as an available listing.

## Manual setup in a private local configuration

1. Create a least-privilege API key in the [Baizhi Cloud console](https://agent-toolkit.app.baizhi.cloud/).
2. Open **Cline's MCP settings** through your installed client's interface. Confirm the active configuration path and scope. Do not overwrite existing servers.
3. Merge only the following `baizhi-agent-toolkit` entry. Keep it disabled while editing. These examples intentionally contain a nonworking placeholder.
4. Replace the placeholder locally, outside chat and outside version control. The header requires `Bearer`, a space, and the key. Store only in a private local configuration; this is plaintext storage, not an encrypted vault.
5. Save, then enable the server in Cline. Verify tool discovery and approve a small search/public-page call; usage may consume service credits. Keep tool approval enabled and enable only tools you intend to use.

Current SDK configuration shape:

```json
{
  "mcpServers": {
    "baizhi-agent-toolkit": {
      "disabled": true,
      "transport": {
        "type": "streamableHttp",
        "url": "https://agent-toolkit.app.baizhi.cloud/mcp",
        "headers": {
          "Authorization": "Bearer REPLACE_WITH_YOUR_BAIZHI_API_KEY"
        }
      }
    }
  }
}
```

Older VS Code extension flat configuration shape:

```json
{
  "mcpServers": {
    "baizhi-agent-toolkit": {
      "disabled": true,
      "type": "streamableHttp",
      "url": "https://agent-toolkit.app.baizhi.cloud/mcp",
      "headers": {
        "Authorization": "Bearer REPLACE_WITH_YOUR_BAIZHI_API_KEY"
      }
    }
  }
}
```

Do not combine the two shapes. These examples were checked on 2026-09-16 against [source revision 15f001ad0b](https://github.com/cline/cline/tree/15f001ad0b1992965112fc3158f45ec6d2cb090d); match the schema your installed client actually uses. Its default SDK path is `~/.cline/data/settings/cline_mcp_settings.json`, but environment overrides, migrations and older VS Code versions can use other locations. Opening the active file through the client is preferable to guessing a path.

Setting `BAIZHI_API_KEY` in your shell alone does **not** configure these current SDK headers. Do not insert `${BAIZHI_API_KEY}` or `${env:BAIZHI_API_KEY}` and assume all Cline clients interpolate it. Do not pass the key with `--header` on a command line: it could enter shell history, process arguments or logs.

If your policy forbids plaintext local header storage, do not install this interim configuration. Wait for the agreed credential-store/reference solution or use a client with supported secret storage. No automatic fallback to global configuration is performed by these instructions.

To remove access, disable/delete this MCP entry and revoke the dedicated key in the Baizhi console. Never send a complete MCP settings file or authorization header in a public issue.

## Verification status

Catalog validation and source-backed offline parser tests passed. They explicitly confirm that the current parser leaves header variables literal. No authenticated end-to-end Cline connection is claimed. The proposed native flow includes required-value validation, masked input, private credential handling and mock-server tests across supported clients.
