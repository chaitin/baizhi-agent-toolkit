# Validation scope

Tests distinguish metadata validation, client behavior and live service behavior. Passing one does not establish the others. Use Node.js 22 for repository checks.

## Reproducible checks

```sh
node --test tests/*.test.mjs
mcp-publisher validate server.json
```

The Node tests use dummy values only. The official Publisher validator can contact the official Registry to validate the public metadata; it receives no API key. Public CI does not call paid Baizhi Cloud tools.

The default suite contains 22 checks: manifest invariants, positive/negative Registry read-back fixtures, publication workflow boundaries and local Markdown links. The workflow tests are explicit textual regression guards, not a full GitHub Actions interpreter. The optional Gemini test requires a separate pinned CLI installation and is not part of this default suite.

On 2026-09-17, the organization migration candidate passed all 22 checks, official `mcp-publisher v1.8.1 validate server.json`, and the optional Gemini CLI 0.60.0 test on Node.js 22.22.2. This rerun used only a synthetic key and localhost transport; the organization Registry entry has not been published by these checks.

After the initial merge, a separate isolated API harness verified Gemini CLI 0.60.0's actual GitHub URL installer against the organization repository and checked the installed Git HEAD against `a643da3396721375132005f71227ff0f24d823b6`. Random synthetic sensitive-setting input, encrypted storage and a fresh-process reload passed. This was not a full interactive terminal/UI test, a Gallery check, or an authenticated production MCP/model test; see the [recorded scope](gemini-verification.md#official-organization-url-installation-2026-09-17).

Before a release, also run each marketplace's own validator/generator and compare generated entries with the intended source. Validate the extension using the supported Gemini CLI version and its real settings/connection code in an isolated test environment.

## Release checks

- Confirm the URL and authentication mechanism agree across manifests.
- Confirm no real credentials, access tokens or session files appear in Git history or release archives.
- Verify missing or invalid keys do not become an unauthenticated success claim.
- Check that required secret prompts and template expansion actually work in each target client, not only in our own test code.
- Distinguish mock-server checks from authenticated tests against the hosted service.
- Record client version, selected tools, connection result and any untested platforms.
- Never claim all tools or all clients were tested on the basis of a single MCP handshake.

The service's unauthenticated initialization endpoint returned HTTP 401 during the 2026-09-16 integration work. A previous same-day Hermes-specific test discovered tools and called the three starting tools, but that is not an end-to-end test of Kilo, Cline or Gemini CLI.

Gemini CLI 0.60.0's actual installer, secret reload and HTTP transport passed isolated tests with a dummy credential and a local MCP fixture. See [the detailed evidence and reproduction steps](gemini-verification.md). Kilo's entry passed its three marketplace generators and template checks; its installer behavior was source-reviewed. Cline's entry passed the 203-entry catalog validation and six source-backed parser checks, which also established its missing native credential flow. None of these claims implies authenticated production testing in all three clients.
