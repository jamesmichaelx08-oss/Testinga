import { spawnSync } from 'node:child_process'

// Prisma requires DIRECT_URL when directUrl is set in the schema.
// Fall back to DATABASE_URL so single-URL setups (Vercel, local) still work.
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL
}

const command = process.argv.slice(2).join(' ')
if (!command) {
  process.exit(0)
}

const result = spawnSync(command, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
})

process.exit(result.status ?? 1)
