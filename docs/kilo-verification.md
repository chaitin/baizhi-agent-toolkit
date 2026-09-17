# Kilo implementation verification

Verified on 2026-09-17 with Node.js 22.22.2 against [Kilo source revision b3adda2159b9223323bb7479eff760112f2f8347](https://github.com/Kilo-Org/kilocode/tree/b3adda2159b9223323bb7479eff760112f2f8347), using the Agent Toolkit entry proposed in [marketplace PR #275](https://github.com/Kilo-Org/kilo-marketplace/pull/275).

This is an isolated component and pure-function execution test, not merely a text search of source code, but also not a complete installed-client test. The upstream TypeScript/TSX files were compiled without logic edits. The test used the real Solid runtime and a DOM implementation; UI primitives, application contexts and the VS Code message bridge were test doubles. Only random synthetic values were used.

## Passed checks

| Original implementation | Observed behavior |
| --- | --- |
| `InstallModal` with a workspace | Project scope was the default. Empty and whitespace-only required input disabled the install button and sent no message. Nonempty input sent the chosen Streamable HTTP method, parameter and project scope. |
| `InstallModal` explicit scope | Selecting global preserved the chosen scope and the literal `{env:BAIZHI_API_KEY}` parameter in the install message. |
| `InstallModal` without a workspace | Global was the only available scope. |
| Backend `buildMcpEntry` | Produced a native remote entry for the intended endpoint, supplied the Bearer prefix, preserved exact synthetic values through JSON escaping, and added no local command. Literal environment references remained references at this stage. |
| `sanitizeProjectMcpHeaders` | Skipped the entry containing an environment reference with a warning, retained unrelated entries without mutating the input, and retained a direct-value entry. |

Sources: [installation component](https://github.com/Kilo-Org/kilocode/blob/b3adda2159b9223323bb7479eff760112f2f8347/packages/kilo-vscode/webview-ui/src/components/marketplace/InstallModal.tsx), [entry builder](https://github.com/Kilo-Org/kilocode/blob/b3adda2159b9223323bb7479eff760112f2f8347/packages/opencode/src/kilocode/marketplace/installer.ts), [project-header sanitizer](https://github.com/Kilo-Org/kilocode/blob/b3adda2159b9223323bb7479eff760112f2f8347/packages/opencode/src/kilocode/config/mcp-headers.ts).

The fixed-source SHA-256 values recorded by the harness were:

| Source file | SHA-256 |
| --- | --- |
| `InstallModal.tsx` | `09e00e4e77a4aa1ccb5b0b4b7ff637f4b14f5c666f5b903b6ea09a50ab07bd2c` |
| `installer.ts` | `f1dde38f45e0621b75492d9f943194a888d6d02d1e3979e9c47b3cbb3db6753a` |
| `mcp-headers.ts` | `fb2e515cec4f2522e22fe40522e6b7dd5cf7c316b301edb4f6ba22280fab2ad6` |

## Limits

- No VS Code extension host, complete backend service, persistent client configuration, global environment expansion, tool discovery or production MCP/model call was exercised.
- A simulated successful install response exercised the component's response handler only; it was not evidence of a real backend installation.
- JSON escaping tests establish preservation of template values, not acceptance of arbitrary characters by the HTTP transport or service.
- Because visual primitives were doubled, this runtime test does not independently validate the real widget's masking or secure storage. The credential warnings in the [Kilo guide](kilo.md) remain applicable.
- These optional local checks are separate from the repository's default CI suite. Marketplace acceptance and authenticated client verification remain pending.
