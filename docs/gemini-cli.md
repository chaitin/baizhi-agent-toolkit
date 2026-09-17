# Gemini CLI

The Baizhi Agent Toolkit extension connects Gemini CLI to the hosted MCP endpoint using Streamable HTTP. It enables `websearch_search`, `web_scrape`, and `web_extract` by default.

## Install

Use Gemini CLI **0.28.0 or newer**; the current stable version is recommended. The installation and header flow were tested with **0.60.0** on Node.js **22.22.2**. Google's extension settings feature requires at least 0.28.0. [Official announcement](https://developers.googleblog.com/making-gemini-cli-extensions-easier-to-use/)

1. Get your Baizhi API key from [Agent Toolkit](https://baizhi.cloud/landing/agent-toolkit).
2. In your terminal, run:

   ```sh
   gemini extensions install https://github.com/chaitin/baizhi-agent-toolkit
   ```

3. Review the extension consent prompt. At **Baizhi API Key**, enter only the key, without `Bearer `.
4. Restart Gemini CLI and run `/mcp` to check the connection and available tools.

The key is a sensitive extension setting. Gemini masks it during entry and in extension listings. It uses its credential storage, normally the operating system keychain; current Gemini CLI falls back to encrypted local storage when a native keychain is unavailable. The extension manifest contains only `${BAIZHI_API_KEY}`, never your key. [Settings reference](https://geminicli.com/docs/extensions/reference/#extension-settings), [credential storage implementation](https://github.com/google-gemini/gemini-cli/blob/v0.60.0/packages/core/src/services/keychainService.ts)

## Update or replace a key

```sh
gemini extensions config baizhi-agent-toolkit BAIZHI_API_KEY
```

Enter the new key at the masked prompt, then restart Gemini CLI. Do not paste a key into chat, a Git commit, or the manifest.

```sh
gemini extensions update baizhi-agent-toolkit
gemini extensions list
```

## Missing or invalid keys

The setting has no default key. If installation was cancelled at the key prompt, an empty value was entered, or `--skip-settings` was used, configure `BAIZHI_API_KEY` with the command above before using the server.

Gemini CLI 0.60.0 warns about a missing extension setting but can still install and enable the extension. It does **not** guarantee that a network request is prevented. In the local transport test, an unset key resulted in a bare `Authorization: Bearer` header. Authentication must therefore also be enforced by the hosted service. An invalid or expired key cannot be fixed by reinstalling: replace it with a valid key.

To stop connection attempts until a key is available:

```sh
gemini extensions disable baizhi-agent-toolkit
# After configuring your key:
gemini extensions enable baizhi-agent-toolkit
```

If an existing Gemini setting explicitly disables `experimental.extensionConfig`, enable that feature or remove the override so installation settings can work. It is enabled by default in the tested release.

## Enable additional tools deliberately

The hosted service may offer additional tools. The shipped `includeTools` list exposes only the three tools above. Gemini intersects an extension's allowlist with a user's allowlist, so adding extra names to `settings.json` does not widen this extension's list. [MCP configuration merging](https://geminicli.com/docs/tools/mcp-server/#overriding-extension-configurations)

For a custom selection, create a local variant:

```sh
git clone https://github.com/chaitin/baizhi-agent-toolkit baizhi-agent-toolkit-custom
gemini extensions disable baizhi-agent-toolkit
```

Edit the cloned `gemini-extension.json`: change `name` to `baizhi-agent-toolkit-custom`, and add the exact tool names you want to `mcpServers.baizhi-agent-toolkit.includeTools`. Removing `includeTools` makes all tools offered by that server eligible; do that only if you want the full tool set. Keep the API key placeholder and sensitive setting intact.

```sh
gemini extensions install ./baizhi-agent-toolkit-custom
```

Enter your key when prompted and restart Gemini CLI. Manage and review updates to this local variant yourself; editing an installed copy directly can lose your changes during an update. Gemini's normal tool approval rules still apply.

## Remove

```sh
gemini extensions uninstall baizhi-agent-toolkit
```

## Maintainer: gallery discovery

Keep `gemini-extension.json` at the public GitHub repository root and add the repository topic `gemini-cli-extension`. Gemini's gallery crawler runs daily and lists repositories that pass validation. There is no separate issue or email submission. Publishing the repository makes direct URL installation available; it does not prove that gallery indexing has completed. [Official release guide](https://geminicli.com/docs/extensions/releasing/#list-your-extension-in-the-gallery)

The current official manifest reference does not define an enforced minimum CLI version field. The minimum above is documented rather than represented by an invented manifest property. The manifest uses `httpUrl`, which remains supported in the tested release and supports older compatible releases.
