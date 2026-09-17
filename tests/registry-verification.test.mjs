import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { assertPublishedEntry } from '../scripts/verify-registry.mjs';

const expected = JSON.parse(readFileSync(new URL('../server.json', import.meta.url), 'utf8'));
const fixture = () => ({
  server: structuredClone(expected),
  _meta: { 'io.modelcontextprotocol.registry/official': { status: 'active', isLatest: true } },
});

test('Registry read-back accepts only matching active metadata', () => {
  assert.doesNotThrow(() => assertPublishedEntry(fixture(), expected));
});

for (const field of ['$schema', 'name', 'title', 'description', 'version', 'websiteUrl']) {
  test(`Registry read-back rejects a mismatched ${field}`, () => {
    const entry = fixture();
    entry.server[field] = 'unexpected';
    assert.throws(() => assertPublishedEntry(entry, expected));
  });
}

for (const [label, change] of [
  ['different endpoint', (e) => { e.server.remotes[0].url = 'https://example.invalid/mcp'; }],
  ['different secret template', (e) => { e.server.remotes[0].headers[0].value = 'Bearer test-only'; }],
  ['missing secret flag', (e) => { delete e.server.remotes[0].headers[0].variables.BAIZHI_API_KEY.isSecret; }],
  ['extra local package', (e) => { e.server.packages = []; }],
  ['backend source claim', (e) => { e.server.repository = {}; }],
  ['deprecated version', (e) => { e._meta['io.modelcontextprotocol.registry/official'].status = 'deprecated'; }],
  ['non-latest version', (e) => { e._meta['io.modelcontextprotocol.registry/official'].isLatest = false; }],
  ['missing server', (e) => { delete e.server; }],
  ['missing status', (e) => { delete e._meta; }],
]) {
  test(`Registry read-back rejects ${label}`, () => {
    const entry = fixture();
    change(entry);
    assert.throws(() => assertPublishedEntry(entry, expected));
  });
}
