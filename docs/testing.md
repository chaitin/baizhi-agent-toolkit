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


<a id="pi-preview"></a>
## Pi preview: reproducible host verification

The [Pi guide](pi.md) uses the third-party adapter and an independently published
community research package. The immutable source for this verification is
[pi-baizhi-toolkit at `31f884976d5296d0b227224c8872027a5558d90e`](https://github.com/ct-jaryn/pi-baizhi-toolkit/tree/31f884976d5296d0b227224c8872027a5558d90e),
tag `v0.1.0-preview.1`. The organization repository documents that preview; it
does not rename, republish or transfer ownership of the package.

To reproduce the optional suite in a separate directory:

```sh
git clone https://github.com/ct-jaryn/pi-baizhi-toolkit.git
cd pi-baizhi-toolkit
git checkout --detach 31f884976d5296d0b227224c8872027a5558d90e
# Use Node.js 22.22.2. Dependency installation downloads public npm packages.
npm ci --ignore-scripts
npm test
```

On 2026-09-21, six configuration checks and six host scenarios passed on Node
22.22.2 / Pi 0.86.1 / pi-mcp-adapter 2.35.0, macOS arm64. The harness exercises
Pi's real CLI installation, resource discovery, extension binding,
`session.prompt()` and agent tool dispatch. It covers the three allowed tools,
a rejected fourth tool, incorrect/missing credentials, HTTP errors,
cancellation and disable/reload. The historical input schemas are explicitly
dated September 16; backend results are synthetic. See the pinned
[host evidence](https://github.com/ct-jaryn/pi-baizhi-toolkit/blob/31f884976d5296d0b227224c8872027a5558d90e/evidence/host-validation.json)
and [test log](https://github.com/ct-jaryn/pi-baizhi-toolkit/blob/31f884976d5296d0b227224c8872027a5558d90e/evidence/test.log).

The public Git tag was also installed through Pi 0.86.1 in a fresh isolated HOME
and agent directory: the resource loader discovered `baizhi-research`, with no
diagnostics, and Git installation omitted the package's development dependencies.
This verifies the personal-level installation shown in the guide, not a
separate project-level installation or an npm/gallery publication.

The model stream and stateless loopback MCP backend are simulated; test workers
use only synthetic credentials and reject non-loopback fetches. No live model,
Baizhi tool or service-credit call was made. Local shutdown/reload does not
prove termination of a remote stateful session or cancellation of backend work.

Known adapter diagnostic credential-handling limitations remain unresolved. The
passing cases do not prove redaction of every error, and the helper's optional
preflight is not a runtime fix. Keep this route marked as a preview. Production
authentication, live output/billing, OS credential storage, manual UI, other
operating systems and the minimum Node version are untested. npm publication
and official Pi gallery indexing remain separate pending steps.

This optional dependency-bearing host suite is not part of the organization's
default `node --test tests/*.test.mjs` checks. Those checks validate repository
invariants and documentation links, not Pi's runtime or the live service.
