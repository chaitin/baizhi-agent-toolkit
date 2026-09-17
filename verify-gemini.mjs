/**
 * Offline validation against the unmodified, npm-published Gemini CLI 0.60.0.
 * Optional version-specific regression test; bundled internals are not a public API.
 * Run with Node 22. The optional argument is the installed package directory.
 * All generated state stays under this repository's ignored test-state directory.
 */
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, copyFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(process.argv[2] ?? join(root, 'runtime/node_modules/@google/gemini-cli'));
const packageInfo = JSON.parse(await readFile(join(packageDir, 'package.json'), 'utf8'));
assert.equal(packageInfo.version, '0.60.0', 'Recheck internal module paths before changing Gemini version');
const testDir = await mkdtemp(join(root, 'test-state-'));
const cliHome = join(testDir, 'cli-home');
const workspace = join(testDir, 'workspace');
const fixture = join(testDir, 'extension');
await Promise.all([mkdir(cliHome), mkdir(workspace), mkdir(fixture)]);
await copyFile(join(root, 'gemini-extension.json'), join(fixture, 'gemini-extension.json'));

// GEMINI_CLI_HOME is Gemini's supported home override. Do not change real HOME.
// Force file storage BEFORE importing Gemini: the native keychain must never run.
process.env.GEMINI_CLI_HOME = cliHome;
process.env.GEMINI_FORCE_FILE_STORAGE = 'true';
process.env.GEMINI_CLI_SYSTEM_SETTINGS_PATH = join(testDir, 'absent-system-settings.json');
process.env.GEMINI_CLI_SYSTEM_DEFAULTS_PATH = join(testDir, 'absent-system-defaults.json');
process.env.NO_PROXY = '127.0.0.1,localhost';
delete process.env.BAIZHI_API_KEY;
process.chdir(workspace);

const bundle = join(packageDir, 'bundle');
const importBundle = (name) => import(pathToFileURL(join(bundle, name)).href);
const { ExtensionManager } = await importBundle('chunk-CMLALLX3.js');
const { loadSettings, resolveEnvVarsInObject } = await importBundle('chunk-WRNJPSJG.js');
const { createTransport, isEnabled, KeychainService } = await importBundle('chunk-VCAJDPDX.js');
assert.equal(await new KeychainService('Baizhi isolated validation').isUsingFileFallback(), true);
const settings = loadSettings(workspace).merged;
settings.telemetry = { enabled: false };
settings.security.folderTrust.enabled = false;
const secret = 'baizhi-offline-validation-not-a-real-api-key';
let promptCount = 0;
const manager = new ExtensionManager({
  workspaceDir: workspace,
  settings,
  clientVersion: packageInfo.version,
  requestConsent: async () => true,
  requestSetting: async (setting) => {
    promptCount++;
    assert.equal(setting.envVar, 'BAIZHI_API_KEY');
    assert.equal(setting.sensitive, true);
    assert.match(setting.description, /https:\/\/baizhi\.cloud\/landing\/agent-toolkit/);
    return secret;
  },
});
// ExtensionManager constructs its own Config without forwarding the usage opt-out.
// Disable its analytics for this offline harness; do not alter extension behavior.
manager.telemetryConfig.usageStatisticsEnabled = false;
await manager.loadExtensions();
console.log('Checking isolated extension install');
const installed = await manager.installOrUpdateExtension({ type: 'local', source: fixture });
console.log('PASS: extension installed');
assert.equal(promptCount, 1, 'installation requests exactly one sensitive setting');
assert.equal(installed.name, 'baizhi-agent-toolkit');
assert.equal(installed.version, '0.1.0');
const server = installed.mcpServers['baizhi-agent-toolkit'];
assert.equal(server.httpUrl, 'https://agent-toolkit.app.baizhi.cloud/mcp');
assert.equal(server.headers.Authorization, `Bearer ${secret}`);
assert.equal(server.trust, undefined);
assert.equal(installed.resolvedSettings[0].source, 'Keychain');
assert.match(manager.toOutputString(installed), /Baizhi API Key: \*\*\*/);
assert.equal(manager.toOutputString(installed).includes(secret), false);

const allFiles = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await allFiles(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
};
for (const path of await allFiles(cliHome)) {
  assert.equal((await readFile(path, 'utf8')).includes(secret), false, `No plaintext secret in ${path}`);
}
const credentialsPath = join(cliHome, '.gemini', 'gemini-credentials.json');
assert.equal((await stat(credentialsPath)).mode & 0o777, 0o600);
console.log('PASS: storage contains no plaintext test secret');
const reloadManager = new ExtensionManager({
  workspaceDir: workspace, settings, clientVersion: packageInfo.version,
  requestConsent: async () => true,
});
reloadManager.telemetryConfig.usageStatisticsEnabled = false;
await reloadManager.loadExtensions();
const reloaded = reloadManager.getExtensions().find((extension) => extension.name === installed.name);
assert.equal(reloaded.mcpServers['baizhi-agent-toolkit'].headers.Authorization, `Bearer ${secret}`);

const allowlist = ['websearch_search', 'web_scrape', 'web_extract'];
assert.deepEqual(server.includeTools, allowlist);
for (const name of allowlist) assert.equal(isEnabled({ name }, installed.name, server), true);
assert.equal(isEnabled({ name: 'not-in-the-default-allowlist' }, installed.name, server), false);
console.log('PASS: installation, storage, reload, masking, and tool allowlist');

// Exercise Gemini's real HTTP transport against localhost only. This is a
// protocol fixture, not an authenticated Baizhi service or Gemini model E2E.
const receivedHeaders = [];
const httpServer = createServer(async (request, response) => {
  if (request.method === 'GET') { response.writeHead(405).end(); return; }
  let body = '';
  for await (const chunk of request) body += chunk;
  const message = JSON.parse(body);
  receivedHeaders.push(request.headers.authorization);
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ jsonrpc: '2.0', id: message.id, result: {
    protocolVersion: '2025-03-26', capabilities: {},
    serverInfo: { name: 'offline-baizhi-fixture', version: '0.0.0' },
  } }));
});
await new Promise((resolveListen, reject) => {
  httpServer.on('error', reject);
  httpServer.listen(0, '127.0.0.1', resolveListen);
});
try {
  const sendInitialize = async (serverConfig) => {
    console.log('Checking local HTTP transport');
    const transport = await createTransport(installed.name, {
      ...serverConfig,
      httpUrl: `http://127.0.0.1:${httpServer.address().port}/mcp`,
    }, false, { sanitizationConfig: {}, emitMcpDiagnostic() {} });
    transport.onmessage = () => {};
    transport.onerror = (error) => { throw error; };
    const timeout = setTimeout(() => {
      console.error('Local transport verification timed out');
      process.exitCode = 1;
      transport.close();
      httpServer.closeAllConnections();
    }, 15000);
    try {
      await transport.start();
      await transport.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {
        protocolVersion: '2025-03-26', capabilities: {},
        clientInfo: { name: 'baizhi-offline-validation', version: '0.1.0' },
      } });
    } finally { clearTimeout(timeout); await transport.close(); }
  };
  await sendInitialize(server);
  assert.equal(receivedHeaders.at(-1), `Bearer ${secret}`);
  const original = JSON.parse(await readFile(join(root, 'gemini-extension.json'), 'utf8'));
  const unresolved = resolveEnvVarsInObject(original, {});
  assert.equal(unresolved.mcpServers[installed.name].headers.Authorization, 'Bearer ${BAIZHI_API_KEY}');
  await sendInitialize(unresolved.mcpServers[installed.name]);
  assert.equal(receivedHeaders.at(-1), 'Bearer', 'transport removes the missing variable, HTTP trims whitespace');
} finally {
  httpServer.closeAllConnections();
  await new Promise((resolveClose) => httpServer.close(resolveClose));
}
console.log(JSON.stringify({
  result: 'PASS',
  geminiCli: packageInfo.version,
  node: process.version,
  checks: [
    'real ExtensionManager install invokes one sensitive setting prompt',
    'forced encrypted file storage; no native keychain calls',
    'no plaintext test key in generated CLI state; credentials mode 0600',
    'saved key reloads and resolves into Authorization header',
    'CLI extension listing masks the secret',
    'real Gemini tool filter permits exactly the three default tools',
    'real Gemini Streamable HTTP transport sends the resolved Bearer header to localhost',
    'missing key becomes bare Bearer at transport; no client-side fail-closed guarantee',
  ],
  limits: ['No real key', 'No production MCP call', 'No Gemini model call', 'Native OS keychain path source-verified only'],
  isolatedState: testDir,
}, null, 2));
