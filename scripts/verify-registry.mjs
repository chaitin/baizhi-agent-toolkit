import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Read-only verification: never authenticate, publish, or call MCP tools here.
export function assertPublishedEntry(entry, expected) {
  assert.ok(entry?.server, 'Registry response must contain a server');
  for (const field of ['$schema', 'name', 'title', 'description', 'version', 'websiteUrl']) {
    assert.equal(entry.server[field], expected[field], `Registry ${field} must match the reviewed manifest`);
  }
  assert.deepEqual(entry.server.remotes, expected.remotes, 'Remote endpoint and secret template must match');
  assert.equal(entry.server.packages, undefined, 'This entry must not advertise local packages');
  assert.equal(entry.server.repository, undefined, 'Integration code must not be labeled as backend source');
  const status = entry._meta?.['io.modelcontextprotocol.registry/official'];
  assert.equal(status?.status, 'active', 'Published entry must be active');
  assert.equal(status?.isLatest, true, 'Published version must be marked latest');
}

export async function verifyRegistry(expected) {
  const url = `https://registry.modelcontextprotocol.io/v0.1/servers/${encodeURIComponent(expected.name)}/versions/${encodeURIComponent(expected.version)}`;
  // Bounded retries allow for publication propagation without hiding failure.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
      assert.equal(response.status, 200, `Registry returned HTTP ${response.status}`);
      assertPublishedEntry(await response.json(), expected);
      return url;
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise((done) => setTimeout(done, 2000));
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const expected = JSON.parse(await readFile(new URL('../server.json', import.meta.url), 'utf8'));
  const url = await verifyRegistry(expected);
  console.log(`Verified active Registry entry: ${url}`);
}
