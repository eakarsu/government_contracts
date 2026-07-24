const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const { Pool } = require('pg');

let pool;
function enabled() { return Boolean(process.env.DATABASE_URL); }
function getPool() {
  if (!enabled()) throw new Error('DATABASE_URL is required');
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, application_name: 'government-contracts-runtime' });
  return pool;
}

async function migrate() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS runtime_users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      company_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS runtime_ai_results (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES runtime_users(id),
      prompt TEXT NOT NULL,
      content TEXT NOT NULL CHECK (length(content) > 0),
      provider TEXT NOT NULL CHECK (provider = 'openrouter'),
      model TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS runtime_ai_results_user_created_idx ON runtime_ai_results(user_id, created_at DESC);
  `);
}

function publicUser(row) {
  return {
    _id: row.id,
    id: row.id,
    email: row.email,
    companyName: row.company_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    lastLogin: row.last_login,
    comparePassword: (password) => bcrypt.compare(password, row.password_hash),
    save: async () => {
      await getPool().query('UPDATE runtime_users SET last_login=$2 WHERE id=$1', [row.id, new Date()]);
      return publicUser({ ...row, last_login: new Date() });
    },
  };
}

async function create({ email, password, companyName, role = 'user' }) {
  const id = crypto.randomUUID();
  const result = await getPool().query(
    `INSERT INTO runtime_users(id,email,password_hash,company_name,role)
     VALUES($1,lower($2),$3,$4,$5) ON CONFLICT(email) DO NOTHING RETURNING *`,
    [id, email, await bcrypt.hash(password, 12), companyName, role],
  );
  return result.rows[0] ? publicUser(result.rows[0]) : null;
}

async function provisionAdmin({ email, password, companyName }) {
  const result = await getPool().query(
    `INSERT INTO runtime_users(id,email,password_hash,company_name,role,is_active)
     VALUES($1,lower($2),$3,$4,'admin',TRUE)
     ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,company_name=EXCLUDED.company_name,role='admin',is_active=TRUE
     RETURNING id,email,role`,
    [crypto.randomUUID(), email, await bcrypt.hash(password, 12), companyName],
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await getPool().query('SELECT * FROM runtime_users WHERE email=lower($1) AND is_active=TRUE', [email]);
  return result.rows[0] ? publicUser(result.rows[0]) : null;
}
async function findById(id) {
  const result = await getPool().query('SELECT * FROM runtime_users WHERE id=$1 AND is_active=TRUE', [id]);
  return result.rows[0] ? publicUser(result.rows[0]) : null;
}
async function saveAi({ userId, prompt, content, model }) {
  const id = crypto.randomUUID();
  await getPool().query(
    `INSERT INTO runtime_ai_results(id,user_id,prompt,content,provider,model) VALUES($1,$2,$3,$4,'openrouter',$5)`,
    [id, userId, prompt, content, model],
  );
  return id;
}
async function close() { if (pool) { await pool.end(); pool = undefined; } }

module.exports = { enabled, migrate, create, provisionAdmin, findByEmail, findById, saveAi, close };
