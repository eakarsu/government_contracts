const bcrypt = require('bcrypt');
const crypto = require('node:crypto');

const usersByEmail = new Map();
const usersById = new Map();

function enabled() {
  return process.env.NODE_ENV === 'test' && process.env.RUNTIME_IN_MEMORY_AUTH === 'true';
}

function publicUser(user) {
  return {
    _id: user._id,
    id: user._id,
    email: user.email,
    companyName: user.companyName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    comparePassword: password => bcrypt.compare(password, user.passwordHash),
    save: async () => user,
  };
}

async function create({ email, password, companyName }) {
  const normalizedEmail = email.toLowerCase();
  if (usersByEmail.has(normalizedEmail)) return null;
  const user = {
    _id: crypto.randomUUID(),
    email: normalizedEmail,
    companyName,
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null,
    passwordHash: await bcrypt.hash(password, 10),
  };
  usersByEmail.set(normalizedEmail, user);
  usersById.set(user._id, user);
  return publicUser(user);
}

async function findByEmail(email) {
  const user = usersByEmail.get(String(email).toLowerCase());
  return user ? publicUser(user) : null;
}

async function findById(id) {
  const user = usersById.get(String(id));
  return user ? publicUser(user) : null;
}

module.exports = { enabled, create, findByEmail, findById };
