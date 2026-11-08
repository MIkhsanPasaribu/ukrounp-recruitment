// Run manually after database/interview-recovery.sql. Never run automatically on startup.
// node scripts/seed-interview-accounts.mjs --check  (read-only counts)
// node scripts/seed-interview-accounts.mjs          (insert missing accounts only)
// Credentials: ignored .env.interview-credentials.json, exclusive-create; never stdout.
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { open, readFile, lstat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const credentialsPath = join(root, '.env.interview-credentials.json');
const accounts = [
  { table: 'admins', username: 'admin', fullName: 'Administrator', role: 'SUPER_ADMIN' },
  ...Array.from({ length: 7 }, (_, index) => ({
    table: 'interviewers', username: `pewawancara${index + 1}`,
    fullName: `Pewawancara ${index + 1}`, role: 'INTERVIEWER',
  })),
];

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
    throw new Error('Usage: node scripts/seed-interview-accounts.mjs [--check]');
  }
  // Parse explicitly: no dotenv diagnostic output, no accidental .env.local fallback.
  const config = dotenv.parse(await readFile(join(root, '.env')));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || config.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase URL/service-role key missing from environment or .env.');
  const endpoint = new URL(url);
  if (endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname))) {
    throw new Error('Supabase URL must use HTTPS, except localhost.');
  }
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  if (args[0] === '--check') {
    for (const table of ['admins', 'interviewers', 'interview_questions', 'applicants']) {
      const { count, error } = await client.from(table).select('id', { count: 'exact', head: true });
      if (error) throw new Error(`Read-only count failed for ${table}; check migration and service-role access.`);
      console.log(`${table}: ${count}`);
    }
    return;
  }

  const missing = [];
  for (const account of accounts) {
    const { data, error } = await client.from(account.table).select('id').eq('username', account.username).maybeSingle();
    if (error) throw new Error(`Account lookup failed for ${account.username}; no passwords reset.`);
    if (!data) missing.push(account);
  }
  if (!missing.length) {
    console.log('All 8 expected usernames already exist; unchanged.');
    return;
  }

  // Use the existing .env* ignore rule, not a new ignore/config file or directory.
  // No mkdir needed: the repository root already exists. Refuse tracked/unignored output.
  if (!(await lstat(root)).isDirectory()) throw new Error('Credential parent is not a directory.');
  try {
    execFileSync('rtk', ['proxy', 'git', 'check-ignore', '--quiet', '--no-index', '.env.interview-credentials.json'], { cwd: root, stdio: 'pipe' });
    const tracked = execFileSync('rtk', ['proxy', 'git', 'ls-files', '--', '.env.interview-credentials.json'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    if (tracked.trim()) throw new Error('Tracked credential path');
  } catch {
    throw new Error('Credential output must be Git-ignored and untracked; RTK/Git required.');
  }
  // wx prevents overwrite/symlink following. POSIX mode 0600; Windows requires private NTFS ACLs.
  const file = await open(credentialsPath, 'wx', 0o600).catch(() => {
    throw new Error('Credential file already exists or cannot be created; preserve it before another run.');
  });
  const credentials = [];
  const usedPasswords = new Set();
  let created = 0;
  let writePosition = 0;
  const persist = async () => {
    const bytes = Buffer.from(JSON.stringify({ createdAt, accounts: credentials }, null, 2) + '\n');
    // Explicit position: retries never append or leave a stale trailing JSON fragment.
    writePosition = 0;
    while (writePosition < bytes.length) {
      const { bytesWritten } = await file.write(bytes, writePosition, bytes.length - writePosition, writePosition);
      if (!bytesWritten) throw new Error('Credential file write failed; stop seeding.');
      writePosition += bytesWritten;
    }
    await file.truncate(bytes.length);
    await file.sync();
  };
  const createdAt = new Date().toISOString();
  try {
    await persist();
    for (const account of missing) {
      let password;
      do { password = randomBytes(24).toString('base64url'); } while (usedPasswords.has(password));
      usedPasswords.add(password);
      const email = `${account.username}@example.invalid`;
      const passwordHash = await bcrypt.hash(password, 12);
      const credential = { username: account.username, email, password, table: account.table, state: 'pending' };
      credentials.push(credential);
      // Persist + fsync BEFORE remote insert: a crash/network ambiguity cannot lose its password.
      // pending means outcome unknown after interruption; inspect username before retrying.
      await persist();
      const { error } = await client.from(account.table).insert({
        username: account.username, email, passwordHash, fullName: account.fullName,
        role: account.role, isActive: true,
      });
      if (error) {
        if (error.code === '23505') {
          const existing = await client.from(account.table).select('id').eq('username', account.username).maybeSingle();
          if (!existing.error && existing.data) {
            credentials.pop(); // Concurrently created account: never reset or claim its password.
            await persist();
            continue;
          }
        }
        // Keep pending credential: network failure may follow a committed insert.
        throw new Error(`Insert failed for ${account.username}; stopped. Preserve credential file; pending outcome requires inspection.`);
      }
      credential.state = 'created';
      await persist();
      created++;
    }
    console.log(`Created ${created}; skipped ${accounts.length - created}. Existing passwords unchanged.`);
    console.log('Credentials saved locally in ignored .env.interview-credentials.json. Keep private; never commit or share logs containing its contents.');
  } finally {
    await file.close();
  }
}

main().catch((error) => {
  // Never print Supabase error objects, URLs, env values, keys, passwords, or stack traces.
  const safeMessages = [
    'Usage:', 'Supabase URL/service-role', 'Supabase URL must', 'Read-only count failed',
    'Account lookup failed', 'Credential parent', 'Credential output', 'Credential file',
    'Insert failed',
  ];
  console.error(safeMessages.some((prefix) => error.message?.startsWith(prefix))
    ? error.message : 'Seeding stopped. Check configuration/connectivity and preserve any local credentials; no existing passwords reset.');
  process.exitCode = 1;
});
