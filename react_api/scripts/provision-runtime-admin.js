const runtimeDb = require('../services/runtimeDb');

async function main() {
  const email = String(process.env.PROVISION_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.PROVISION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '');
  const companyName = String(process.env.PROVISION_COMPANY_NAME || 'Runtime Acceptance Company').trim();
  if (!email.includes('@') || password.length < 12 || !companyName) throw new Error('Valid runtime administrator settings are required');
  await runtimeDb.migrate();
  const user = await runtimeDb.provisionAdmin({ email, password, companyName });
  console.log(JSON.stringify({ event: 'runtime_admin_provisioned', userId: user.id }));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => runtimeDb.close());
