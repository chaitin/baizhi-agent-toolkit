# Kilo Code

The marketplace contribution adds **Baizhi Cloud Agent Toolkit** with a required `BAIZHI_API_KEY` parameter. Marketplace availability depends on upstream review; a submitted PR is not an accepted listing.

## Once the listing is available

1. Open Kilo's marketplace and select **Baizhi Cloud Agent Toolkit**.
2. The entry uses **Streamable HTTP**. If a method selector is shown, select that method.
3. Open the [Baizhi Cloud console](https://agent-toolkit.app.baizhi.cloud/), sign in and create a key scoped to the tools you need.
4. Enter only that key in **Baizhi Cloud API Key**, without the `Bearer` prefix. Choose the client-supported installation scope deliberately.
5. Review the resulting MCP configuration and connect. Keep tool approval enabled and initially enable only `websearch_search`, `web_scrape` and `web_extract` if tool filtering is available in your client version.
6. Check tool discovery, then approve a small search or public-page request. Calls may consume service credits.

The marketplace template supplies the `Bearer` prefix. The generated connection is native HTTP; no `npx` command, local server or Docker container is installed.

## Credential safety

The current marketplace parameter field is ordinary visible text, not a masked password field. It does not promise keychain or encrypted storage. With an open workspace, the install modal defaults to project scope, so review the scope selector before installing. A project-level MCP file can contain the resolved header: do not commit it. Prefer private user-level configuration for the secret-bearing connection when that scope is appropriate; never change scope silently. Keep file permissions restrictive and remove secrets before sharing configuration or logs.

For the Kilo backend reviewed on 2026-09-16 at [revision b3adda2159](https://github.com/Kilo-Org/kilocode/tree/b3adda2159b9223323bb7479eff760112f2f8347), an environment-backed option is available:

1. Supply `BAIZHI_API_KEY` to the Kilo backend process through your own secret manager or private launch environment. Do not put a real key in a shared shell script or command history.
2. Deliberately select **Global** installation scope.
3. Enter the literal text `{env:BAIZHI_API_KEY}` in the marketplace's API Key field. The stored header becomes `Bearer {env:BAIZHI_API_KEY}`, not the secret itself.
4. Restart the backend with that environment and verify the connection.

This syntax is accepted for trusted/global configuration, but **current project configuration rejects MCP headers containing environment/file references and skips the server**. Do not choose project scope for this recipe. If project-only installation is required, stop and decide how to protect its local credential configuration; do not silently change to global.

New configuration defaults in that backend are `.kilo/kilo.jsonc` for a project and `~/.config/kilo/kilo.jsonc` for user/global scope; existing supported files can take precedence. Other releases and the older VS Code extension can differ. Check your installed version rather than assuming this path or `${VAR}` / `${env:VAR}` syntax applies.

The linked repository contains integration files, not the hosted backend. Service credits and terms are separate from this repository's MIT license. See the [README](../readme.md) for data handling and costs.

## Troubleshooting and removal

- `401` / `403`: verify the key, expiry and service permissions; do not paste the credential into an issue.
- No tools: check the network endpoint, key permissions and client-selected tools; reconnect after changing configuration.
- Billing errors: check the console's balance and the selected tool's pricing.
- To disconnect: disable or remove this MCP entry in Kilo. Revoke the dedicated key in the console if it is no longer needed.
