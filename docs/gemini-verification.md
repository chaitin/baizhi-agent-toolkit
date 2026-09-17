# Gemini extension verification

Verified on 2026-09-16 with npm `@google/gemini-cli@0.60.0`, Node.js 22.22.2, macOS. No production API key was used.

The script-based checks were rerun successfully on 2026-09-17 for the organization migration candidate with the same CLI and Node.js versions. The separate terminal-installer evidence remains dated 2026-09-16.

## Passed

| Check | Evidence |
| --- | --- |
| Local installation | Gemini's actual `ExtensionManager.installOrUpdateExtension` installed version 0.1.0 and invoked exactly one sensitive setting request. |
| Terminal installer | Actual `gemini extensions install <local fixture> --consent` ran in a PTY, displayed the Baizhi API Key prompt, masked the synthetic input, and exited 0 with installation success. |
| Isolated secret storage | `GEMINI_CLI_HOME` pointed inside the test directory; `GEMINI_FORCE_FILE_STORAGE=true` bypassed the native keychain. The encrypted credential file had mode 0600; generated CLI files did not contain the test key in plaintext. |
| Reload and header substitution | A fresh `ExtensionManager` reloaded the saved key and resolved the manifest's `Authorization` value to the expected Bearer header. |
| Listing redaction | Gemini's actual extension listing formatter displayed `***` and did not include the test key. |
| Tool selection | Gemini's actual `isEnabled` filter accepted `websearch_search`, `web_scrape`, and `web_extract`; it rejected an unlisted tool. |
| HTTP transport | Gemini's actual `createTransport` sent a Streamable HTTP initialize request to a localhost fixture with the expected resolved Bearer header. |
| Missing key | With no setting and no environment variable, Gemini's manifest loader preserved the variable expression, then its transport expanded it to an empty value. The local HTTP fixture received a bare `Bearer` header. |

The install manifest was not modified for these checks. Only the transport test's in-memory endpoint was replaced with localhost. The test harness disabled Gemini's analytics configuration and forced encrypted file storage before importing the CLI code. No global Gemini installation or real-user credential storage was modified.

## Reproduce

Keep `gemini-extension.json`, `verify-gemini.mjs`, and a `runtime` directory together. Install the pinned package locally, then run the script with Node.js 22:

```sh
npm install --prefix runtime --ignore-scripts --no-audit --no-fund @google/gemini-cli@0.60.0
node verify-gemini.mjs
```

The script also accepts an explicit installed package directory as its first argument. It requires permission to bind a localhost port. It creates a fresh `test-state-*` directory beside itself and prints a JSON summary. The generated state contains a synthetic test key in encrypted storage, not a real credential.

The script reproduces the ExtensionManager, storage, reload, redaction, tool-filter and localhost transport checks. The separate terminal-installer row above records an earlier PTY test; the script does not itself automate that interactive CLI check. This optional integration test is not part of the dependency-free default CI suite.

The test intentionally pins 0.60.0 because it imports that release's bundled internal entry points. Review those import paths when upgrading the tested version. This is a version-specific integration test, not a promised public Gemini library API.

Installing with `--ignore-scripts` left an optional `node-pty` native binary unavailable in this test environment. The terminal CLI printed that diagnostic, then successfully displayed the prompt and installed the extension. No terminal execution feature was tested.

## Limits

- No authenticated call was made to Baizhi's production MCP service; no Gemini model interaction was performed.
- The native OS keychain backend was inspected in official release source, not exercised with a real or fake user keychain entry.
- The test proves the client's configuration and transport behavior, not server-side authorization, quota, billing, or tool execution.
- Gemini's missing-setting warning does not block installation or guarantee no outgoing request. The hosted server must reject unauthenticated requests.
- The official extension settings minimum is 0.28.0; the executable test matrix covers 0.60.0 only.
- GitHub URL installation and gallery visibility depend on repository publication and external indexing; the local test does not claim either completed.

## Official references

- [Extension settings announcement and minimum version](https://developers.googleblog.com/making-gemini-cli-extensions-easier-to-use/)
- [Extension manifest and settings](https://geminicli.com/docs/extensions/reference/)
- [MCP transport, headers, and tool filtering](https://geminicli.com/docs/tools/mcp-server/)
- [Gallery and release requirements](https://geminicli.com/docs/extensions/releasing/)
- [Release source: extension settings](https://github.com/google-gemini/gemini-cli/blob/v0.60.0/packages/cli/src/config/extensions/extensionSettings.ts)
- [Release source: extension manager](https://github.com/google-gemini/gemini-cli/blob/v0.60.0/packages/cli/src/config/extension-manager.ts)
- [Release source: keychain backend selection](https://github.com/google-gemini/gemini-cli/blob/v0.60.0/packages/core/src/services/keychainService.ts)
- [Release source: environment resolver](https://github.com/google-gemini/gemini-cli/blob/v0.60.0/packages/cli/src/utils/envVarResolver.ts)
- [Release source: MCP client](https://github.com/google-gemini/gemini-cli/blob/v0.60.0/packages/core/src/tools/mcp-client.ts)
