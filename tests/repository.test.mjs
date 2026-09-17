import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const text = (path) => readFileSync(join(root, path), 'utf8');

test('Publication remains manual and restricted to organization main', () => {
  const workflow = text('.github/workflows/publish-mcp.yml');
  assert.match(workflow, /on:\s*\n  workflow_dispatch:\s*\n\npermissions:/);
  assert.match(workflow, /if: github\.repository == 'chaitin\/baizhi-agent-toolkit' && github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /login github-oidc/);
  assert.match(workflow, /run: node scripts\/verify-registry\.mjs/);
  assert.doesNotMatch(workflow, /secrets\.|pull_request_target|contents: write/);
});

test('Workflows pin actions and publisher, without exposing keys to PR checks', () => {
  for (const name of ['validate', 'publish-mcp']) {
    const workflow = text(`.github/workflows/${name}.yml`);
    for (const match of workflow.matchAll(/uses: (\S+)/g)) {
      assert.match(match[1], /^[\w/-]+@[a-f0-9]{40}$/);
    }
    assert.match(workflow, /persist-credentials: false/);
    assert.match(workflow, /node-version: '22'/);
    assert.match(workflow, /releases\/download\/v1\.8\.1\/mcp-publisher_linux_amd64\.tar\.gz/);
    assert.match(workflow, /a06c9096dcb9727c13555b6be26c7effa707b01f06a4c561ba7a3635443cf2cc/);
    assert.match(workflow, /sha256sum --check/);
    assert.doesNotMatch(workflow, /secrets\./);
  }
  assert.doesNotMatch(text('.github/workflows/validate.yml'), /id-token:|login github-oidc|publish server\.json/);
});

test('Markdown relative file links resolve inside this repository', () => {
  const docs = ['readme.md', 'CONTRIBUTING.md', 'SECURITY.md', ...readdirSync(join(root, 'docs')).filter((name) => name.endsWith('.md')).map((name) => `docs/${name}`)];
  for (const path of docs) {
    for (const match of text(path).matchAll(/\]\(([^\s)]+)\)/g)) {
      const href = match[1];
      if (/^[a-z]+:|^#/i.test(href)) continue;
      const target = resolve(root, dirname(path), href.split('#')[0]);
      assert.ok(target.startsWith(root.endsWith(sep) ? root : root + sep), `${path}: link escapes repository`);
      assert.ok(existsSync(target), `${path}: missing link target ${href}`);
    }
  }
});
