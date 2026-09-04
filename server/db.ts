import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserDocument {
  id: string;
  email: string;
  fullName: string;
  passwordHash?: string;
  avatar?: string;
  googleId?: string;
  provider: 'local' | 'google';
  createdAt: string;
  lastLoginAt: string;
  emergencyContact?: string;
}

export interface SessionDocument {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

// -------------------------------------------------------------
// 1. In-memory + file-backed fallback store
// -------------------------------------------------------------
const BACKUP_FILE = path.join(process.cwd(), '.data', 'users.json');

try {
  const dir = path.dirname(BACKUP_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
} catch {
  // Non-fatal
}

let inMemoryUsers: UserDocument[] = [];
let inMemorySessions: SessionDocument[] = [];

try {
  if (fs.existsSync(BACKUP_FILE)) {
    const raw = fs.readFileSync(BACKUP_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.users)) inMemoryUsers = parsed.users;
    if (Array.isArray(parsed.sessions)) inMemorySessions = parsed.sessions;
  }
} catch (e) {
  console.log('[DB] Note: Initialized in-memory user cache');
}

function persistToFile() {
  try {
    const dir = path.dirname(BACKUP_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      BACKUP_FILE,
      JSON.stringify({ users: inMemoryUsers, sessions: inMemorySessions }, null, 2),
      'utf-8'
    );
  } catch (err) {
    // Non-fatal
  }
}

// -------------------------------------------------------------
// 2. Supabase Integration (Free PostgreSQL Cloud Database)
// -------------------------------------------------------------
export function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return {
    url: url.replace(/\/+$/, ''),
    key: key.trim()
  };
}

async function supabaseRequest<T = any>(
  endpoint: string,
  options: { method?: string; body?: any; prefer?: string } = {}
): Promise<T | null> {
  const cfg = getSupabaseConfig();
  if (!cfg) return null;

  try {
    const headers: Record<string, string> = {
      'apikey': cfg.key,
      'Authorization': `Bearer ${cfg.key}`,
      'Content-Type': 'application/json'
    };
    if (options.prefer) {
      headers['Prefer'] = options.prefer;
    }

    const res = await fetch(`${cfg.url}/rest/v1/${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[Supabase] ${options.method || 'GET'} /${endpoint} HTTP ${res.status}:`, errText);
      return null;
    }

    const text = await res.text();
    if (!text) return [] as unknown as T;
    return JSON.parse(text) as T;
  } catch (err: any) {
    console.warn(`[Supabase] Request error on /${endpoint}:`, err?.message || err);
    return null;
  }
}

// -------------------------------------------------------------
// 3. MongoDB Client Lazy Initialization
// -------------------------------------------------------------
let mongoClient: MongoClient | null = null;
let dbInstance: Db | null = null;
let isMongoConnecting = false;

async function getDatabase(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  if (isMongoConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (dbInstance) return dbInstance;
  }

  try {
    isMongoConnecting = true;
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    await mongoClient.connect();
    dbInstance = mongoClient.db('apnaroute');
    console.log('[MongoDB] Connected successfully to ApnaRoute database');

    try {
      await dbInstance.collection('users').createIndex({ email: 1 }, { unique: true });
    } catch {
      // Index might exist
    }

    return dbInstance;
  } catch (err: any) {
    console.warn('[MongoDB] Unable to connect to MongoDB URI:', err.message);
    dbInstance = null;
    return null;
  } finally {
    isMongoConnecting = false;
  }
}

// -------------------------------------------------------------
// 4. CRUD Operations
// -------------------------------------------------------------

// Find User by Email
export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Try Supabase
  if (getSupabaseConfig()) {
    const records = await supabaseRequest<UserDocument[]>(
      `users?email=eq.${encodeURIComponent(cleanEmail)}&select=*`
    );
    if (records && records.length > 0) {
      return records[0];
    }
  }

  // 2. Try MongoDB
  try {
    const db = await getDatabase();
    if (db) {
      const user = await db.collection<UserDocument>('users').findOne({ email: cleanEmail });
      if (user) return user;
    }
  } catch (e) {
    console.error('[DB] findUserByEmail MongoDB error, falling back:', e);
  }

  // 3. Fallback to local
  const local = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  return local || null;
}

// Find User by ID
export async function findUserById(id: string): Promise<UserDocument | null> {
  // 1. Try Supabase
  if (getSupabaseConfig()) {
    const records = await supabaseRequest<UserDocument[]>(
      `users?id=eq.${encodeURIComponent(id)}&select=*`
    );
    if (records && records.length > 0) {
      return records[0];
    }
  }

  // 2. Try MongoDB
  try {
    const db = await getDatabase();
    if (db) {
      const user = await db.collection<UserDocument>('users').findOne({ id });
      if (user) return user;
    }
  } catch (e) {
    console.error('[DB] findUserById MongoDB error, falling back:', e);
  }

  // 3. Fallback to local
  const local = inMemoryUsers.find((u) => u.id === id);
  return local || null;
}

// Find User by Google ID
export async function findUserByGoogleId(googleId: string): Promise<UserDocument | null> {
  // 1. Try Supabase
  if (getSupabaseConfig()) {
    const records = await supabaseRequest<UserDocument[]>(
      `users?googleId=eq.${encodeURIComponent(googleId)}&select=*`
    );
    if (records && records.length > 0) {
      return records[0];
    }
  }

  // 2. Try MongoDB
  try {
    const db = await getDatabase();
    if (db) {
      const user = await db.collection<UserDocument>('users').findOne({ googleId });
      if (user) return user;
    }
  } catch (e) {
    console.error('[DB] findUserByGoogleId error, falling back:', e);
  }

  // 3. Fallback to local
  const local = inMemoryUsers.find((u) => u.googleId === googleId);
  return local || null;
}

// Create User
export async function createUser(userData: {
  email: string;
  fullName: string;
  passwordHash?: string;
  avatar?: string;
  googleId?: string;
  provider: 'local' | 'google';
  emergencyContact?: string;
}): Promise<UserDocument> {
  const newUser: UserDocument = {
    id: `usr_${crypto.randomBytes(8).toString('hex')}`,
    email: userData.email.trim().toLowerCase(),
    fullName: userData.fullName.trim(),
    passwordHash: userData.passwordHash,
    avatar:
      userData.avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.fullName || userData.email)}`,
    googleId: userData.googleId,
    provider: userData.provider,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    emergencyContact: userData.emergencyContact || '+91 98765 43210'
  };

  // 1. Store in local cache & disk
  const existingIdx = inMemoryUsers.findIndex((u) => u.email.toLowerCase() === newUser.email);
  if (existingIdx >= 0) {
    inMemoryUsers[existingIdx] = newUser;
  } else {
    inMemoryUsers.push(newUser);
  }
  persistToFile();

  // 2. Store in Supabase if configured
  if (getSupabaseConfig()) {
    await supabaseRequest('users', {
      method: 'POST',
      body: newUser,
      prefer: 'resolution=merge-duplicates'
    });
  }

  // 3. Store in MongoDB if configured
  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('users').updateOne(
        { email: newUser.email },
        { $set: newUser },
        { upsert: true }
      );
    }
  } catch (e) {
    console.error('[DB] createUser MongoDB error:', e);
  }

  return newUser;
}

// Update Password
export async function updateUserPassword(email: string, newPasswordHash: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  let updated = false;

  const user = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (user) {
    user.passwordHash = newPasswordHash;
    persistToFile();
    updated = true;
  }

  // Supabase
  if (getSupabaseConfig()) {
    const res = await supabaseRequest(`users?email=eq.${encodeURIComponent(cleanEmail)}`, {
      method: 'PATCH',
      body: { passwordHash: newPasswordHash }
    });
    if (res) updated = true;
  }

  // MongoDB
  try {
    const db = await getDatabase();
    if (db) {
      const res = await db.collection('users').updateOne(
        { email: cleanEmail },
        { $set: { passwordHash: newPasswordHash } }
      );
      if (res.matchedCount > 0) updated = true;
    }
  } catch (e) {
    console.error('[DB] updateUserPassword error:', e);
  }

  return updated;
}

// Update User Last Login
export async function updateUserLastLogin(id: string): Promise<void> {
  const now = new Date().toISOString();
  const user = inMemoryUsers.find((u) => u.id === id);
  if (user) {
    user.lastLoginAt = now;
    persistToFile();
  }

  // Supabase
  if (getSupabaseConfig()) {
    await supabaseRequest(`users?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: { lastLoginAt: now }
    });
  }

  // MongoDB
  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('users').updateOne({ id }, { $set: { lastLoginAt: now } });
    }
  } catch (e) {
    // Non-fatal
  }
}

// Sessions Management
export async function saveSession(userId: string, token: string): Promise<void> {
  const session: SessionDocument = {
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  inMemorySessions = inMemorySessions.filter((s) => s.token !== token);
  inMemorySessions.push(session);
  persistToFile();

  // Supabase
  if (getSupabaseConfig()) {
    await supabaseRequest('sessions', {
      method: 'POST',
      body: session,
      prefer: 'resolution=merge-duplicates'
    });
  }

  // MongoDB
  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('sessions').updateOne(
        { token },
        { $set: session },
        { upsert: true }
      );
    }
  } catch (e) {
    // Non-fatal
  }
}

export async function getSession(token: string): Promise<SessionDocument | null> {
  // Supabase
  if (getSupabaseConfig()) {
    const sessions = await supabaseRequest<SessionDocument[]>(
      `sessions?token=eq.${encodeURIComponent(token)}&select=*`
    );
    if (sessions && sessions.length > 0) {
      return sessions[0];
    }
  }

  // MongoDB
  try {
    const db = await getDatabase();
    if (db) {
      const s = await db.collection<SessionDocument>('sessions').findOne({ token });
      if (s) return s;
    }
  } catch {
    // fallback
  }

  const local = inMemorySessions.find((s) => s.token === token);
  return local || null;
}

export async function deleteSession(token: string): Promise<void> {
  inMemorySessions = inMemorySessions.filter((s) => s.token !== token);
  persistToFile();

  // Supabase
  if (getSupabaseConfig()) {
    await supabaseRequest(`sessions?token=eq.${encodeURIComponent(token)}`, {
      method: 'DELETE'
    });
  }

  // MongoDB
  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('sessions').deleteOne({ token });
    }
  } catch {
    // Non-fatal
  }
}

export async function getDbStatus(): Promise<{
  connected: boolean;
  driver: 'supabase' | 'mongodb' | 'local_file';
  url?: string;
  usersCount: number;
  sessionsCount: number;
}> {
  // 1. Supabase Check
  const sbCfg = getSupabaseConfig();
  if (sbCfg) {
    try {
      const users = await supabaseRequest<any[]>('users?select=id');
      const sessions = await supabaseRequest<any[]>('sessions?select=token');
      return {
        connected: true,
        driver: 'supabase',
        url: sbCfg.url,
        usersCount: Array.isArray(users) ? users.length : inMemoryUsers.length,
        sessionsCount: Array.isArray(sessions) ? sessions.length : inMemorySessions.length
      };
    } catch {
      // fallback
    }
  }

  // 2. MongoDB Check
  try {
    const db = await getDatabase();
    if (db) {
      const usersCount = await db.collection('users').countDocuments();
      const sessionsCount = await db.collection('sessions').countDocuments();
      return {
        connected: true,
        driver: 'mongodb',
        usersCount,
        sessionsCount
      };
    }
  } catch {
    // fallback
  }

  // 3. Local Fallback
  return {
    connected: true,
    driver: 'local_file',
    usersCount: inMemoryUsers.length,
    sessionsCount: inMemorySessions.length
  };
}
