import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const json = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const endpoint = 'https://agent-toolkit.app.baizhi.cloud/mcp';

test('Registry publishes only the intended hosted endpoint', () => {
  const server = json('server.json');
  assert.equal(server.name, 'io.github.chaitin/baizhi-agent-toolkit');
  assert.equal(server.version, '0.1.0');
  assert.equal(server.websiteUrl, 'https://github.com/chaitin/baizhi-agent-toolkit');
  assert.equal(server.remotes.length, 1);
  assert.equal(server.remotes[0].type, 'streamable-http');
  assert.equal(server.remotes[0].url, endpoint);
  assert.equal(server.packages, undefined);
  // This is an integration repository, not the hosted backend's source.
  assert.equal(server.repository, undefined);
});

test('Registry asks for a required secret and never embeds a credential', () => {
  const headers = json('server.json').remotes[0].headers;
  assert.equal(headers.length, 1);
  const header = headers[0];
  assert.equal(header.name, 'Authorization');
  assert.equal(header.value, 'Bearer {BAIZHI_API_KEY}');
  assert.equal(header.isRequired, true);
  assert.equal(header.isSecret, true);
  assert.deepEqual(Object.keys(header.variables), ['BAIZHI_API_KEY']);
  const input = header.variables.BAIZHI_API_KEY;
  assert.equal(input.isRequired, true);
  assert.equal(input.isSecret, true);
  assert.equal(input.default, undefined);
  assert.equal(input.value, undefined);
  assert.equal(input.format, 'string');
  // Prove prefixing is done by the template, not requested from the user.
  assert.equal(header.value.replace('{BAIZHI_API_KEY}', 'test-only'), 'Bearer test-only');
});

test('Gemini points at the same endpoint with a secret variable and bounded tools', () => {
  const extension = json('gemini-extension.json');
  assert.equal(extension.name, 'baizhi-agent-toolkit');
  assert.equal(extension.version, json('server.json').version);
  const servers = Object.values(extension.mcpServers);
  assert.deepEqual(Object.keys(extension.mcpServers), ['baizhi-agent-toolkit']);
  assert.equal(servers.length, 1);
  assert.equal(servers[0].httpUrl, endpoint);
  assert.equal(servers[0].headers.Authorization, 'Bearer ${BAIZHI_API_KEY}');
  assert.notEqual(servers[0].trust, true);
  assert.equal(servers[0].command, undefined);
  assert.equal(servers[0].args, undefined);
  assert.deepEqual(Object.keys(servers[0].headers), ['Authorization']);
  assert.deepEqual([...servers[0].includeTools].sort(), ['web_extract', 'web_scrape', 'websearch_search']);
  const input = extension.settings.find((setting) => setting.envVar === 'BAIZHI_API_KEY');
  assert.equal(extension.settings.length, 1);
  assert.equal(input.sensitive, true);
  assert.equal(input.default, undefined);
  assert.equal(input.value, undefined);
});
