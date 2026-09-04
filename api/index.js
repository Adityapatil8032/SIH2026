var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db.ts
var db_exports = {};
__export(db_exports, {
  createUser: () => createUser,
  deleteSession: () => deleteSession,
  findUserByEmail: () => findUserByEmail,
  findUserByGoogleId: () => findUserByGoogleId,
  findUserById: () => findUserById,
  getDbStatus: () => getDbStatus,
  getSession: () => getSession,
  getSupabaseConfig: () => getSupabaseConfig,
  saveSession: () => saveSession,
  updateUserLastLogin: () => updateUserLastLogin,
  updateUserPassword: () => updateUserPassword
});
import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import crypto from "crypto";
function persistToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      BACKUP_FILE,
      JSON.stringify({ users: inMemoryUsers, sessions: inMemorySessions }, null, 2),
      "utf-8"
    );
  } catch (err) {
  }
}
function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return {
    url: url.replace(/\/+$/, ""),
    key: key.trim()
  };
}
async function supabaseRequest(endpoint, options = {}) {
  const cfg = getSupabaseConfig();
  if (!cfg) return null;
  try {
    const headers = {
      "apikey": cfg.key,
      "Authorization": `Bearer ${cfg.key}`,
      "Content-Type": "application/json"
    };
    if (options.prefer) {
      headers["Prefer"] = options.prefer;
    }
    const res = await fetch(`${cfg.url}/rest/v1/${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : void 0
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[Supabase] ${options.method || "GET"} /${endpoint} HTTP ${res.status}:`, errText);
      return null;
    }
    const text = await res.text();
    if (!text) return [];
    return JSON.parse(text);
  } catch (err) {
    console.warn(`[Supabase] Request error on /${endpoint}:`, err?.message || err);
    return null;
  }
}
async function getDatabase() {
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
      serverSelectionTimeoutMS: 3e3,
      connectTimeoutMS: 3e3
    });
    await mongoClient.connect();
    dbInstance = mongoClient.db("apnaroute");
    console.log("[MongoDB] Connected successfully to ApnaRoute database");
    try {
      await dbInstance.collection("users").createIndex({ email: 1 }, { unique: true });
    } catch {
    }
    return dbInstance;
  } catch (err) {
    console.warn("[MongoDB] Unable to connect to MongoDB URI:", err.message);
    dbInstance = null;
    return null;
  } finally {
    isMongoConnecting = false;
  }
}
async function findUserByEmail(email) {
  const cleanEmail = email.trim().toLowerCase();
  if (getSupabaseConfig()) {
    const records = await supabaseRequest(
      `users?email=eq.${encodeURIComponent(cleanEmail)}&select=*`
    );
    if (records && records.length > 0) {
      return records[0];
    }
  }
  try {
    const db = await getDatabase();
    if (db) {
      const user = await db.collection("users").findOne({ email: cleanEmail });
      if (user) return user;
    }
  } catch (e) {
    console.error("[DB] findUserByEmail MongoDB error, falling back:", e);
  }
  const local = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  return local || null;
}
async function findUserById(id) {
  if (getSupabaseConfig()) {
    const records = await supabaseRequest(
      `users?id=eq.${encodeURIComponent(id)}&select=*`
    );
    if (records && records.length > 0) {
      return records[0];
    }
  }
  try {
    const db = await getDatabase();
    if (db) {
      const user = await db.collection("users").findOne({ id });
      if (user) return user;
    }
  } catch (e) {
    console.error("[DB] findUserById MongoDB error, falling back:", e);
  }
  const local = inMemoryUsers.find((u) => u.id === id);
  return local || null;
}
async function findUserByGoogleId(googleId) {
  if (getSupabaseConfig()) {
    const records = await supabaseRequest(
      `users?googleId=eq.${encodeURIComponent(googleId)}&select=*`
    );
    if (records && records.length > 0) {
      return records[0];
    }
  }
  try {
    const db = await getDatabase();
    if (db) {
      const user = await db.collection("users").findOne({ googleId });
      if (user) return user;
    }
  } catch (e) {
    console.error("[DB] findUserByGoogleId error, falling back:", e);
  }
  const local = inMemoryUsers.find((u) => u.googleId === googleId);
  return local || null;
}
async function createUser(userData) {
  const newUser = {
    id: `usr_${crypto.randomBytes(8).toString("hex")}`,
    email: userData.email.trim().toLowerCase(),
    fullName: userData.fullName.trim(),
    passwordHash: userData.passwordHash,
    avatar: userData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.fullName || userData.email)}`,
    googleId: userData.googleId,
    provider: userData.provider,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastLoginAt: (/* @__PURE__ */ new Date()).toISOString(),
    emergencyContact: userData.emergencyContact || "+91 98765 43210"
  };
  const existingIdx = inMemoryUsers.findIndex((u) => u.email.toLowerCase() === newUser.email);
  if (existingIdx >= 0) {
    inMemoryUsers[existingIdx] = newUser;
  } else {
    inMemoryUsers.push(newUser);
  }
  persistToFile();
  if (getSupabaseConfig()) {
    await supabaseRequest("users", {
      method: "POST",
      body: newUser,
      prefer: "resolution=merge-duplicates"
    });
  }
  try {
    const db = await getDatabase();
    if (db) {
      await db.collection("users").updateOne(
        { email: newUser.email },
        { $set: newUser },
        { upsert: true }
      );
    }
  } catch (e) {
    console.error("[DB] createUser MongoDB error:", e);
  }
  return newUser;
}
async function updateUserPassword(email, newPasswordHash) {
  const cleanEmail = email.trim().toLowerCase();
  let updated = false;
  const user = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (user) {
    user.passwordHash = newPasswordHash;
    persistToFile();
    updated = true;
  }
  if (getSupabaseConfig()) {
    const res = await supabaseRequest(`users?email=eq.${encodeURIComponent(cleanEmail)}`, {
      method: "PATCH",
      body: { passwordHash: newPasswordHash }
    });
    if (res) updated = true;
  }
  try {
    const db = await getDatabase();
    if (db) {
      const res = await db.collection("users").updateOne(
        { email: cleanEmail },
        { $set: { passwordHash: newPasswordHash } }
      );
      if (res.matchedCount > 0) updated = true;
    }
  } catch (e) {
    console.error("[DB] updateUserPassword error:", e);
  }
  return updated;
}
async function updateUserLastLogin(id) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const user = inMemoryUsers.find((u) => u.id === id);
  if (user) {
    user.lastLoginAt = now;
    persistToFile();
  }
  if (getSupabaseConfig()) {
    await supabaseRequest(`users?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { lastLoginAt: now }
    });
  }
  try {
    const db = await getDatabase();
    if (db) {
      await db.collection("users").updateOne({ id }, { $set: { lastLoginAt: now } });
    }
  } catch (e) {
  }
}
async function saveSession(userId, token) {
  const session = {
    token,
    userId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString()
  };
  inMemorySessions = inMemorySessions.filter((s) => s.token !== token);
  inMemorySessions.push(session);
  persistToFile();
  if (getSupabaseConfig()) {
    await supabaseRequest("sessions", {
      method: "POST",
      body: session,
      prefer: "resolution=merge-duplicates"
    });
  }
  try {
    const db = await getDatabase();
    if (db) {
      await db.collection("sessions").updateOne(
        { token },
        { $set: session },
        { upsert: true }
      );
    }
  } catch (e) {
  }
}
async function getSession(token) {
  if (getSupabaseConfig()) {
    const sessions = await supabaseRequest(
      `sessions?token=eq.${encodeURIComponent(token)}&select=*`
    );
    if (sessions && sessions.length > 0) {
      return sessions[0];
    }
  }
  try {
    const db = await getDatabase();
    if (db) {
      const s = await db.collection("sessions").findOne({ token });
      if (s) return s;
    }
  } catch {
  }
  const local = inMemorySessions.find((s) => s.token === token);
  return local || null;
}
async function deleteSession(token) {
  inMemorySessions = inMemorySessions.filter((s) => s.token !== token);
  persistToFile();
  if (getSupabaseConfig()) {
    await supabaseRequest(`sessions?token=eq.${encodeURIComponent(token)}`, {
      method: "DELETE"
    });
  }
  try {
    const db = await getDatabase();
    if (db) {
      await db.collection("sessions").deleteOne({ token });
    }
  } catch {
  }
}
async function getDbStatus() {
  const sbCfg = getSupabaseConfig();
  if (sbCfg) {
    try {
      const users = await supabaseRequest("users?select=id");
      const sessions = await supabaseRequest("sessions?select=token");
      return {
        connected: true,
        driver: "supabase",
        url: sbCfg.url,
        usersCount: Array.isArray(users) ? users.length : inMemoryUsers.length,
        sessionsCount: Array.isArray(sessions) ? sessions.length : inMemorySessions.length
      };
    } catch {
    }
  }
  try {
    const db = await getDatabase();
    if (db) {
      const usersCount = await db.collection("users").countDocuments();
      const sessionsCount = await db.collection("sessions").countDocuments();
      return {
        connected: true,
        driver: "mongodb",
        usersCount,
        sessionsCount
      };
    }
  } catch {
  }
  return {
    connected: true,
    driver: "local_file",
    usersCount: inMemoryUsers.length,
    sessionsCount: inMemorySessions.length
  };
}
var isServerless, DATA_DIR, BACKUP_FILE, inMemoryUsers, inMemorySessions, mongoClient, dbInstance, isMongoConnecting;
var init_db = __esm({
  "server/db.ts"() {
    isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    DATA_DIR = isServerless ? path.join("/tmp", ".data") : path.join(process.cwd(), ".data");
    BACKUP_FILE = path.join(DATA_DIR, "users.json");
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch {
    }
    inMemoryUsers = [];
    inMemorySessions = [];
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        const raw = fs.readFileSync(BACKUP_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.users)) inMemoryUsers = parsed.users;
        if (Array.isArray(parsed.sessions)) inMemorySessions = parsed.sessions;
      }
    } catch (e) {
      console.log("[DB] Note: Initialized in-memory user cache");
    }
    mongoClient = null;
    dbInstance = null;
    isMongoConnecting = false;
  }
});

// server/api-entry.ts
import "dotenv/config";
import express from "express";

// server/routes.ts
import { Router as Router2 } from "express";

// server/data.ts
var DESTINATIONS = [
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    tagline: "The Pink City \u2022 Forts, Palaces & Royal Craft",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "October \u2013 March",
    startingBudget: 9e3,
    safetyScore: 94,
    categories: ["Heritage", "Food", "All"],
    temperature: "28\xB0C",
    weatherStatus: "Sunny & Pleasant",
    crowdLevel: "Moderate",
    popularActivities: ["Amer Fort Sound & Light", "Hawa Mahal Sunrise Walk", "Johari Bazaar Jewellery", "Chokhi Dhani Heritage Feast"],
    historicalBrief: {
      history: "Founded in 1727 by Maharaja Sawai Jai Singh II, Jaipur was India\u2019s first planned city designed by Vidyadhar Bhattacharya following Vastu Shastra.",
      culture: "Known for Rajasthani hospitality, vibrant bandhani textiles, blue pottery, and classical Kathak gharana.",
      architecture: "Distinguished terracotta-pink facades, sandstone jharokhas, stepwells like Panna Meena Ka Kund, and astronomical marvel Jantar Mantar.",
      localTraditions: 'Welcoming guests with "Khamma Ghani", royal Teej & Gangaur processions, and camel leather crafts.',
      localEtiquette: "Remove shoes at temples and royal cenotaphs. Modest attire is appreciated in historic walled city bazaars."
    },
    coordinates: { lat: 26.9124, lng: 75.7873 }
  },
  {
    id: "manali",
    name: "Manali",
    state: "Himachal Pradesh",
    tagline: "Valley of the Gods \u2022 Snow Passes & Pine Forests",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "October \u2013 June",
    startingBudget: 11500,
    safetyScore: 89,
    categories: ["Mountains", "Adventure", "Nature", "All"],
    temperature: "14\xB0C",
    weatherStatus: "Crisp Mountain Breeze",
    crowdLevel: "Moderate",
    popularActivities: ["Solang Valley Paragliding", "Atal Tunnel Transit to Lahaul", "Old Manali Apple Orchards", "Jogini Waterfall Trek"],
    historicalBrief: {
      history: "Legend attributes Manali to sage Manu, who stepped off his ark to recreate human life after the great deluge.",
      culture: "Kulluvi hill culture, local shawls, Pahari nati dance, and apple harvest traditions.",
      architecture: "Indigenous Kath-Kuni architectural style (interlocking wood and stone without mortar for seismic resilience) seen in Hadimba Temple.",
      localTraditions: "Honoring local devtas (deities), wood carving, and trout fishing in the Beas river.",
      localEtiquette: "Do not touch sanctum sanctorum idols in village temples. Respect fragile Himalayan ecology\u2014no plastic littering."
    },
    coordinates: { lat: 32.2396, lng: 77.1887 }
  },
  {
    id: "goa",
    name: "Goa",
    state: "Goa",
    tagline: "Coastal Haven \u2022 Portuguese Heritage & Sunsets",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "November \u2013 April",
    startingBudget: 12e3,
    safetyScore: 92,
    categories: ["Beaches", "Food", "Nature", "All"],
    temperature: "30\xB0C",
    weatherStatus: "Tropical Sunshine",
    crowdLevel: "High",
    popularActivities: ["Dudhsagar Waterfalls Trek", "Fontainhas Heritage Latin Quarter Walk", "Sunset Kayaking in Chapora", "Anjuna Flea Market"],
    historicalBrief: {
      history: "Ruled by Kadamba, Vijayanagara, and Bijapur dynasties before 450 years of Portuguese colonization ending in 1961.",
      culture: "Susegad philosophy (relaxed contentment), fusion Indo-Portuguese cuisine, Konkani folk traditions, and vibrant carnivals.",
      architecture: "UNESCO Basilica of Bom Jesus, Manueline church arches, terracotta-tiled mansions with oyster-shell windows.",
      localTraditions: "Fishermen fishing cooperatives (Ramponkars), Shigmo spring festival, and feni distillation.",
      localEtiquette: "Observe beach swim safety flags. Dress respectfully inside historical churches and chapels."
    },
    coordinates: { lat: 15.2993, lng: 74.124 }
  },
  {
    id: "spiti",
    name: "Spiti Valley",
    state: "Himachal Pradesh",
    tagline: "The Middle Land \u2022 High-Altitude Cold Desert",
    image: "https://images.unsplash.com/photo-1590740608670-201a0fd7ff63?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "May \u2013 October",
    startingBudget: 16e3,
    safetyScore: 82,
    categories: ["Mountains", "Adventure", "Hidden Gems", "All"],
    temperature: "8\xB0C",
    weatherStatus: "Clear High-Altitude Sun",
    crowdLevel: "Low",
    popularActivities: ["Key Monastery Sunrise", "Highest Post Office at Hikkim", "Chandratal Lake Camping", "Fossil Hunting in Langza"],
    historicalBrief: {
      history: "A remote cold-desert plateau nestled between Tibet and India, preserving intact 10th-century Buddhist monasteries.",
      culture: "Tibetan Buddhist traditions, warm mud-house homestays, butter tea, and winter snow leopard tracking.",
      architecture: "Whitewashed fort-like monasteries perched on sheer cliffs with ancient thangka murals.",
      localTraditions: "Prayer flag hoisting, spinning Mani wheels, and community grain storage.",
      localEtiquette: "Walk clockwise around chortens and gompas. Allow 48 hours for gradual acclimatization to avoid AMS."
    },
    coordinates: { lat: 32.2461, lng: 78.0349 }
  },
  {
    id: "munnar",
    name: "Munnar",
    state: "Kerala",
    tagline: "Emerald Tea Terraces \u2022 Misty Western Ghats",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "September \u2013 May",
    startingBudget: 9500,
    safetyScore: 96,
    categories: ["Nature", "Mountains", "Food", "All"],
    temperature: "19\xB0C",
    weatherStatus: "Misty & Refreshing",
    crowdLevel: "Moderate",
    popularActivities: ["Eravikulam Nilgiri Tahr Trek", "Tea Factory & Tasting Tour", "Mattupetty Dam Boating", "Spice Plantation Walk"],
    historicalBrief: {
      history: "Once the summer resort of the British Presidency, Munnar was transformed into vast tea estates in the late 19th century.",
      culture: "Harmonious blend of Tamil and Malayali plantation culture, traditional Ayurveda, and spices.",
      architecture: "Colonial bungalows with gabled roofs, stone-built Christ Church, and eco-sustainable tea cottages.",
      localTraditions: "Handcrafted tea leaf sorting, Neelakurinji bloom celebrations every 12 years, and organic spice drying.",
      localEtiquette: "Drive slowly on winding hill hairpins. Never pick wild orchids or tea leaves without permission."
    },
    coordinates: { lat: 10.0889, lng: 77.0595 }
  },
  {
    id: "udaipur",
    name: "Udaipur",
    state: "Rajasthan",
    tagline: "City of Lakes \u2022 Mewar Valor & Marble Serenity",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "October \u2013 March",
    startingBudget: 10500,
    safetyScore: 95,
    categories: ["Heritage", "Nature", "All"],
    temperature: "27\xB0C",
    weatherStatus: "Clear Skies",
    crowdLevel: "Moderate",
    popularActivities: ["Lake Pichola Sunset Boat Cruise", "City Palace Royal Artifacts", "Bagore Ki Haveli Folk Show", "Sajjangarh Monsoon Palace"],
    historicalBrief: {
      history: "Founded in 1559 by Maharana Udai Singh II as the final capital of the heroic Mewar Kingdom.",
      culture: "Legendary Mewari chivalry, miniature Rajput painting, silver filigree work, and puppets.",
      architecture: "Palatial white marble edifices hovering over shimmering interconnected freshwater lakes.",
      localTraditions: "Ghoomar dance, royal boat regattas, and handcrafted leather journals.",
      localEtiquette: "Hire licensed guides inside City Palace. Respect photography rules in sanctum areas."
    },
    coordinates: { lat: 24.5854, lng: 73.7125 }
  },
  {
    id: "leh",
    name: "Leh-Ladakh",
    state: "Ladakh",
    tagline: "Land of High Passes \u2022 Monasteries & Starlit Skies",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "May \u2013 September",
    startingBudget: 18e3,
    safetyScore: 88,
    categories: ["Mountains", "Adventure", "Spiritual", "All"],
    temperature: "12\xB0C",
    weatherStatus: "Crisp High-Sun",
    crowdLevel: "Moderate",
    popularActivities: ["Pangong Tso Crystal Lake Drive", "Khardung La Pass Crossing", "Thiksey Morning Chanting", "Nubra Valley Sand Dunes"],
    historicalBrief: {
      history: "Historical stopover on the ancient Silk Route connecting Punjab with Xinjiang and Central Asia.",
      culture: "Mahayana Buddhist culture, Ladakhi apricot festivals, Losar new year, and organic barley farming.",
      architecture: "Leh Palace modeled after Lhasa\u2019s Potala Palace, rammed-earth stupas, and ancient cliff retreats.",
      localTraditions: "Offering white silk Khata scarves to elders and lamas; community solar mud homes.",
      localEtiquette: "Strict zero-waste policy. Drink ample electrolytes and rest the entire first day upon arrival."
    },
    coordinates: { lat: 34.1526, lng: 77.5771 }
  },
  {
    id: "varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    tagline: "The Eternal City \u2022 Sacred Ghats & Evening Aarti",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "October \u2013 March",
    startingBudget: 7500,
    safetyScore: 89,
    categories: ["Spiritual", "Heritage", "Food", "All"],
    temperature: "26\xB0C",
    weatherStatus: "Pleasant River Breeze",
    crowdLevel: "High",
    popularActivities: ["Dawn Subah-e-Banaras Boat Ride", "Dashashwamedh Ghat Maha Aarti", "Sarnath Buddha Enlightenment Site", "Banarasi Silk Weaving Lanes"],
    historicalBrief: {
      history: "One of the oldest continually inhabited cities in human civilization, sacred to Lord Shiva.",
      culture: "Vedic chants, Hindustani classical music (Benares gharana), Banarasi kachori-jalebi, and silk saris.",
      architecture: "Towering riverfront ghat steps built by Maratha, Scindia, and Holkar dynasties, along with narrow galis.",
      localTraditions: "Diyas floating on Mother Ganga, wrestling akharas at dawn, and paan making.",
      localEtiquette: "No photography at Manikarnika cremation ghat. Take boat rides only with registered boatmen."
    },
    coordinates: { lat: 25.3176, lng: 82.9739 }
  },
  {
    id: "rishikesh",
    name: "Rishikesh",
    state: "Uttarakhand",
    tagline: "Yoga Capital of the World \u2022 Ganges Rapids",
    image: "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "September \u2013 May",
    startingBudget: 8e3,
    safetyScore: 95,
    categories: ["Adventure", "Spiritual", "Nature", "All"],
    temperature: "23\xB0C",
    weatherStatus: "Fresh Mountain Valley",
    crowdLevel: "Moderate",
    popularActivities: ["Grade 3+ River Rafting on Ganges", "Triveni Ghat Sunset Aarti", "Beatles Ashram Exploration", "Cliff Jumping in Shivpuri"],
    historicalBrief: {
      history: "Ancient gateway to the Char Dham pilgrimage in the Garhwal Himalayas where sages meditated on the divine.",
      culture: "Sattvic food, yoga ashrams, Ayurvedic healing, and environmental river advocacy.",
      architecture: "Iconic suspension footbridges Laxman Jhula & Ram Jhula spanning the rushing emerald Ganga.",
      localTraditions: "Riverbank sound meditation, temple bell resonance, and organic cafe culture.",
      localEtiquette: "Strictly vegetarian and alcohol-free municipality. Wear lifejackets during all river water activities."
    },
    coordinates: { lat: 30.0869, lng: 78.2676 }
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    state: "Meghalaya",
    tagline: "Abode of the Clouds \u2022 Living Root Bridges & Waterfalls",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "October \u2013 April",
    startingBudget: 13e3,
    safetyScore: 97,
    categories: ["Nature", "Adventure", "Hidden Gems", "All"],
    temperature: "18\xB0C",
    weatherStatus: "Misty Cloud Shrouds",
    crowdLevel: "Low",
    popularActivities: ["Double Decker Living Root Bridge Trek", "Dawki River Crystal Boating", "Nohkalikai Falls Vista", "Mawlynnong Cleanest Village"],
    historicalBrief: {
      history: "Home to the indigenous Khasi, Jaintia, and Garo matrilineal societies deeply connected with sacred groves.",
      culture: "Matrilineal lineage where youngest daughter inherits, bamboo music, and rich community forest preservation.",
      architecture: "Living bio-engineering: Ficus elastica roots woven across generations into durable suspension bridges.",
      localTraditions: "Sacred grove protection rituals, organic bamboo architecture, and community cleanliness drives.",
      localEtiquette: "Leave no footprint. Sacred forests forbid removal of even a fallen leaf."
    },
    coordinates: { lat: 25.467, lng: 91.3662 }
  },
  {
    id: "kolhapur",
    name: "Kolhapur",
    state: "Maharashtra",
    tagline: "Mahalaxmi Sanctum \u2022 Royal Wrestling & Maratha Heritage",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "October \u2013 March",
    startingBudget: 6500,
    safetyScore: 96,
    categories: ["Heritage", "Food", "Spiritual", "All"],
    temperature: "27\xB0C",
    weatherStatus: "Pleasant & Breezy",
    crowdLevel: "Moderate",
    popularActivities: ["Shri Ambabai Mahalaxmi Temple Darshan", "Panhala Fort Bastion Exploration", "Authentic Kolhapuri Misal & Tambda-Pandhra Rassa", "Traditional Wrestling Akhara Visit"],
    historicalBrief: {
      history: "Historic capital of the southern branch of the Maratha Empire, nurtured by the benevolent reformer Chhatrapati Shahu Maharaj.",
      culture: "Valor, traditional wrestling (Kusti), handcrafted GI-tagged Kolhapuri chappals, and silver ornaments.",
      architecture: "Hemadpanthi black basalt stone carvings, New Palace Indo-Saracenic mansion, and historic talabs.",
      localTraditions: "Kusti bouts in red soil pits with clay blessings, Lavani folk theater, and festive Gudi Padwa.",
      localEtiquette: 'Maintain silence inside temple sanctum. Greet elders with "Jai Bhavani, Jai Shivaji".'
    },
    coordinates: { lat: 16.705, lng: 74.2433 }
  },
  {
    id: "pune",
    name: "Pune",
    state: "Maharashtra",
    tagline: "Oxford of the East \u2022 Peshwa Citadels & Hill Treks",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "July \u2013 February",
    startingBudget: 7500,
    safetyScore: 95,
    categories: ["Heritage", "Adventure", "Food", "All"],
    temperature: "25\xB0C",
    weatherStatus: "Gentle Breeze",
    crowdLevel: "Moderate",
    popularActivities: ["Sinhagad Fort Early Morning Trek", "Shaniwar Wada Historical Walk", "Aga Khan Palace Mahatma Gandhi Memorial", "FC Road Street Food Walk"],
    historicalBrief: {
      history: "The prime seat of the Peshwas during the Maratha Empire and later a pivotal center for India\u2019s social reform movements.",
      culture: "Academic excellence, classical music Sawai Gandharva festival, Ganeshotsav dhol-tasha pathaks, and bakery culture.",
      architecture: "Timber-framed wadas with central courtyards, stone fortresses atop Sahyadri peaks, and Gothic-Victorian colleges.",
      localTraditions: "Puneri patte, morning walks to Vetal Tekdi, and sipping Irani chai with bun maska.",
      localEtiquette: "Wear sturdy sports shoes for Sahyadri fort treks. Afternoon siesta culture is respected in old Peth areas."
    },
    coordinates: { lat: 18.5204, lng: 73.8567 }
  },
  {
    id: "kashmir",
    name: "Srinagar & Kashmir",
    state: "Jammu & Kashmir",
    tagline: "Paradise on Earth \u2022 Houseboats & Alpine Meadows",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "April \u2013 October & Winter Snow",
    startingBudget: 15e3,
    safetyScore: 91,
    categories: ["Nature", "Mountains", "Heritage", "All"],
    temperature: "16\xB0C",
    weatherStatus: "Pleasant Valley Air",
    crowdLevel: "Moderate",
    popularActivities: ["Dal Lake Shikara Sunrise Ride", "Mughal Gardens Nishat & Shalimar", "Gulmarg Gondola Ride Phase 2", "Pashmina & Walnut Wood Shopping"],
    historicalBrief: {
      history: "Renowned for centuries as an oasis of poetry, Sufism, and Mughal imperial leisure gardens.",
      culture: "Kashmiri Wazwan banquet, Kahwa saffron green tea, Pashmina shawls, and papier-m\xE2ch\xE9 crafts.",
      architecture: "Intricately carved cedar wood houseboats, Pinjrakari geometric screens, and Jamia Masjid deodar pillars.",
      localTraditions: "Morning floating vegetable market on Dal Lake, Kangri charcoal wicker baskets, and Rouf folk dance.",
      localEtiquette: "Bargain politely in houseboats. Always carry valid photo ID and permit documents in border valleys."
    },
    coordinates: { lat: 34.0837, lng: 74.7973 }
  },
  {
    id: "kerala",
    name: "Kerala Backwaters",
    state: "Kerala",
    tagline: "God\u2019s Own Country \u2022 Palm Canals & Houseboats",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
    bestSeason: "September \u2013 March",
    startingBudget: 11e3,
    safetyScore: 98,
    categories: ["Nature", "Beaches", "Food", "All"],
    temperature: "29\xB0C",
    weatherStatus: "Tropical Breeze",
    crowdLevel: "Moderate",
    popularActivities: ["Alleppey Overnight Kettuvallam Houseboat", "Marari Beach Quiet Sunset", "Kumarakom Bird Sanctuary Kayak", "Authentic Sadhya on Banana Leaf"],
    historicalBrief: {
      history: "Ancient maritime spice hub trading pepper and cardamom with Phoenicians, Romans, and Arabs.",
      culture: "Kathakali classical dance drama, Kalaripayattu martial arts, Vallam Kali snake boat races, and Ayurveda.",
      architecture: "Thatched anjili-wood traditional kettuvallams, Nalukettu wooden courtyards with tiled sloping roofs.",
      localTraditions: "Ayurvedic panchakarma retreats, toddy shop culinary delicacies, and coconut tree climbing.",
      localEtiquette: "Support local coir and canoe operators directly. Do not discard non-biodegradable waste in backwaters."
    },
    coordinates: { lat: 9.4981, lng: 76.3388 }
  }
];
var POI_DATABASE = {
  jaipur: [
    {
      id: "jp-poi-1",
      name: "Sindhi Camp Central Bus Stand",
      category: "Buses",
      distance: "0.8 km",
      distanceKm: 0.8,
      openingHours: "24 Hours \u2022 AC & Deluxe Platforms",
      isVerified: true,
      estimatedPrice: "Interstate Buses \u20B9180 \u2013 \u20B9850",
      contactNumber: "+91 141 220 5555",
      rating: 4.7,
      address: "Station Road, Sindhi Camp, Jaipur",
      coordinates: { lat: 26.9222, lng: 75.7967, x: 38, y: 44 }
    },
    {
      id: "jp-poi-2",
      name: "Polo Victory Prepaid Auto & Rickshaw Stand",
      category: "Rickshaws",
      distance: "0.6 km",
      distanceKm: 0.6,
      openingHours: "24 Hours \u2022 Govt Regulated Prepaid Booth",
      isVerified: true,
      estimatedPrice: "Base \u20B930 + \u20B912/km (Metered)",
      contactNumber: "+91 141 237 0101",
      rating: 4.8,
      address: "Near Polovictory Cinema, Station Road, Jaipur",
      coordinates: { lat: 26.9215, lng: 75.7942, x: 40, y: 46 }
    },
    {
      id: "jp-poi-3",
      name: "Bapu Bazaar Artisan Quarter",
      category: "Bazaars",
      distance: "1.4 km",
      distanceKm: 1.4,
      openingHours: "10:30 AM \u2013 09:00 PM",
      isVerified: true,
      estimatedPrice: "Mojaris \u20B9350 \u2022 Bandhani Dupattas \u20B9450",
      rating: 4.9,
      address: "Bapu Bazaar, Pink City Outer Wall, Jaipur",
      coordinates: { lat: 26.9196, lng: 75.8219, x: 62, y: 55 }
    },
    {
      id: "jp-poi-4",
      name: "Johari Bazaar Gems & Jewellery Market",
      category: "Bazaars",
      distance: "1.6 km",
      distanceKm: 1.6,
      openingHours: "10:30 AM \u2013 08:30 PM",
      isVerified: true,
      estimatedPrice: "Kundan & Silver Filigree Benchmark \u20B9800+",
      rating: 4.8,
      address: "Johari Bazaar Road, Jaipur",
      coordinates: { lat: 26.9212, lng: 75.8256, x: 65, y: 50 }
    },
    {
      id: "jp-poi-5",
      name: "Hawa Mahal (Palace of Winds)",
      category: "Tourist Places",
      distance: "1.8 km",
      distanceKm: 1.8,
      openingHours: "09:00 AM \u2013 05:00 PM",
      isVerified: true,
      estimatedPrice: "Entry: Indian \u20B950 \u2022 Foreigner \u20B9200",
      contactNumber: "+91 141 261 8862",
      rating: 4.95,
      address: "Hawa Mahal Rd, Badi Choupad, Pink City, Jaipur",
      coordinates: { lat: 26.9239, lng: 75.8267, x: 68, y: 48 }
    },
    {
      id: "jp-poi-6",
      name: "City Palace & Maharaja Sawai Man Singh II Museum",
      category: "Tourist Places",
      distance: "2.0 km",
      distanceKm: 2,
      openingHours: "09:30 AM \u2013 05:00 PM / Night Viewing 07:00 PM",
      isVerified: true,
      estimatedPrice: "Entry: Adult \u20B9300 \u2022 Royal Grandeur \u20B92,500",
      contactNumber: "+91 141 408 8888",
      rating: 4.92,
      address: "Gangori Bazaar, J.D.A. Market, Pink City, Jaipur",
      coordinates: { lat: 26.9258, lng: 75.8236, x: 66, y: 42 }
    },
    {
      id: "jp-poi-7",
      name: "Amer Fort & Maota Lake Panorama",
      category: "Tourist Places",
      distance: "4.8 km",
      distanceKm: 4.8,
      openingHours: "08:00 AM \u2013 05:30 PM / Light & Sound 07:30 PM",
      isVerified: true,
      estimatedPrice: "Entry: \u20B9100 \u2022 Light Show \u20B9250",
      contactNumber: "+91 141 253 0264",
      rating: 4.96,
      address: "Devisinghpura, Amer, Jaipur",
      coordinates: { lat: 26.9855, lng: 75.8513, x: 75, y: 15 }
    },
    {
      id: "jp-poi-8",
      name: "ITC Rajputana Luxury Heritage Hotel",
      category: "Hotels",
      distance: "0.9 km",
      distanceKm: 0.9,
      openingHours: "24/7 Concierge & Reception",
      isVerified: true,
      estimatedPrice: "\u20B98,500 \u2013 \u20B916,000 / Night",
      contactNumber: "+91 141 510 0100",
      rating: 4.9,
      address: "Palace Road, Gopalbari, Jaipur",
      coordinates: { lat: 26.9199, lng: 75.7885, x: 35, y: 52 }
    },
    {
      id: "jp-poi-9",
      name: "Zostel Jaipur Backpacker & Nomad Hub",
      category: "Hotels",
      distance: "1.9 km",
      distanceKm: 1.9,
      openingHours: "24/7 Check-in \u2022 Rooftop Cafe",
      isVerified: true,
      estimatedPrice: "Dorm Bed \u20B9799 \u2022 Private Room \u20B92,400",
      contactNumber: "+91 141 260 5500",
      rating: 4.8,
      address: "First Floor, Radhey Kunj, Hawa Mahal Rd, Jaipur",
      coordinates: { lat: 26.922, lng: 75.829, x: 70, y: 53 }
    },
    {
      id: "jp-poi-10",
      name: "Rawat Mishtan Bhandar & Kachori Hub",
      category: "Food",
      distance: "0.5 km",
      distanceKm: 0.5,
      openingHours: "06:00 AM \u2013 10:30 PM",
      isVerified: true,
      estimatedPrice: "Famous Pyaaz Kachori \u20B950 \u2022 Mawa Kachori \u20B975",
      contactNumber: "+91 141 236 6888",
      rating: 4.9,
      address: "Station Road, Opp Polovictory Cinema, Jaipur",
      coordinates: { lat: 26.9208, lng: 75.7925, x: 42, y: 50 }
    },
    {
      id: "jp-poi-11",
      name: "Laxmi Mishtan Bhandar (LMB Pink City)",
      category: "Food",
      distance: "1.5 km",
      distanceKm: 1.5,
      openingHours: "07:00 AM \u2013 11:00 PM",
      isVerified: true,
      estimatedPrice: "Royal Rajasthani Thali \u20B9650 \u2022 Ghewar \u20B9320",
      contactNumber: "+91 141 256 5844",
      rating: 4.85,
      address: "Johari Bazaar, Pink City, Jaipur",
      coordinates: { lat: 26.9225, lng: 75.8242, x: 64, y: 49 }
    },
    {
      id: "jp-poi-12",
      name: "SMS Govt Super Speciality Trauma Hospital",
      category: "Hospitals",
      distance: "2.1 km",
      distanceKm: 2.1,
      openingHours: "24/7 Emergency & Trauma Care Unit",
      isVerified: true,
      estimatedPrice: "Govt Emergency: Free / Subsidized",
      contactNumber: "102 / +91 141 256 0291",
      rating: 4.7,
      address: "Jawahar Lal Nehru Marg, Jaipur",
      coordinates: { lat: 26.9048, lng: 75.8152, x: 60, y: 75 }
    },
    {
      id: "jp-poi-13",
      name: "Indian Oil 24x7 Eco-Fuel & EV Hub",
      category: "Fuel",
      distance: "1.2 km",
      distanceKm: 1.2,
      openingHours: "24 Hours \u2022 High Speed 60kW DC EV Charger",
      isVerified: true,
      estimatedPrice: "EV Fast Charge \u20B918/unit \u2022 Petrol / Diesel",
      rating: 4.6,
      address: "MI Road, Near Panch Batti, Jaipur",
      coordinates: { lat: 26.9155, lng: 75.8012, x: 46, y: 62 }
    },
    {
      id: "jp-poi-14",
      name: "Jaipur Police Tourist Assistance Cell",
      category: "Emergency",
      distance: "1.7 km",
      distanceKm: 1.7,
      openingHours: "24/7 Dedicated Tourist Assistance & Helpdesk",
      isVerified: true,
      estimatedPrice: "Govt Assistance: 100% Free",
      contactNumber: "112 / +91 141 261 4444",
      rating: 4.95,
      address: "Near Hawa Mahal Northern Gate, Jaipur",
      coordinates: { lat: 26.9242, lng: 75.8262, x: 67, y: 46 }
    }
  ],
  manali: [
    {
      id: "mn-poi-1",
      name: "Mall Road Himachal Tourism Taxi Union",
      category: "Rickshaws",
      distance: "0.3 km",
      distanceKm: 0.3,
      openingHours: "06:00 AM \u2013 10:00 PM",
      isVerified: true,
      estimatedPrice: "Solang \u20B91,200 \u2022 Atal Tunnel \u20B92,200 (Fixed Tariff)",
      contactNumber: "+91 1902 252 120",
      rating: 4.9,
      address: "Mall Road Taxi Stand, Manali",
      coordinates: { lat: 32.2422, lng: 77.1891, x: 50, y: 50 }
    },
    {
      id: "mn-poi-2",
      name: "Manali Private Volvo Inter-State Bus Stand",
      category: "Buses",
      distance: "0.6 km",
      distanceKm: 0.6,
      openingHours: "05:00 AM \u2013 11:30 PM",
      isVerified: true,
      estimatedPrice: "Delhi-Manali AC Sleeper \u20B91,100 \u2013 \u20B91,800",
      contactNumber: "+91 1902 252 350",
      rating: 4.7,
      address: "Near Beas River Bank, Siyal, Manali",
      coordinates: { lat: 32.2384, lng: 77.1895, x: 48, y: 55 }
    },
    {
      id: "mn-poi-3",
      name: "Old Manali Himachali Weavers Guild",
      category: "Bazaars",
      distance: "1.2 km",
      distanceKm: 1.2,
      openingHours: "10:00 AM \u2013 08:30 PM",
      isVerified: true,
      estimatedPrice: "Handloom Kullu Shawls \u20B9600 \u2022 Wool Socks \u20B9180",
      rating: 4.8,
      address: "Club House Road, Old Manali",
      coordinates: { lat: 32.252, lng: 77.177, x: 32, y: 35 }
    },
    {
      id: "mn-poi-4",
      name: "Hadimba Devi Temple & Cedar Forest",
      category: "Tourist Places",
      distance: "1.5 km",
      distanceKm: 1.5,
      openingHours: "08:00 AM \u2013 06:00 PM",
      isVerified: true,
      estimatedPrice: "Free Entry \u2022 Photography Allowed",
      rating: 4.9,
      address: "Hadimba Temple Rd, Dungri Village, Manali",
      coordinates: { lat: 32.2483, lng: 77.1805, x: 38, y: 40 }
    },
    {
      id: "mn-poi-5",
      name: "Solang Valley Adventure & Paragliding Arena",
      category: "Tourist Places",
      distance: "4.9 km",
      distanceKm: 4.9,
      openingHours: "09:00 AM \u2013 05:00 PM (Weather Permitting)",
      isVerified: true,
      estimatedPrice: "Paragliding \u20B91,500 \u2013 \u20B93,200 \u2022 Ropeway \u20B9650",
      rating: 4.85,
      address: "Solang Village, Manali",
      coordinates: { lat: 32.3164, lng: 77.1583, x: 25, y: 12 }
    },
    {
      id: "mn-poi-6",
      name: "The Himalayan Luxury Castle & Resort",
      category: "Hotels",
      distance: "1.4 km",
      distanceKm: 1.4,
      openingHours: "24/7 Mountain Lodge Check-in",
      isVerified: true,
      estimatedPrice: "\u20B99,500 \u2013 \u20B918,000 / Night",
      contactNumber: "+91 1902 250 999",
      rating: 4.92,
      address: "Hadimba Road, Manali",
      coordinates: { lat: 32.2472, lng: 77.1824, x: 42, y: 44 }
    },
    {
      id: "mn-poi-7",
      name: "Cafe 1947 by the River Stream",
      category: "Food",
      distance: "1.6 km",
      distanceKm: 1.6,
      openingHours: "11:00 AM \u2013 11:00 PM",
      isVerified: true,
      estimatedPrice: "Woodfired Pizza \u20B9450 \u2022 Himalayan Trout \u20B9650",
      rating: 4.88,
      address: "Old Manali Bridge, Near Club House, Manali",
      coordinates: { lat: 32.2536, lng: 77.1758, x: 30, y: 32 }
    },
    {
      id: "mn-poi-8",
      name: "Civil Hospital Manali & Mountain Trauma Center",
      category: "Hospitals",
      distance: "1.8 km",
      distanceKm: 1.8,
      openingHours: "24/7 Oxygen & Acute High-Altitude Care",
      isVerified: true,
      estimatedPrice: "Govt Emergency Services Free",
      contactNumber: "108 / +91 1902 252 384",
      rating: 4.7,
      address: "Hospital Road, Siyal, Manali",
      coordinates: { lat: 32.2435, lng: 77.1868, x: 47, y: 52 }
    },
    {
      id: "mn-poi-9",
      name: "HPCL High-Altitude Fuel & EV Station",
      category: "Fuel",
      distance: "1.9 km",
      distanceKm: 1.9,
      openingHours: "06:00 AM \u2013 10:30 PM \u2022 Anti-Gel Diesel",
      isVerified: true,
      estimatedPrice: "Winterized Fuel \u2022 30kW EV Point",
      rating: 4.6,
      address: "Leh-Manali Highway, Aleo, Manali",
      coordinates: { lat: 32.2312, lng: 77.1925, x: 55, y: 68 }
    },
    {
      id: "mn-poi-10",
      name: "Manali Police Station & Mountain Helpdesk",
      category: "Emergency",
      distance: "0.4 km",
      distanceKm: 0.4,
      openingHours: "24/7 Dedicated Patrol & Pass Clearance Cell",
      isVerified: true,
      contactNumber: "112 / +91 1902 252 322",
      rating: 4.8,
      address: "Mall Road, Manali",
      coordinates: { lat: 32.241, lng: 77.1879, x: 49, y: 49 }
    }
  ],
  goa: [
    {
      id: "ga-poi-1",
      name: "Panaji KTC Central Bus Terminal",
      category: "Buses",
      distance: "1.1 km",
      distanceKm: 1.1,
      openingHours: "24 Hours \u2022 Electric Bus Lines & Kadamba Express",
      isVerified: true,
      estimatedPrice: "Airport AC Shuttle \u20B9150 \u2022 Local Bus \u20B920",
      contactNumber: "+91 832 243 8515",
      rating: 4.7,
      address: "Patto Centre, Panaji, Goa",
      coordinates: { lat: 15.4989, lng: 73.8345, x: 50, y: 50 }
    },
    {
      id: "ga-poi-2",
      name: "Calangute Tourist Taxi & Scooter Guild",
      category: "Rickshaws",
      distance: "2.5 km",
      distanceKm: 2.5,
      openingHours: "07:00 AM \u2013 11:30 PM",
      isVerified: true,
      estimatedPrice: "Activa Scooter \u20B9400/day \u2022 Fixed Taxi Fare",
      rating: 4.8,
      address: "Calangute Beach Circle, Goa",
      coordinates: { lat: 15.5435, lng: 73.7554, x: 35, y: 40 }
    },
    {
      id: "ga-poi-3",
      name: "Anjuna Wednesday Flea Market",
      category: "Bazaars",
      distance: "3.8 km",
      distanceKm: 3.8,
      openingHours: "Every Wednesday 09:00 AM \u2013 07:00 PM",
      isVerified: true,
      estimatedPrice: "Handmade Jewellery, Macrame, Spices",
      rating: 4.85,
      address: "Monterio Vaddo, Anjuna, Goa",
      coordinates: { lat: 15.5786, lng: 73.7428, x: 28, y: 30 }
    },
    {
      id: "ga-poi-4",
      name: "Fort Aguada & Lighthouse",
      category: "Tourist Places",
      distance: "3.2 km",
      distanceKm: 3.2,
      openingHours: "09:00 AM \u2013 06:00 PM",
      isVerified: true,
      estimatedPrice: "Entry \u20B950",
      rating: 4.9,
      address: "Aguada Fort Area, Candolim, Goa",
      coordinates: { lat: 15.4925, lng: 73.7736, x: 38, y: 55 }
    },
    {
      id: "ga-poi-5",
      name: "Basilica of Bom Jesus (UNESCO)",
      category: "Tourist Places",
      distance: "4.2 km",
      distanceKm: 4.2,
      openingHours: "09:00 AM \u2013 06:30 PM",
      isVerified: true,
      estimatedPrice: "Free Entry \u2022 Audio Guides Available",
      rating: 4.95,
      address: "Old Goa Road, Bainguinim, Goa",
      coordinates: { lat: 15.5009, lng: 73.9116, x: 70, y: 48 }
    },
    {
      id: "ga-poi-6",
      name: "Taj Fort Aguada Resort & Spa",
      category: "Hotels",
      distance: "3.0 km",
      distanceKm: 3,
      openingHours: "24/7 Oceanfront Heritage Service",
      isVerified: true,
      estimatedPrice: "\u20B914,000 \u2013 \u20B928,000 / Night",
      contactNumber: "+91 832 664 5858",
      rating: 4.94,
      address: "Sinquerim, Candolim, Goa",
      coordinates: { lat: 15.498, lng: 73.771, x: 36, y: 52 }
    },
    {
      id: "ga-poi-7",
      name: "Martin's Corner Authentic Goan Culinary",
      category: "Food",
      distance: "4.5 km",
      distanceKm: 4.5,
      openingHours: "11:00 AM \u2013 11:30 PM",
      isVerified: true,
      estimatedPrice: "Goan Fish Curry Thali \u20B9380 \u2022 Crab Xec Xec \u20B9650",
      rating: 4.9,
      address: "Ranvaddo, Betalbatim, Salcete, Goa",
      coordinates: { lat: 15.305, lng: 73.921, x: 65, y: 75 }
    },
    {
      id: "ga-poi-8",
      name: "Goa Medical College & Hospital (GMC Bambolim)",
      category: "Hospitals",
      distance: "3.6 km",
      distanceKm: 3.6,
      openingHours: "24/7 Emergency, Trauma & Marine Sting Care",
      isVerified: true,
      contactNumber: "108 / +91 832 245 8700",
      rating: 4.8,
      address: "NH-66, Bambolim, Goa",
      coordinates: { lat: 15.46, lng: 73.856, x: 55, y: 65 }
    },
    {
      id: "ga-poi-9",
      name: "IOCL Panaji Fast EV & Marine Fuel Hub",
      category: "Fuel",
      distance: "1.4 km",
      distanceKm: 1.4,
      openingHours: "24 Hours \u2022 50kW CCS-2 EV Fast Charger",
      isVerified: true,
      estimatedPrice: "EV Quickcharge \u20B917/unit",
      rating: 4.7,
      address: "Dayanand Bandodkar Marg, Miramar, Panaji",
      coordinates: { lat: 15.485, lng: 73.818, x: 45, y: 55 }
    },
    {
      id: "ga-poi-10",
      name: "Panaji Tourist Police & Marine Rescue Cell",
      category: "Emergency",
      distance: "0.9 km",
      distanceKm: 0.9,
      openingHours: "24/7 Lifeguard Liaison & Tourist Helpdesk",
      isVerified: true,
      contactNumber: "112 / +91 832 242 0821",
      rating: 4.9,
      address: "Patto Plaza, Panaji, Goa",
      coordinates: { lat: 15.495, lng: 73.832, x: 51, y: 49 }
    }
  ]
};
var VERIFIED_DRIVERS = [
  {
    id: "drv-1",
    name: "Rajinder Singh & Sons",
    vehicleType: "4\xD74 High-Altitude Scorpio / Thar",
    isVerified: true,
    tariffType: "Union Registered \u2022 Fixed Tariff",
    estimatedFare: "\u20B92,200 / Full Day Circuit",
    rating: 4.95,
    reviewsCount: 342,
    distance: "0.5 km away",
    availability: "Available Now",
    unionBadge: "Himachal Transport Union #HT-882"
  },
  {
    id: "drv-2",
    name: "Mahesh Meena Eco-Rickshaw",
    vehicleType: "Electric Auto (EV Green Shield)",
    isVerified: true,
    tariffType: "Govt Metered Tariff \u2022 Zero Surge",
    estimatedFare: "\u20B930 base + \u20B912/km",
    rating: 4.89,
    reviewsCount: 512,
    distance: "0.2 km away",
    availability: "Available Now",
    unionBadge: "Jaipur Smart Mobility #JSM-401"
  },
  {
    id: "drv-3",
    name: "Gopal Krishna Cabs",
    vehicleType: "AC Sedan (Innova Crysta / Dzire)",
    isVerified: true,
    tariffType: "Fixed Outstation & Airport Radar",
    estimatedFare: "\u20B914/km \u2022 All Tolls Transparent",
    rating: 4.92,
    reviewsCount: 289,
    distance: "1.1 km away",
    availability: "In 10 Mins",
    unionBadge: "Rajasthan Tourism Permit #RT-9941"
  },
  {
    id: "drv-4",
    name: "Pramod Patil Konkan Rider",
    vehicleType: "Royal Enfield Classic 350 Rental",
    isVerified: true,
    tariffType: "Scam-Free Daily Tariff with Helmets",
    estimatedFare: "\u20B9900 / Day \u2022 Zero Hidden Deposit",
    rating: 4.9,
    reviewsCount: 174,
    distance: "0.8 km away",
    availability: "Available Now",
    unionBadge: "Verified Two-Wheeler Guild #MH-09"
  }
];
var VERIFIED_GUIDES = [
  {
    id: "gd-1",
    name: "Devraj Rathore",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    region: "Jaipur & Amer",
    speciality: "Architectural Historian & Walled City Storyteller",
    isVerified: true,
    rating: 4.98,
    reviewsCount: 420,
    languages: ["Hindi", "English", "French"],
    bio: "14 years of uncovering hidden stepwells, royal secret chambers, and authentic artisan ateliers.",
    hourlyRate: "\u20B9600 / Hour",
    followersCount: 1840
  },
  {
    id: "gd-2",
    name: "Tashi Namgyal",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    region: "Spiti & Ladakh High Plateau",
    speciality: "Wilderness High-Pass Trekker & Wildlife Tracker",
    isVerified: true,
    rating: 4.96,
    reviewsCount: 290,
    languages: ["English", "Hindi", "Ladakhi", "Tibetan"],
    bio: "Born in Kaza. Expert in cold-desert acclimation, high-altitude geology, and Snow Leopard spotting.",
    hourlyRate: "\u20B9950 / Hour",
    followersCount: 3120
  },
  {
    id: "gd-3",
    name: "Ananya Deshpande",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    region: "Western Ghats & Kolhapur",
    speciality: "Maratha Forts & Culinary Heritage Explorer",
    isVerified: true,
    rating: 4.94,
    reviewsCount: 195,
    languages: ["Marathi", "Hindi", "English"],
    bio: "Sahyadri rock mountaineer guiding heritage bastion treks and historic Maratha military history.",
    hourlyRate: "\u20B9550 / Hour",
    followersCount: 1420
  }
];
var ARTISAN_BAZAARS = [
  {
    id: "bz-1",
    name: "Bagru Natural Indigo & Block Print Collective",
    category: "Textiles & Handlooms",
    location: "Bagru Cluster, 24km outside Jaipur",
    isVerified: true,
    priceGuidance: "Direct Weaver Fair Tariff (\u20B9450 \u2013 \u20B91,800)",
    description: "100% natural vegetable dyes with 350-year-old wooden blocks. Directly supports 40 Chippa artisan families.",
    zeroCommission: true,
    specialties: ["Dabu Mud-Resist Fabric", "Indigo Stoles", "Organic Cotton Quilts"],
    image: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bz-2",
    name: "Kullu Shawl & Handloom Weavers Union",
    category: "Wool & Mountain Handlooms",
    location: "Shangarh & Kullu Valley Highway",
    isVerified: true,
    priceGuidance: "Govt GI-Certified Pricing (\u20B9800 \u2013 \u20B94,500)",
    description: "Pure sheep & angora wool with traditional geometric border patterns. Verified anti-synthetic stamp.",
    zeroCommission: true,
    specialties: ["GI-Tagged Kullu Shawls", "Pahari Pattus", "Pure Woolen Socks"],
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bz-3",
    name: "Kolhapur Historic Chappal Artisans Galli",
    category: "Leather Craft & Footwear",
    location: "Bhausinghji Road, Kolhapur",
    isVerified: true,
    priceGuidance: "Hand-Stitched Direct Benchmark (\u20B9500 \u2013 \u20B91,600)",
    description: "Authentic vegetable-tanned leather footwear handcrafted without metal nails using traditional babul bark dye.",
    zeroCommission: true,
    specialties: ["GI Kolhapuri Chappals", "Braided Belts", "Traditional Mojaris"],
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
  }
];
var TRAVEL_GROUPS = [
  {
    id: "grp-1",
    name: "Himalayan High Altitude Backpackers",
    destination: "Spiti & Chandratal Lake",
    travelDates: "Sep 22 \u2013 Sep 29",
    membersCount: 8,
    maxMembers: 12,
    travelStyle: "Adventure",
    leaderName: "Arjun K. (HMI Certified)",
    description: "Autonomous camper group crossing Kunzum Pass with shared 4x4 transport and homestay logistics.",
    isVerifiedGroup: true
  },
  {
    id: "grp-2",
    name: "Rajasthan Royal Heritage & Food Explorers",
    destination: "Jaipur & Udaipur",
    travelDates: "Oct 14 \u2013 Oct 20",
    membersCount: 7,
    maxMembers: 10,
    travelStyle: "Heritage",
    leaderName: "Pooja Verma",
    description: "Heritage walks, early morning architectural photography, and discovering authentic walled-city food stalls.",
    isVerifiedGroup: true
  },
  {
    id: "grp-3",
    name: "Western Ghats Monsoon Trekkers",
    destination: "Munnar & Kolhapur Sahyadris",
    travelDates: "Nov 02 \u2013 Nov 06",
    membersCount: 6,
    maxMembers: 8,
    travelStyle: "Nature",
    leaderName: "Vikram Shinde",
    description: "Exploring ancient Maratha ridge lines, mist-covered tea terraces, and local farm stays.",
    isVerifiedGroup: true
  }
];
var TRAVELLER_REVIEWS = [
  {
    id: "rev-1",
    userName: "Kavita Iyer",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    date: "3 days ago",
    travelType: "Solo Female Explorer",
    destination: "Jaipur",
    reviewText: "Apna Route\u2019s timing conflict alert saved my morning! It flagged that Amer Fort opens early at 8:00 AM before tour bus crowds. The verified prepaid auto radar gave scam-free pricing.",
    verifiedVisit: true,
    sentiment: "positive",
    images: [
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    id: "rev-2",
    userName: "Aakash Mehra",
    userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    date: "1 week ago",
    travelType: "Roadtripper & Adventure",
    destination: "Manali & Atal Tunnel",
    reviewText: "The route safety intelligence was spot-on. It warned of black ice near the north portal before morning 9 AM and suggested a delayed departure. 10/10 safety reassurance.",
    verifiedVisit: true,
    sentiment: "positive",
    images: [
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    id: "rev-3",
    userName: "Sneha & Rohan Patel",
    userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    rating: 4.5,
    date: "2 weeks ago",
    travelType: "Family Vacation",
    destination: "Munnar",
    reviewText: "Clean and informative itinerary. The smart packing radar suggested water-resistant jackets and leech gaiters for rainforest trails, which was incredibly helpful.",
    verifiedVisit: true,
    sentiment: "positive",
    images: [
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80"
    ]
  }
];
var DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "September Travel Index Active",
    message: "High altitude passes in Spiti & Ladakh enter optimal autumn visibility. Clear skies expected.",
    severity: "success",
    timestamp: "10 mins ago",
    isRead: false
  },
  {
    id: "notif-2",
    title: "Route Safety Alert: Rohtang / Atal Tunnel",
    message: "Morning road maintenance cleared. Safe transit confirmed by Border Roads Organisation.",
    severity: "info",
    timestamp: "1 hour ago",
    isRead: false
  },
  {
    id: "notif-3",
    title: "Weather Advisory: Coastal High Tides",
    message: "Monsoon withdrawal brings gentle 0.8m surf along Goa and Konkan coastlines.",
    severity: "warning",
    timestamp: "3 hours ago",
    isRead: true
  }
];
var STATE_ADVISORIES = [
  {
    state: "Rajasthan",
    stateCode: "RJ",
    advisoryLevel: "Green",
    permitsRequired: "None for Indian citizens. Foreign nationals require Protected Area Permit only for restricted border zones near Jaisalmer border.",
    monsoonWinterAdvisories: "Peak tourist winter season (Oct\u2013Mar). Desert nighttime temperatures can drop to 6\xB0C; carry warm layers.",
    roadConditionRating: "Excellent 4-lane & 6-lane expressways (NH-48, Delhi-Mumbai Expressway).",
    culturalNorms: "Remove shoes at temple premises, modest attire recommended at religious shrines, avoid public displays of affection in traditional areas.",
    emergencyNumbers: {
      police: "100 / 112",
      ambulance: "102 / 108",
      touristPolice: "0141-2822863"
    }
  },
  {
    state: "Himachal Pradesh",
    stateCode: "HP",
    advisoryLevel: "Green",
    permitsRequired: "Rohtang Pass Permit required for tourist vehicles via Manali. Green Tax entry applicable.",
    monsoonWinterAdvisories: "Autumn (Sept-Nov) has crisp blue skies and low landslide hazard. Winter brings heavy snowfall; snow chains required on passes.",
    roadConditionRating: "Four-lane Kiratpur-Manali highway operational. Atal Tunnel open 24x7 with standard clearance.",
    culturalNorms: "Respect sacred village devta rules. Do not touch temple stones or wood carvings without permission.",
    emergencyNumbers: {
      police: "112",
      ambulance: "108",
      touristPolice: "0177-2625924"
    }
  },
  {
    state: "Ladakh (UT)",
    stateCode: "LA",
    advisoryLevel: "Green",
    permitsRequired: "Inner Line Permit (ILP) required for Nubra Valley, Pangong Tso, and Tso Moriri. Easily obtained online in 10 minutes.",
    monsoonWinterAdvisories: "Zoji La & Manali-Leh corridors subject to seasonal winter closure starting mid-November. Flight access available year-round.",
    roadConditionRating: "Border Roads Organisation (BRO) maintains high-quality paved surfaces along major defense highways.",
    culturalNorms: "Circumambulate chortens and mani walls clockwise. Do not smoke or litter near sacred stupas.",
    emergencyNumbers: {
      police: "112",
      ambulance: "102",
      touristPolice: "01982-258880"
    }
  },
  {
    state: "Kerala",
    stateCode: "KL",
    advisoryLevel: "Green",
    permitsRequired: "None for general tourism. Forest department trekking passes required for Eravikulam & Periyar tiger reserves.",
    monsoonWinterAdvisories: "Post-monsoon freshness makes September to March the prime backwaters & Ayurvedic rejuvenation window.",
    roadConditionRating: "Smooth coastal highways (NH-66 expansion underway). Winding scenic ghat passes in Munnar & Wayanad.",
    culturalNorms: "Traditional mundu or dhoti dress code required at select historic temples (like Padmanabhaswamy).",
    emergencyNumbers: {
      police: "112",
      ambulance: "108",
      touristPolice: "0471-2322525"
    }
  },
  {
    state: "Meghalaya",
    stateCode: "ML",
    advisoryLevel: "Green",
    permitsRequired: "None for domestic travelers. Registration at entry checkpost (Meghalaya Tourism App) recommended.",
    monsoonWinterAdvisories: "October to April brings crystal clear waters in Dawki (Umngot River) and optimal trekking conditions.",
    roadConditionRating: "Well-maintained Shillong bypass and Guwahati-Shillong 4-lane expressway.",
    culturalNorms: "Respect sacred groves (Mawphlang). Strictly follow zero-plastic norms in Mawlynnong village.",
    emergencyNumbers: {
      police: "112",
      ambulance: "108",
      touristPolice: "0364-2500733"
    }
  },
  {
    state: "Goa",
    stateCode: "GA",
    advisoryLevel: "Green",
    permitsRequired: "None. Valid driving license mandatory for scooter and car rentals.",
    monsoonWinterAdvisories: "Sea swimming permitted only in red-and-yellow flagged zones supervised by Drishti Marine Lifeguards.",
    roadConditionRating: "Paved state highways; beware of narrow village curves in Old Goa and Siolim.",
    culturalNorms: "Swimwear permitted exclusively on beach areas; casual modest attire required in market towns and heritage churches.",
    emergencyNumbers: {
      police: "112",
      ambulance: "108",
      touristPolice: "0832-2420821"
    }
  }
];
var SEASONAL_DATA = {
  Winter: {
    season: "Winter",
    months: "December \u2013 February",
    description: "Crisp sunshine in Rajasthan & South India, snow passes in the Himalayas, and pleasant tropical warmth on the coasts.",
    climateHighlights: "Comfortable day temperatures (18\xB0C\u201324\xB0C in plains), low humidity, pristine starlit nights, and snow sports in hill stations.",
    temperatureRange: "4\xB0C to 26\xB0C",
    recommendedDestinations: [
      {
        id: "jaipur",
        name: "Jaipur",
        state: "Rajasthan",
        tagline: "The Pink City \u2022 Forts, Royal Craft & Winter Festivals",
        startingBudget: 9e3,
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Mild 22\xB0C afternoons perfect for exploring Amer Fort ramparts, royal bazaars, and attending the Jaipur Literature Festival.",
        safetyAdvisory: "Pleasant daytime visibility; carry light jackets for desert evening temperature drops."
      },
      {
        id: "manali",
        name: "Manali & Solang",
        state: "Himachal Pradesh",
        tagline: "Snow Wonderland \u2022 Skiing, Snowboarding & Pine Forests",
        startingBudget: 11500,
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Active snowfall, skiing at Solang Valley, cozy wooden fireplace cafes in Old Manali, and clear snow vistas through Atal Tunnel.",
        safetyAdvisory: "Use anti-skid tire chains on Rohtang/Solang approaches. Pack thermal base layers."
      },
      {
        id: "goa",
        name: "Goa Coast",
        state: "Goa",
        tagline: "Sun-kissed Beaches \u2022 Susegad Culture & Sunset Markets",
        startingBudget: 12e3,
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Peak coastal season with calm turquoise seas, lively flea markets, water sports, and vibrant music culture.",
        safetyAdvisory: "Book stays in advance. Swim only in lifeguard-patrolled zones marked by flags."
      },
      {
        id: "varanasi",
        name: "Varanasi",
        state: "Uttar Pradesh",
        tagline: "The Sacred Ghats \u2022 Morning Mist & Evening Aarti",
        startingBudget: 7500,
        image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Atmospheric morning mist over Mother Ganga, comfortable boat rides, hot malaiyo sweet delicacy available only in winter.",
        safetyAdvisory: "Fog can cause rail/flight delays in late December and early January."
      }
    ]
  },
  Summer: {
    season: "Summer",
    months: "March \u2013 May",
    description: "Escape the heat to pristine high-altitude passes, tea estate hill stations, and alpine river valleys.",
    climateHighlights: "Cool mountain air (12\xB0C\u201322\xB0C), long daylight hours for outdoor adventures, and river rafting season.",
    temperatureRange: "10\xB0C to 24\xB0C in Hills",
    recommendedDestinations: [
      {
        id: "leh",
        name: "Leh-Ladakh",
        state: "Ladakh",
        tagline: "Land of High Passes \u2022 Khardung La & Pangong Tso",
        startingBudget: 18e3,
        image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
        whyVisit: "High Himalayan passes reopen in May. Crystal blue Pangong Tso, Nubra valley sand dunes, and vibrant monastery festivals.",
        safetyAdvisory: "Mandatory 48-hour acclimatization in Leh town before crossing Khardung La or Chang La."
      },
      {
        id: "spiti",
        name: "Spiti Valley",
        state: "Himachal Pradesh",
        tagline: "The Middle Land \u2022 Ancient Monasteries & Stargazing",
        startingBudget: 16e3,
        image: "https://images.unsplash.com/photo-1590740608670-201a0fd7ff63?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Cold-desert routes accessible via Shimla/Kinnaur. Highest post office Hikkim and Chandratal camping open in summer.",
        safetyAdvisory: "Keep offline maps and emergency cash; mobile connectivity is limited to BSNL/Jio in Kaza."
      },
      {
        id: "munnar",
        name: "Munnar",
        state: "Kerala",
        tagline: "Emerald Tea Terraces \u2022 Misty Western Ghats",
        startingBudget: 9500,
        image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Delightful 18\xB0C\u201322\xB0C mountain breeze, aromatic tea plantation tours, trekking in Eravikulam National Park.",
        safetyAdvisory: "Afternoon mist requires slow driving on hairpin curves."
      },
      {
        id: "rishikesh",
        name: "Rishikesh",
        state: "Uttarakhand",
        tagline: "Ganges Rapids \u2022 Yoga & High Adventure",
        startingBudget: 8e3,
        image: "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Peak river rafting and cliff jumping season on emerald green Himalayan rapids. International yoga retreats.",
        safetyAdvisory: "Wear certified life jackets and helmets for all grade 3+ river rapids."
      }
    ]
  },
  Monsoon: {
    season: "Monsoon",
    months: "June \u2013 September",
    description: "Witness nature at its most dramatic: roaring Sahyadri waterfalls, lush Western Ghats, and misty emerald valleys.",
    climateHighlights: "Lush greenery, misty hill peaks, active waterfalls, and discounted off-season luxury resort tariffs.",
    temperatureRange: "19\xB0C to 28\xB0C",
    recommendedDestinations: [
      {
        id: "meghalaya",
        name: "Meghalaya",
        state: "Meghalaya",
        tagline: "Abode of the Clouds \u2022 Roaring Waterfalls & Root Bridges",
        startingBudget: 13e3,
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Witness Nohkalikai and Seven Sisters falls in their thundering full glory. Cherrapunji is magic under cloud shrouds.",
        safetyAdvisory: "Carry waterproof dry bags, anti-leech socks for jungle treks, and sturdy rain gear."
      },
      {
        id: "pune",
        name: "Pune & Sahyadris",
        state: "Maharashtra",
        tagline: "Maratha Citadel Treks \u2022 Cascading Ghats & Misal",
        startingBudget: 7500,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Sinhagad, Rajgad and Tamhini Ghat erupt in hundreds of silver waterfalls. Hot kanda bhaji and tea at fort top.",
        safetyAdvisory: "Beware of slippery basalt rock faces on Sahyadri trails; wear trekking shoes with deep treads."
      },
      {
        id: "udaipur",
        name: "Udaipur (Monsoon Palace)",
        state: "Rajasthan",
        tagline: "Sajjangarh Clouds \u2022 Full Lakes & Romantic Palaces",
        startingBudget: 10500,
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Lake Pichola and Fateh Sagar overflow with cool rain. Sajjangarh Monsoon Palace sits above dramatic cloud formations.",
        safetyAdvisory: "Boat cruises operate based on wind advisories; check with jetty operators."
      },
      {
        id: "kolhapur",
        name: "Kolhapur",
        state: "Maharashtra",
        tagline: "Panhala Bastions \u2022 Radhanagari Greenery & Tambda Rassa",
        startingBudget: 6500,
        image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Panhala fort enveloped in thick mist. Lush bison sanctuaries and traditional warm fiery cuisine during rains.",
        safetyAdvisory: "Watch for sudden fog on Panhala-Pawankhind mountain routes."
      }
    ]
  },
  Autumn: {
    season: "Autumn",
    months: "October \u2013 November",
    description: "Golden hour season with festive lights, clear mountain skies, and post-monsoon waterfalls still flowing strong.",
    climateHighlights: "Crisp sunny days, zero monsoon rainfall, crystal-clear Himalayan visibility, and festive celebrations.",
    temperatureRange: "16\xB0C to 28\xB0C",
    recommendedDestinations: [
      {
        id: "kashmir",
        name: "Srinagar & Kashmir",
        state: "Jammu & Kashmir",
        tagline: "Chinar Golden Foliage \u2022 Dal Lake & Houseboats",
        startingBudget: 15e3,
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Mughal Gardens turn fiery crimson and amber as Chinar leaves change color. Pristine Dal Lake shikara rides in crisp autumn sun.",
        safetyAdvisory: "Night temperatures drop sharply towards 4\xB0C by November; bring heavy woolens."
      },
      {
        id: "kerala",
        name: "Kerala Backwaters",
        state: "Kerala",
        tagline: "God\u2019s Own Country \u2022 Houseboats & Palm Canals",
        startingBudget: 11e3,
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Post-monsoon freshness makes October and November ideal for tranquil Alleppey kettuvallam cruises and Ayurvedic wellness.",
        safetyAdvisory: "Book verified houseboats that adhere to zero plastic and eco-sanitation norms."
      },
      {
        id: "jaipur",
        name: "Jaipur",
        state: "Rajasthan",
        tagline: "Diwali Illuminations \u2022 Palaces & Rooftop Dining",
        startingBudget: 9e3,
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
        whyVisit: "The walled city is adorned with miles of golden fairy lights during Diwali. Ideal weather for outdoor terrace dining.",
        safetyAdvisory: "High tourist footfall around festival weekends; pre-book heritage entry tickets."
      },
      {
        id: "rishikesh",
        name: "Rishikesh",
        state: "Uttarakhand",
        tagline: "Spiritual Clean Air \u2022 Clear Ganges & Evening Bells",
        startingBudget: 8e3,
        image: "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=800&q=80",
        whyVisit: "Post-monsoon Ganges waters turn crystal turquoise. Ideal season for yoga teacher training and mountain biking.",
        safetyAdvisory: "River water is chilly in late November; wear wetsuits during rafting."
      }
    ]
  }
};
var TRAVELER_COMPANIONS = [
  {
    id: "trv-1",
    name: "Rohan Sharma",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    location: "Delhi",
    destination: "Jaipur",
    dates: "Oct 12 \u2013 Oct 16",
    budget: 12e3,
    budgetFormatted: "\u20B912,000 / person",
    travelStyle: "Heritage",
    interests: ["Photography", "Heritage Walks", "Street Food", "Fort Treks"],
    bio: "Architectural photographer visiting Jaipur for stepwells & sunrise at Amer Fort. Looking for 1-2 companions to split private cab and explore heritage bazaars.",
    compatibilityScore: 96,
    isVerified: true,
    groupType: "Solo",
    contactAvailable: true
  },
  {
    id: "trv-2",
    name: "Ananya Deshmukh",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    location: "Mumbai",
    destination: "Manali",
    dates: "Dec 20 \u2013 Dec 26",
    budget: 16500,
    budgetFormatted: "\u20B916,500 / person",
    travelStyle: "Adventure",
    interests: ["Skiing", "Snow Treks", "Cafe Hopping", "Atal Tunnel"],
    bio: "Software engineer & weekend hiker heading to Manali for fresh winter snow! Planning a day trip through Atal Tunnel to Sissu and skiing at Solang.",
    compatibilityScore: 92,
    isVerified: true,
    groupType: "Solo",
    contactAvailable: true
  },
  {
    id: "trv-3",
    name: "Pooja & Sneha",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    location: "Bengaluru",
    destination: "Goa",
    dates: "Nov 18 \u2013 Nov 23",
    budget: 14e3,
    budgetFormatted: "\u20B914,000 / person",
    travelStyle: "Nature",
    interests: ["Sunset Kayaking", "Heritage Fontainhas", "Artisan Flea", "Seafood"],
    bio: "Two design friends looking for other solo female travelers or a duo to share a quaint Portuguese villa stay in Assagao and rent scooters together.",
    compatibilityScore: 89,
    isVerified: true,
    groupType: "Women Only",
    contactAvailable: true
  },
  {
    id: "trv-4",
    name: "Vikram & Friends",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    location: "Pune",
    destination: "Munnar",
    dates: "Sep 28 \u2013 Oct 02",
    budget: 11e3,
    budgetFormatted: "\u20B911,000 / person",
    travelStyle: "Nature",
    interests: ["Tea Terraces", "Trekking", "Wildlife", "Spice Plantations"],
    bio: "Group of 3 engineers traveling from Kochi airport in a hired Innova. Looking for 1-2 fellow travelers to join our vehicle and share fuel/rental costs.",
    compatibilityScore: 94,
    isVerified: true,
    groupType: "Small Group (3-5)",
    contactAvailable: true
  },
  {
    id: "trv-5",
    name: "Arjun Sen",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    location: "Kolkata",
    destination: "Varanasi",
    dates: "Nov 04 \u2013 Nov 08",
    budget: 8500,
    budgetFormatted: "\u20B98,500 / person",
    travelStyle: "Spiritual",
    interests: ["Boat Rides", "Aarti Ceremonies", "Classical Music", "Silk Weaving"],
    bio: "Documentary enthusiast exploring the historic ghats and weavers colony in Sarnath. Would love a curious travel buddy to share boat hire at dawn.",
    compatibilityScore: 88,
    isVerified: true,
    groupType: "Solo",
    contactAvailable: true
  },
  {
    id: "trv-6",
    name: "Tanvi & Rahul",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
    location: "Hyderabad",
    destination: "Udaipur",
    dates: "Oct 24 \u2013 Oct 28",
    budget: 15e3,
    budgetFormatted: "\u20B915,000 / person",
    travelStyle: "Heritage",
    interests: ["Lake Pichola Boat", "City Palace", "Folk Dance", "Rooftop Cafes"],
    bio: "Duo passionate about Rajasthani folk music, miniature art workshops, and lakeside sunsets. Welcoming couple or solo companions.",
    compatibilityScore: 91,
    isVerified: true,
    groupType: "Duo",
    contactAvailable: true
  }
];
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}
var DESTINATION_PHOTOS = [
  {
    id: "photo_goa_1",
    destination_id: "goa",
    destination_name: "Goa",
    user_id: "usr_ar_101",
    user_name: "Ananya Sharma",
    photo_url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80",
    caption: "Golden sunset over Palolem Beach with gentle waves and calm waters.",
    created_at: "2026-09-03T18:45:00.000Z"
  },
  {
    id: "photo_goa_2",
    destination_id: "goa",
    destination_name: "Goa",
    user_id: "usr_ar_102",
    user_name: "Kunal Deshmukh",
    photo_url: "https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1000&q=80",
    caption: "Heritage Portuguese villa facade in the historic Fontainhas Latin Quarter.",
    created_at: "2026-09-02T11:20:00.000Z"
  },
  {
    id: "photo_goa_3",
    destination_id: "goa",
    destination_name: "Goa",
    user_id: "usr_ar_103",
    user_name: "Pooja Nair",
    photo_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    caption: "Quiet morning walk along the pristine sands of Morjim Beach.",
    created_at: "2026-08-31T07:15:00.000Z"
  },
  {
    id: "photo_jpr_1",
    destination_id: "jaipur",
    destination_name: "Jaipur",
    user_id: "usr_ar_201",
    user_name: "Rohan Mehra",
    photo_url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1000&q=80",
    caption: "Hawa Mahal glowing in the soft amber dawn light.",
    created_at: "2026-09-03T06:30:00.000Z"
  },
  {
    id: "photo_jpr_2",
    destination_id: "jaipur",
    destination_name: "Jaipur",
    user_id: "usr_ar_202",
    user_name: "Meera Rajput",
    photo_url: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=1000&q=80",
    caption: "Amer Fort sandstone ramparts reflected in calm waters.",
    created_at: "2026-09-01T15:10:00.000Z"
  },
  {
    id: "photo_mnl_1",
    destination_id: "manali",
    destination_name: "Manali",
    user_id: "usr_ar_301",
    user_name: "Vikram Thakur",
    photo_url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80",
    caption: "Pine ridges and mountain snow along Solang Valley.",
    created_at: "2026-09-02T14:00:00.000Z"
  }
];

// server/gemini.ts
import { GoogleGenAI } from "@google/genai";
var aiClient = null;
var quotaExhaustedUntil = 0;
function isQuotaAvailable() {
  return Date.now() >= quotaExhaustedUntil;
}
function handleGeminiError(action, error) {
  const errMsg = String(error?.message || error?.status || error);
  if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota") || errMsg.includes("Quota exceeded") || errMsg.includes("rate-limit")) {
    quotaExhaustedUntil = Date.now() + 60 * 1e3;
    console.log(`[Apna Route AI] Quota limit reached for ${action}. Activating instant high-performance local intelligence engine.`);
  } else {
    console.log(`[Apna Route AI] Notice for ${action}: fallback engine active.`);
  }
}
async function withTimeout(promise, ms = 4500) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`API request timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}
async function generateItineraryWithAI(params) {
  const ai = getGenAI();
  const destObj = DESTINATIONS.find(
    (d) => d.name.toLowerCase() === params.destination.toLowerCase() || d.id === params.destination.toLowerCase()
  ) || DESTINATIONS[0];
  const days = Math.min(Math.max(params.durationDays || 4, 2), 7);
  const totalBudget = params.budget || 1e4;
  if (ai && isQuotaAvailable()) {
    try {
      const prompt = `You are the lead travel intelligence engine of APNA ROUTE ("Your Journey. Your Route."), India's next-gen travel & safety operating system.
Generate a structured JSON travel itinerary for India based on:
- Origin: ${params.from || "New Delhi"}
- Destination: ${destObj.name}, ${destObj.state}
- Duration: ${days} days
- Travelers: ${params.travelers}
- Style: ${params.style}
- Target Budget: \u20B9${totalBudget} per traveler

Requirements:
Return ONLY a valid JSON object matching this schema:
{
  "title": "${(params.from || "NEW DELHI").toUpperCase()} \u2192 ${destObj.name.toUpperCase()}",
  "tiers": {
    "budget": {
      "name": "BUDGET PLAN",
      "tag": "Backpacker & Local Transit",
      "estimatedCost": ${Math.round(totalBudget * 0.88)},
      "summary": "Authentic backpacker hostels, sleeper/express trains, shared jeeps, and local dhabas.",
      "stayType": "Verified Hostels & Homestays",
      "transitType": "Train + Shared Local Transit",
      "perks": ["Low carbon footprint", "Community hostels", "Raw cultural immersion"]
    },
    "balanced": {
      "name": "BALANCED PLAN",
      "tag": "Recommended \u2022 Comfort & Value",
      "estimatedCost": ${totalBudget},
      "summary": "Curated 3-star boutique stays, AC 3-Tier/Vande Bharat, and verified local cabs.",
      "stayType": "Heritage Haveli / Boutique Stay",
      "transitType": "AC Express / Prepaid Cabs",
      "perks": ["Timing conflict protection", "Curated food spots", "Private guide access"]
    },
    "premium": {
      "name": "PREMIUM PLAN",
      "tag": "Luxury Heritage & Private Transit",
      "estimatedCost": ${Math.round(totalBudget * 1.55)},
      "summary": "Heritage luxury palaces, dedicated private 4x4 chauffeur, and elite concierge access.",
      "stayType": "Luxury Palace / 5-Star Resort",
      "transitType": "Private Chauffeur & Flight/Vistara",
      "perks": ["Dedicated emergency line", "VIP monument entry", "Private culinary tastings"]
    }
  },
  "timingConflicts": [
    {
      "title": "Early Train Arrival Clash",
      "severity": "medium",
      "issue": "Your morning transit arrives at 06:15 AM while hotel check-in begins at 12:00 PM.",
      "solution": "Use the Station Cloakroom or partner lounge for luggage storage, catch sunrise at a morning viewpoint, then check-in."
    }
  ],
  "routeSafety": {
    "status": "SAFE",
    "score": 93,
    "travelTime": "4h 45m",
    "distance": "265 km",
    "roadCondition": "Smooth 4-lane expressway with CCTV monitoring & rest plazas",
    "terrain": "Plains / Gentle gradient",
    "riskFactors": ["Peak evening toll plaza delays"],
    "advisory": "Maintain steady 80 km/h cruising on national highways."
  },
  "climate": {
    "temperature": 27,
    "feelsLike": 29,
    "skyCondition": "Warm & Clear",
    "rainChance": 8,
    "humidity": 68,
    "windSpeed": 12,
    "aqi": { "value": 78, "status": "Moderate" },
    "warnings": ["Moderate midday UV index\u2014wear sun protection"]
  },
  "smartPacking": [
    "Light breathable cottons",
    "Comfortable walking shoes with grip",
    "Reusable insulated water flask",
    "UPI payment apps & minimal emergency cash",
    "Power bank (10,000mAh+)",
    "Prescribed medications and ORS sachets"
  ],
  "costBreakdown": {
    "transport": ${Math.round(totalBudget * 0.3)},
    "stay": ${Math.round(totalBudget * 0.35)},
    "food": ${Math.round(totalBudget * 0.2)},
    "activities": ${Math.round(totalBudget * 0.1)},
    "miscellaneous": ${Math.round(totalBudget * 0.05)},
    "total": ${totalBudget}
  },
  "bestVisitingTime": {
    "months": "${destObj.bestSeason}",
    "visitingHours": "07:30 AM \u2013 11:30 AM & 04:30 PM \u2013 07:00 PM",
    "crowd": "${destObj.crowdLevel}",
    "weather": "${destObj.weatherStatus}",
    "safety": "High safety rating with dedicated tourist helpline"
  },
  "dailyItinerary": [
    {
      "dayNumber": 1,
      "dayTitle": "Arrival & Historic Walled City Introduction",
      "highlight": "Heritage Gateway & Night Market Illuminations",
      "activities": [
        {
          "time": "08:30 AM",
          "place": "${destObj.name} Central Gateway & Heritage Square",
          "category": "Heritage Landmark",
          "approxEntry": "Free",
          "distance": "1.2 km from transit hub",
          "description": "Orientation walk through the vibrant heritage market with tea at a historic stall.",
          "safetyNote": "Keep valuables in secure front bag in bustling bazaars."
        },
        {
          "time": "01:30 PM",
          "place": "Traditional Culinary Thali House",
          "category": "Food Culture",
          "approxEntry": "\u20B9280 per person",
          "distance": "0.5 km",
          "description": "Authentic regional lunch celebrating local spices and recipes.",
          "safetyNote": "Drink packaged or RO purified water."
        },
        {
          "time": "05:00 PM",
          "place": "Sunset Panoramic Bastion Point",
          "category": "Scenic Viewpoint",
          "approxEntry": "\u20B950",
          "distance": "4.5 km",
          "description": "Catch breathtaking dusk views over the cityscape as twilight sets.",
          "safetyNote": "Return before darkness on uneven stone stairways."
        }
      ]
    }
  ]
}`;
      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        }),
        4500
      );
      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          id: `trip-${Date.now()}`,
          title: parsed.title || `${(params.from || "NEW DELHI").toUpperCase()} \u2192 ${destObj.name.toUpperCase()}`,
          from: params.from || "New Delhi",
          destination: destObj.name,
          durationDays: days,
          travelers: params.travelers,
          style: params.style,
          selectedTier: "balanced",
          tiers: parsed.tiers,
          timingConflicts: parsed.timingConflicts || [],
          routeSafety: parsed.routeSafety,
          climate: parsed.climate,
          smartPacking: parsed.smartPacking,
          costBreakdown: parsed.costBreakdown,
          bestVisitingTime: parsed.bestVisitingTime,
          dailyItinerary: parsed.dailyItinerary,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
    } catch (err) {
      handleGeminiError("Itinerary Generation", err);
    }
  }
  return generateHeuristicItinerary(params, destObj, days, totalBudget);
}
function generateHeuristicItinerary(params, destObj, days, totalBudget) {
  const isHighAltitude = ["manali", "spiti", "leh", "kashmir"].includes(destObj.id);
  const isBeach = destObj.id === "goa" || destObj.id === "kerala";
  const dailyItinerary = [];
  for (let i = 1; i <= days; i++) {
    const act1 = destObj.popularActivities[(i - 1) % destObj.popularActivities.length] || "Morning Heritage Walk";
    const act2 = destObj.popularActivities[i % destObj.popularActivities.length] || "Local Artisan Bazaar Exploration";
    dailyItinerary.push({
      dayNumber: i,
      dayTitle: i === 1 ? `Day 1: Arrival & ${destObj.name} Cultural Immersion` : i === days ? `Day ${i}: Grand Finale & Curated Shopping` : `Day ${i}: Unexplored Trails & Authentic Cuisine`,
      highlight: i === 1 ? "Orientation & Scenic Sunset" : i === days ? "Artisan Souvenirs & Farewell Feast" : "Hidden Gem Waypoint",
      activities: [
        {
          id: `d${i}-a1`,
          time: "08:30 AM",
          place: `${destObj.name} Landmark - ${act1}`,
          category: isHighAltitude ? "Mountain Exploration" : isBeach ? "Coastal Circuit" : "Heritage Landmark",
          approxEntry: "\u20B9150 \u2013 \u20B9300",
          distance: "2.5 km",
          description: `Early morning start at ${act1}. Beat daytime queues and enjoy the crisp morning atmosphere.`,
          safetyNote: isHighAltitude ? "Drink plenty of water; keep warm layers handy." : "Sun protection and hydration recommended."
        },
        {
          id: `d${i}-a2`,
          time: "01:30 PM",
          place: "Heritage Food Lane & Verified Thali Joint",
          category: "Food Culture",
          approxEntry: "\u20B9250 \u2013 \u20B9400",
          distance: "1.2 km",
          description: "Savor regional culinary specialties at a verified zero-scam local establishment.",
          safetyNote: "Choose freshly cooked dishes and certified bottled/filtered water."
        },
        {
          id: `d${i}-a3`,
          time: "04:30 PM",
          place: `${act2} & Verified Bazaars`,
          category: "Cultural Discovery",
          approxEntry: "Free / Variable",
          distance: "3.0 km",
          description: `Afternoon engagement with ${act2}. Discover local handicrafts with direct-artisan pricing.`,
          safetyNote: "Verify meter tariff or use Apna Route pre-checked transport."
        }
      ]
    });
  }
  const budgetTier = Math.round(totalBudget * 0.9);
  const balancedTier = totalBudget;
  const premiumTier = Math.round(totalBudget * 1.5);
  return {
    id: `trip-${Date.now()}`,
    title: `${(params.from || "NEW DELHI").toUpperCase()} \u2192 ${destObj.name.toUpperCase()}`,
    from: params.from || "New Delhi",
    destination: destObj.name,
    durationDays: days,
    travelers: params.travelers,
    style: params.style,
    selectedTier: "balanced",
    dailyItinerary,
    tiers: {
      budget: {
        id: "budget",
        name: "BUDGET PLAN",
        tag: "Backpacker & Value",
        estimatedCost: budgetTier,
        summary: "Authentic backpacker hostels, sleeper trains, shared cabs, and local experiences.",
        stayType: "Hostels & Verified Homestays",
        transitType: "Sleeper / AC-3 Tier & Shared Jeeps",
        perks: ["Zero-markup transit", "Community dorms", "Street food trails"]
      },
      balanced: {
        id: "balanced",
        name: "BALANCED PLAN",
        tag: "Recommended \u2022 Comfort & Safety",
        estimatedCost: balancedTier,
        summary: "3-star boutique stays, AC express trains/flights, and curated verified experiences.",
        stayType: "Boutique Heritage Hotels",
        transitType: "AC Express Trains / Pre-paid Taxis",
        perks: ["Conflict detection", "Pre-checked safety", "Priority guide booking"]
      },
      premium: {
        id: "premium",
        name: "PREMIUM PLAN",
        tag: "Luxury & Private Chauffeur",
        estimatedCost: premiumTier,
        summary: "5-star royal heritage stays, private 4x4 chauffeur, and dedicated concierge radar.",
        stayType: "Heritage Palaces & Luxury Resorts",
        transitType: "Private 4x4 Chauffeur & Flights",
        perks: ["24/7 VIP SOS escort", "Exclusive sunset access", "All-inclusive dining"]
      }
    },
    timingConflicts: [
      {
        id: "conf-1",
        title: "Early Sleeper Train Arrival Clash",
        severity: "medium",
        issue: `Your overnight transit arrives at 05:15 AM, while the selected hotel check-in begins at 12:00 PM.`,
        solution: "Use the Railway Station Cloakroom to store luggage, explore nearby morning sunrise attractions and return for check-in."
      },
      {
        id: "conf-2",
        title: "Monument Closing Time Notice",
        severity: "low",
        issue: "Main royal courtyards close entrance gates by 05:00 PM.",
        solution: "Apna Route has scheduled your palace visit at 02:30 PM to ensure a relaxed 2.5-hour walkthrough."
      }
    ],
    routeSafety: {
      status: "SAFE",
      score: destObj.safetyScore,
      travelTime: isHighAltitude ? "9h 30m" : "5h 20m",
      distance: isHighAltitude ? "420 km" : "280 km",
      roadCondition: isHighAltitude ? "High mountain passes with mountain road clearances" : "Smooth 4-lane National Highway with active patrol",
      terrain: isHighAltitude ? "Steep mountain hairpins & high passes" : "Expressway plains & gentle elevation",
      riskFactors: isHighAltitude ? ["Occasional high-altitude rock clearing", "Morning frost on passes"] : ["Peak holiday toll congestion"],
      advisory: isHighAltitude ? "Allow 24-hour acclimatization; travel strictly between 06 AM \u2013 04 PM." : "Safe daytime transit with abundant refueling and medical rest stops.",
      alternativeSaferRoute: isHighAltitude ? {
        name: "Bypass via Rohtang / Atal Tunnel Expressway",
        extraTime: "+35 mins",
        description: "Avoids weather-prone older mountain passes with all-weather tunnel transit."
      } : void 0
    },
    climate: {
      temperature: parseInt(destObj.temperature) || 28,
      feelsLike: (parseInt(destObj.temperature) || 28) + 2,
      skyCondition: destObj.weatherStatus,
      rainChance: isBeach ? 25 : 8,
      humidity: isBeach ? 78 : 55,
      windSpeed: 14,
      aqi: {
        value: isHighAltitude ? 28 : 82,
        status: isHighAltitude ? "Good" : "Moderate"
      },
      warnings: isHighAltitude ? ["Cold mountain breeze after 5:30 PM. Thermal layers advised."] : ["High UV index midday. Hydration and sunglasses recommended."]
    },
    smartPacking: isHighAltitude ? [
      "Thermal innerwear & windproof fleece jacket",
      "Sturdy trekking boots with ankle support",
      "High SPF 50+ sunscreen & polarized UV sunglasses",
      "Diamox / altitude sickness tablets (consult physician)",
      "Insulated thermos flask & water purifying tablets",
      "High-capacity power bank (battery drains quickly in cold)",
      "Valid Government Photo ID & permit copies",
      "Small cash (ATMs scarce in high mountain valleys)"
    ] : [
      "Lightweight breathable cotton / linen clothing",
      "Comfortable walking shoes / sneakers for monuments",
      "Sun hat, polarized sunglasses & SPF 40+ sunscreen",
      "Compact travel umbrella / lightweight rain jacket",
      "Reusable water bottle with filter straw",
      "Power bank for phone navigation & photos",
      "Essential basic medicines (electrolytes, band-aids)",
      "Modest scarf / stole for visiting sanctums and temples"
    ],
    costBreakdown: {
      transport: Math.round(totalBudget * 0.28),
      stay: Math.round(totalBudget * 0.35),
      food: Math.round(totalBudget * 0.22),
      activities: Math.round(totalBudget * 0.1),
      miscellaneous: Math.round(totalBudget * 0.05),
      total: totalBudget
    },
    bestVisitingTime: {
      months: destObj.bestSeason,
      visitingHours: "08:00 AM \u2013 11:30 AM & 04:00 PM \u2013 07:00 PM",
      crowd: destObj.crowdLevel,
      weather: destObj.weatherStatus,
      safety: "Safe for solo travelers, families, and backpackers"
    },
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function chatConciergeWithAI(userMessage, history, contextDestination) {
  const ai = getGenAI();
  if (ai && isQuotaAvailable()) {
    try {
      const contents = [
        {
          role: "user",
          parts: [
            {
              text: `You are the AI Concierge of "APNA ROUTE - Your Journey. Your Route.", India's Next-Gen Travel, Tourism, Route Planning, and Safety Grid.
You provide intelligent, culturally nuanced, highly practical, and safe travel guidance across India.
Tone: Warm, confident, professional, authoritative on Indian geography, transit, safety, local etiquette, seasons, and budget optimization.
Current Context Destination: ${contextDestination || "All India"}.
Keep answers crisp, well-structured with bullet points, and directly actionable.`
            }
          ]
        },
        ...history.map((h) => ({
          role: h.role,
          parts: [{ text: h.text }]
        })),
        {
          role: "user",
          parts: [{ text: userMessage }]
        }
      ];
      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents
        }),
        4e3
      );
      if (response.text) {
        return response.text;
      }
    } catch (err) {
      handleGeminiError("Concierge AI", err);
    }
  }
  const lower = userMessage.toLowerCase();
  if (lower.includes("month") || lower.includes("when") || lower.includes("season")) {
    return `### Seasonal Intelligence for India:
- **Current Month (September):** Ideal for **Spiti Valley, Ladakh, and Leh** (roads open, vibrant autumn colors), and **Munnar / Kerala Backwaters** (lush post-monsoon emerald scenery).
- **Upcoming (October \u2013 February):** Peak season for **Rajasthan (Jaipur, Udaipur, Jaisalmer)**, **Goa**, and **Varanasi**. Weather is pleasant with daytime temperatures around 22\u201327\xB0C.
- **Monsoon (July \u2013 August):** Best for **Meghalaya** (waterfalls in full fury) and **Western Ghats / Sahyadris** (trekking near Kolhapur & Pune).`;
  }
  if (lower.includes("safe") || lower.includes("safety") || lower.includes("night") || lower.includes("alone")) {
    return `### Apna Route Safety Protocol:
1. **Prepaid Transit:** Always use government-authorized prepaid auto booths or app-verified cabs at railway stations and airports.
2. **Timing Conflicts:** Avoid arriving in isolated mountain passes after sunset (05:30 PM).
3. **Emergency SOS:** In any emergency, dial **112** (All-India Emergency), **1091** (Women Helpline), or trigger the **Emergency SOS button** in Apna Route.
4. **Acclimatization:** If traveling to Leh, Spiti, or high altitudes, dedicate your first 24-48 hours purely to rest and hydration to prevent AMS.`;
  }
  if (lower.includes("pack") || lower.includes("carry") || lower.includes("clothes")) {
    return `### Smart Packing Checklist:
- **Documents:** Physical & digital copies of Govt ID (Aadhaar / Passport), emergency contacts.
- **Clothing:** Modest breathable cottons for plains & temples (scarf/stole); windproof fleece & thermals if visiting North/Himachal/Ladakh.
- **Health:** ORS sachets, personal medicines, broad-spectrum sunscreen, and mosquito repellent.
- **Tech & Money:** Power bank (10,000mAh+), UPI enabled phone, and emergency physical cash (\u20B91,500 \u2013 \u20B93,000) for rural/mountain zones.`;
  }
  return `Apna Route is ready to guide you! Based on your query:
- For **verified transport & tariffs**, check the **Hyper-Local Radar** in the map section.
- For **timing conflicts & safety indices**, generate your customized itinerary with our Smart Transit Generator.
- Feel free to ask about specific states, budget breakdowns, or hidden local bazaars!`;
}
var cachedSentimentResult = null;
var lastReviewCount = 0;
async function analyzeSentimentWithAI(reviews) {
  if (cachedSentimentResult && reviews.length === lastReviewCount) {
    return cachedSentimentResult;
  }
  const reviewTexts = reviews.map((r) => typeof r === "string" ? r : r.reviewText);
  const reviewRatings = reviews.map((r) => typeof r === "string" ? 5 : r.rating ?? 5);
  const total = reviewRatings.length || 1;
  const posCount = reviewRatings.filter((r) => r >= 4).length;
  const neuCount = reviewRatings.filter((r) => r === 3).length;
  const negCount = reviewRatings.filter((r) => r <= 2).length;
  const posPct = Math.round(posCount / total * 100);
  const neuPct = Math.round(neuCount / total * 100);
  const negPct = Math.max(0, 100 - posPct - neuPct);
  const avgRating = reviewRatings.reduce((sum, r) => sum + r, 0) / total;
  const overallScorePercent = Math.min(100, Math.round(avgRating / 5 * 100));
  const recentExperienceScore = Number(avgRating.toFixed(1));
  const fallbackResult = {
    overallScorePercent: overallScorePercent || 94,
    sentimentBreakdown: {
      positive: posPct || 91,
      neutral: neuPct || 6,
      negative: negPct || 3
    },
    popularHighlights: [
      "Scam-free verified prepaid transport tariffs",
      "Timing conflict alerts preventing missed connections",
      "Zero-commission artisan bazaar discovery",
      "Accurate mountain pass weather & AQI intelligence"
    ],
    commonConcerns: [
      "Weekend rush at popular fort ticket counters",
      "Limited ATM cash in remote high-altitude hamlets"
    ],
    recentExperienceScore: recentExperienceScore || 9.3
  };
  const ai = getGenAI();
  if (ai && isQuotaAvailable() && reviewTexts.length > 0) {
    try {
      const prompt = `Analyze these real traveller reviews for Indian destinations:
${reviewTexts.slice(0, 8).map((r, i) => `${i + 1}. "${r}"`).join("\n")}

Output a valid JSON object matching:
{
  "overallScorePercent": ${overallScorePercent || 93},
  "sentimentBreakdown": { "positive": ${posPct || 88}, "neutral": ${neuPct || 9}, "negative": ${negPct || 3} },
  "popularHighlights": ["Scam-free verified tariffs", "Stunning sunrise vantage points", "Helpful local homestay hosts"],
  "commonConcerns": ["Peak weekend traffic near heritage gates", "Need for earlier booking on mountain passes"],
  "recentExperienceScore": ${recentExperienceScore || 9.2}
}`;
      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        }),
        3500
      );
      if (response.text) {
        const parsed = JSON.parse(response.text);
        cachedSentimentResult = parsed;
        lastReviewCount = reviews.length;
        return parsed;
      }
    } catch (e) {
      handleGeminiError("Sentiment AI analysis", e);
    }
  }
  cachedSentimentResult = fallbackResult;
  lastReviewCount = reviews.length;
  return fallbackResult;
}

// server/auth.ts
init_db();
import { Router } from "express";
import crypto2 from "crypto";
var authRouter = Router();
function hashPassword(password) {
  const salt = crypto2.randomBytes(16).toString("hex");
  const derivedKey = crypto2.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}
function verifyPassword(password, storedHash) {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto2.scryptSync(password, salt, 64);
    return crypto2.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}
var JWT_SECRET = process.env.AUTH_JWT_SECRET || "apna_route_super_secret_jwt_key_2026";
function createToken(userId) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      iat: Math.floor(Date.now() / 1e3),
      exp: Math.floor(Date.now() / 1e3) + 30 * 24 * 60 * 60
      // 30 days
    })
  ).toString("base64url");
  const signature = crypto2.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}
function verifyTokenString(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSig = crypto2.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (!crypto2.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (decoded.exp && Math.floor(Date.now() / 1e3) > decoded.exp) {
      return null;
    }
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}
async function authMiddleware(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (req.headers["x-auth-token"]) {
    token = String(req.headers["x-auth-token"]).trim();
  }
  if (!token) {
    return res.status(401).json({ error: "Authentication required. No token provided." });
  }
  const payload = verifyTokenString(token);
  if (!payload) {
    const session = await getSession(token);
    if (!session) {
      return res.status(401).json({ error: "Invalid or expired authentication session." });
    }
    const user2 = await findUserById(session.userId);
    if (!user2) {
      return res.status(401).json({ error: "User account not found." });
    }
    req.user = user2;
    req.authToken = token;
    return next();
  }
  const user = await findUserById(payload.userId);
  if (!user) {
    return res.status(401).json({ error: "User account not found." });
  }
  req.user = user;
  req.authToken = token;
  next();
}
function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}
authRouter.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Full name, email, and password are required." });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }
    const existing = await findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists. Please log in." });
    }
    const passwordHash = hashPassword(password);
    const user = await createUser({
      email: cleanEmail,
      fullName: String(fullName).trim(),
      passwordHash,
      provider: "local"
    });
    const token = createToken(user.id);
    await saveSession(user.id, token);
    return res.status(201).json({
      success: true,
      message: "Account registered successfully. Welcome to Apna Route!",
      user: sanitizeUser(user),
      token
    });
  } catch (err) {
    console.error("[Auth Register Error]:", err);
    return res.status(500).json({ error: "Failed to complete registration. Please try again." });
  }
});
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ error: "No account found with this email. Please check your credentials or create an account." });
    }
    if (user.provider === "google" && !user.passwordHash) {
      return res.status(400).json({
        error: 'This account is linked with Google Sign-In. Please click "Continue with Google".'
      });
    }
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Incorrect password. Please try again or use "Forgot Password?".' });
    }
    await updateUserLastLogin(user.id);
    const token = createToken(user.id);
    await saveSession(user.id, token);
    return res.json({
      success: true,
      message: "Authentication successful. Welcome back to Apna Route!",
      user: sanitizeUser(user),
      token
    });
  } catch (err) {
    console.error("[Auth Login Error]:", err);
    return res.status(500).json({ error: "Failed to process login. Please try again." });
  }
});
function resolveAppUrl(req) {
  if (process.env.APP_URL && process.env.APP_URL !== "MY_APP_URL" && process.env.APP_URL.trim() !== "") {
    return process.env.APP_URL.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }
  const forwardedProto = req.headers["x-forwarded-proto"];
  const host = req.get("host") || "localhost:3000";
  let proto = "https";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    proto = typeof forwardedProto === "string" ? forwardedProto.split(",")[0].trim() : req.protocol || "http";
  }
  return `${proto}://${host}`;
}
authRouter.get("/google/url", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID || "916705206212-dsdr7ep5jefrqhmkffl6cjjr3fn7k774.apps.googleusercontent.com";
  const appUrl = resolveAppUrl(req);
  const redirectUri = `${appUrl}/auth/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    access_type: "offline"
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({
    url,
    redirectUri,
    configured: Boolean(clientId),
    clientId: clientId ? `${clientId.slice(0, 8)}...` : null,
    fullClientId: clientId || null
  });
});
authRouter.post("/google/set-client-id", (req, res) => {
  const { clientId, clientSecret } = req.body;
  if (clientId) {
    process.env.GOOGLE_CLIENT_ID = clientId.trim();
  }
  if (clientSecret) {
    process.env.GOOGLE_CLIENT_SECRET = clientSecret.trim();
  }
  return res.json({
    success: true,
    configured: Boolean(process.env.GOOGLE_CLIENT_ID),
    clientId: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.slice(0, 8)}...` : null,
    fullClientId: process.env.GOOGLE_CLIENT_ID || null
  });
});
authRouter.post("/google", async (req, res) => {
  try {
    const { code, credential, redirectUri, profile } = req.body;
    let email = "";
    let fullName = "Apna Route Explorer";
    let googleId = "";
    let avatar = "";
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID || "916705206212-dsdr7ep5jefrqhmkffl6cjjr3fn7k774.apps.googleusercontent.com";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET || "";
    if (code) {
      if (!clientSecret) {
        console.warn("[Google Auth] Authorization code received, but GOOGLE_CLIENT_SECRET is not set in .env!");
        return res.status(400).json({
          error: "Missing GOOGLE_CLIENT_SECRET in .env. Please add your Client Secret from Google Cloud Console."
        });
      }
      const appUrl = resolveAppUrl(req);
      const effectiveRedirect = redirectUri || `${appUrl}/auth/callback`;
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: clientId || "",
            client_secret: clientSecret,
            redirect_uri: effectiveRedirect,
            grant_type: "authorization_code"
          })
        });
        const tokenData = await tokenRes.json();
        if (tokenData.error) {
          console.error("[Google Token Exchange Error Response]:", tokenData);
          return res.status(400).json({
            error: `Google Token Error: ${tokenData.error_description || tokenData.error}`
          });
        }
        if (tokenData.access_token) {
          const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
          });
          const userData = await userRes.json();
          email = userData.email;
          fullName = userData.name || fullName;
          googleId = userData.id;
          avatar = userData.picture || "";
        }
      } catch (tokenErr) {
        console.error("[Google Token Exchange Exception]:", tokenErr);
        return res.status(500).json({
          error: `Failed to exchange token with Google: ${tokenErr?.message || tokenErr}`
        });
      }
    }
    if (!email && credential) {
      try {
        const parts = credential.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
          if (payload.email) {
            email = payload.email;
            fullName = payload.name || fullName;
            googleId = payload.sub || "";
            avatar = payload.picture || "";
          }
        }
      } catch (e) {
        console.error("[GSI Credential Decode Error]:", e);
      }
    }
    if (!email && profile && profile.email) {
      email = profile.email;
      fullName = profile.name || fullName;
      googleId = profile.id || `goog_${Date.now()}`;
      avatar = profile.picture || "";
    }
    if (!email) {
      if (req.body.email) {
        email = String(req.body.email).trim().toLowerCase();
        fullName = req.body.name || req.body.fullName || fullName;
        googleId = req.body.googleId || `goog_${Date.now()}`;
        avatar = req.body.picture || req.body.avatar || "";
      } else {
        return res.status(400).json({
          error: "Unable to authenticate with Google. Missing valid authorization code or credential token."
        });
      }
    }
    const cleanEmail = email.trim().toLowerCase();
    let user = await findUserByEmail(cleanEmail);
    if (!user && googleId) {
      user = await findUserByGoogleId(googleId);
    }
    if (!user) {
      user = await createUser({
        email: cleanEmail,
        fullName,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
        googleId,
        provider: "google"
      });
    } else {
      await updateUserLastLogin(user.id);
    }
    const token = createToken(user.id);
    await saveSession(user.id, token);
    return res.json({
      success: true,
      message: "Google authentication successful. Welcome to Apna Route!",
      user: sanitizeUser(user),
      token
    });
  } catch (err) {
    console.error("[Auth Google Error]:", err);
    return res.status(500).json({ error: "Failed to complete Google authentication." });
  }
});
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address is required." });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists with this email, password reset instructions have been dispatched."
      });
    }
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters long." });
      }
      const newHash = hashPassword(newPassword);
      await updateUserPassword(cleanEmail, newHash);
      return res.json({
        success: true,
        message: "Your password has been successfully reset. You can now log in with your new password."
      });
    }
    const resetCode = Math.floor(1e5 + Math.random() * 9e5).toString();
    return res.json({
      success: true,
      message: `Password reset verification instructions sent to ${cleanEmail}.`,
      resetCodeHint: `Reset Code: ${resetCode} (Valid for 15 minutes)`
    });
  } catch (err) {
    console.error("[Forgot Password Error]:", err);
    return res.status(500).json({ error: "Failed to process password recovery request." });
  }
});
authRouter.get("/me", authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json({
    success: true,
    user: sanitizeUser(req.user)
  });
});
authRouter.post("/logout", async (req, res) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (req.headers["x-auth-token"]) {
    token = String(req.headers["x-auth-token"]).trim();
  }
  if (token) {
    await deleteSession(token);
  }
  return res.json({
    success: true,
    message: "Logged out successfully from Apna Route."
  });
});
var auth_default = authRouter;

// server/routes.ts
var router = Router2();
router.use("/auth", auth_default);
var savedTripsStore = [];
var reviewsStore = [...TRAVELLER_REVIEWS];
var travelersStore = [...TRAVELER_COMPANIONS];
var destinationPhotosStore = [...DESTINATION_PHOTOS];
var activeTripState = {
  isActive: false,
  activeTripId: null,
  currentDay: 1,
  currentStopIndex: 0,
  trackingStatus: "IDLE"
};
router.get("/health", async (_req, res) => {
  const { getDbStatus: getDbStatus2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const dbStatus = await getDbStatus2();
  res.json({
    status: "healthy",
    system: "APNA ROUTE \u2014 Your Journey. Your Route.",
    version: "2.4.0",
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
    database: dbStatus,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.get("/db-status", async (_req, res) => {
  const { getDbStatus: getDbStatus2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const dbStatus = await getDbStatus2();
  res.json(dbStatus);
});
router.get("/destinations", (req, res) => {
  const { category, search, season, maxBudget } = req.query;
  let list = [...DESTINATIONS];
  if (category && category !== "All") {
    list = list.filter(
      (d) => d.categories.some((c) => c.toLowerCase() === String(category).toLowerCase())
    );
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (d) => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q) || d.tagline.toLowerCase().includes(q)
    );
  }
  if (maxBudget) {
    const budgetNum = Number(maxBudget);
    if (!isNaN(budgetNum) && budgetNum > 0) {
      list = list.filter((d) => d.startingBudget <= budgetNum);
    }
  }
  res.json({ destinations: list, total: list.length });
});
router.get("/destinations/:id", (req, res) => {
  const dest = DESTINATIONS.find((d) => d.id === req.params.id || d.name.toLowerCase() === req.params.id.toLowerCase());
  if (!dest) {
    return res.status(404).json({ error: "Destination not found in Apna Route database" });
  }
  res.json({ destination: dest });
});
router.get("/destinations/:destinationId/photos", (req, res) => {
  const { destinationId } = req.params;
  const targetId = destinationId.toLowerCase().trim();
  const dest = DESTINATIONS.find(
    (d) => d.id.toLowerCase() === targetId || d.name.toLowerCase() === targetId
  );
  if (!dest) {
    return res.status(404).json({ error: "Invalid destination" });
  }
  const destinationPhotos = destinationPhotosStore.filter(
    (p) => p.destination_id.toLowerCase() === dest.id.toLowerCase()
  );
  const sortedPhotos = [...destinationPhotos].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  res.json({
    destination_id: dest.id,
    destination_name: dest.name,
    total: sortedPhotos.length,
    photos: sortedPhotos
  });
});
router.post("/destinations/:destinationId/photos", (req, res) => {
  const { destinationId } = req.params;
  const targetId = destinationId.toLowerCase().trim();
  const dest = DESTINATIONS.find(
    (d) => d.id.toLowerCase() === targetId || d.name.toLowerCase() === targetId
  );
  if (!dest) {
    return res.status(404).json({ error: "Invalid destination" });
  }
  const { photo_url, caption, user_id, user_name } = req.body;
  if (!photo_url || typeof photo_url !== "string" || !photo_url.trim()) {
    return res.status(400).json({ error: "Photo is required" });
  }
  const trimmedUrl = photo_url.trim();
  const isDataUrl = trimmedUrl.startsWith("data:");
  const isHttpUrl = trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://");
  if (isDataUrl) {
    const isAllowedFormat = trimmedUrl.startsWith("data:image/jpeg;") || trimmedUrl.startsWith("data:image/jpg;") || trimmedUrl.startsWith("data:image/png;") || trimmedUrl.startsWith("data:image/webp;");
    if (!isAllowedFormat) {
      return res.status(400).json({
        error: "Invalid image format. Only JPG, JPEG, PNG, and WEBP images are accepted."
      });
    }
    if (trimmedUrl.length > 7 * 1024 * 1024) {
      return res.status(400).json({
        error: "File size exceeds 5MB limit."
      });
    }
  } else if (isHttpUrl) {
    const lower = trimmedUrl.toLowerCase();
    const disallowedExts = [".exe", ".sh", ".bat", ".cmd", ".js", ".ts", ".html", ".php", ".py", ".zip", ".tar", ".pdf", ".bin"];
    if (disallowedExts.some((ext) => lower.includes(ext))) {
      return res.status(400).json({
        error: "Executable or non-image files are strictly prohibited."
      });
    }
  } else {
    return res.status(400).json({
      error: "Invalid photo URL or image data provided."
    });
  }
  const serverTimestamp = (/* @__PURE__ */ new Date()).toISOString();
  const newPhoto = {
    id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    destination_id: dest.id,
    destination_name: dest.name,
    user_id: user_id && typeof user_id === "string" ? user_id.trim() : "usr_ar_8932",
    user_name: user_name && typeof user_name === "string" ? user_name.trim() : "Apna Route Explorer",
    photo_url: trimmedUrl,
    caption: typeof caption === "string" ? caption.trim().slice(0, 300) : "",
    created_at: serverTimestamp
  };
  destinationPhotosStore.unshift(newPhoto);
  res.status(201).json({
    success: true,
    message: "Photo uploaded successfully",
    photo: newPhoto
  });
});
router.post("/plan/generate", async (req, res) => {
  try {
    const { from, destination, startDate, durationDays, budget, travelers, style } = req.body;
    const plan = await generateItineraryWithAI({
      from: from || "New Delhi",
      destination: destination || "Jaipur",
      startDate,
      durationDays: Number(durationDays) || 4,
      budget: Number(budget) || 1e4,
      travelers: Number(travelers) || 1,
      style: style || "Heritage"
    });
    res.json({ success: true, plan });
  } catch (err) {
    console.error("Plan generation error:", err);
    res.status(500).json({ error: "Failed to generate itinerary", details: err.message });
  }
});
router.post("/concierge/chat", async (req, res) => {
  try {
    const { message, history, contextDestination } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message string is required" });
    }
    const reply = await chatConciergeWithAI(message, history || [], contextDestination);
    res.json({ reply, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  } catch (err) {
    console.error("Concierge chat error:", err);
    res.status(500).json({ error: "Failed to process concierge inquiry" });
  }
});
router.get("/radar/pois", (req, res) => {
  const { destination = "jaipur", category, radiusKm, centerLat, centerLng } = req.query;
  const destKey = String(destination).toLowerCase();
  const rawPois = POI_DATABASE[destKey] || POI_DATABASE["jaipur"] || [];
  const destInfo = DESTINATIONS.find((d) => d.id.toLowerCase() === destKey || d.name.toLowerCase() === destKey);
  const cLat = centerLat ? Number(centerLat) : destInfo?.coordinates.lat || 26.9124;
  const cLng = centerLng ? Number(centerLng) : destInfo?.coordinates.lng || 75.7873;
  let calculatedPois = rawPois.map((p) => {
    const distKm = calculateHaversineKm(cLat, cLng, p.coordinates.lat, p.coordinates.lng);
    return {
      ...p,
      distanceKm: distKm,
      distance: `${distKm} km`
    };
  });
  if (category && category !== "All") {
    calculatedPois = calculatedPois.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
  }
  if (radiusKm) {
    const maxR = Number(radiusKm);
    if (!isNaN(maxR) && maxR > 0) {
      calculatedPois = calculatedPois.filter((p) => p.distanceKm <= maxR);
    }
  }
  calculatedPois.sort((a, b) => a.distanceKm - b.distanceKm);
  res.json({
    pois: calculatedPois,
    destination: destKey,
    count: calculatedPois.length,
    center: { lat: cLat, lng: cLng }
  });
});
router.get("/seasons", (req, res) => {
  const { season } = req.query;
  if (season && typeof season === "string") {
    const capitalized = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
    const data = SEASONAL_DATA[capitalized] || SEASONAL_DATA["Winter"];
    return res.json({ season: data });
  }
  res.json({ seasons: SEASONAL_DATA });
});
router.get("/travelers", (req, res) => {
  const { destination, style, budget, groupType, search } = req.query;
  let list = [...travelersStore];
  if (destination && destination !== "All") {
    const dQuery = String(destination).toLowerCase();
    list = list.filter((t) => t.destination.toLowerCase().includes(dQuery));
  }
  if (style && style !== "All") {
    list = list.filter((t) => t.travelStyle.toLowerCase() === String(style).toLowerCase());
  }
  if (groupType && groupType !== "All") {
    list = list.filter((t) => t.groupType === groupType);
  }
  if (budget) {
    const maxB = Number(budget);
    if (!isNaN(maxB) && maxB > 0) {
      list = list.filter((t) => t.budget <= maxB);
    }
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (t) => t.name.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q) || t.location.toLowerCase().includes(q) || t.interests.some((i) => i.toLowerCase().includes(q))
    );
  }
  res.json({ travelers: list, total: list.length });
});
router.post("/travelers/match", (req, res) => {
  const { destination, dates, budget, interests, travelStyle } = req.body;
  const userInterests = Array.isArray(interests) ? interests.map((i) => i.toLowerCase()) : [];
  const userBudget = Number(budget) || 12e3;
  const userDest = String(destination || "").toLowerCase();
  const userStyle = String(travelStyle || "").toLowerCase();
  const scored = travelersStore.map((t) => {
    let score = 50;
    if (userDest && t.destination.toLowerCase().includes(userDest)) {
      score += 25;
    }
    if (userStyle && t.travelStyle.toLowerCase() === userStyle) {
      score += 15;
    }
    const budgetDiff = Math.abs(t.budget - userBudget) / userBudget;
    if (budgetDiff < 0.3) {
      score += 10;
    }
    if (userInterests.length > 0) {
      const common = t.interests.filter((i) => userInterests.includes(i.toLowerCase()));
      score += Math.min(common.length * 5, 15);
    }
    const finalScore = Math.min(Math.max(score, 45), 98);
    return {
      ...t,
      compatibilityScore: finalScore
    };
  });
  scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  res.json({ success: true, matches: scored });
});
router.post("/travelers/create", (req, res) => {
  const { name, location, destination, dates, budget, travelStyle, interests, bio, groupType } = req.body;
  const newCompanion = {
    id: `trv-${Date.now()}`,
    name: name || "Solo Nomad",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    location: location || "India",
    destination: destination || "Jaipur",
    dates: dates || "Next Month",
    budget: Number(budget) || 1e4,
    budgetFormatted: `\u20B9${(Number(budget) || 1e4).toLocaleString("en-IN")} / person`,
    travelStyle: travelStyle || "Heritage",
    interests: Array.isArray(interests) && interests.length > 0 ? interests : ["Heritage", "Local Food"],
    bio: bio || "Excited to explore India with responsible fellow travelers!",
    compatibilityScore: 95,
    isVerified: true,
    groupType: groupType || "Solo",
    contactAvailable: true
  };
  travelersStore.unshift(newCompanion);
  res.json({ success: true, companion: newCompanion, total: travelersStore.length });
});
router.get("/trips/active", (_req, res) => {
  res.json({ activeTripState });
});
router.post("/trips/active", (req, res) => {
  const { tripId, isActive, currentDay, currentStopIndex, lastKnownGPS, trackingStatus } = req.body;
  activeTripState = {
    isActive: isActive ?? true,
    activeTripId: tripId ?? activeTripState.activeTripId,
    currentDay: currentDay ?? activeTripState.currentDay,
    currentStopIndex: currentStopIndex ?? activeTripState.currentStopIndex,
    lastKnownGPS: lastKnownGPS || activeTripState.lastKnownGPS,
    trackingStatus: trackingStatus || "TRACKING"
  };
  res.json({ success: true, activeTripState });
});
router.get("/services", (_req, res) => {
  res.json({
    drivers: VERIFIED_DRIVERS,
    guides: VERIFIED_GUIDES,
    bazaars: ARTISAN_BAZAARS,
    groups: TRAVEL_GROUPS
  });
});
router.post("/sos/trigger", (req, res) => {
  const { userLocation, emergencyType, contactsNotified } = req.body;
  const responseData = {
    incidentId: `SOS-IN-${Math.floor(1e5 + Math.random() * 9e5)}`,
    status: "DISPATCH_TRIGGERED",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    location: userLocation || { lat: 26.9124, lng: 75.7873, place: "Jaipur, Rajasthan" },
    emergencyHelplines: [
      { name: "All India Emergency Hotline", number: "112", type: "Police / Fire / Ambulance" },
      { name: "National Medical Ambulance", number: "102", type: "Medical" },
      { name: "Women Safety Helpline", number: "1091", type: "Specialized Patrol" },
      { name: "Tourist Police Helpline", number: "1363", type: "Tourist Assistance" }
    ],
    nearestFacility: {
      name: "SMS Government Multi-Speciality Trauma Center",
      distance: "1.4 km",
      ambulanceETA: "6 minutes",
      contact: "102"
    },
    safetySteps: [
      "Stay in a well-lit, public location if safe to do so.",
      "Keep your phone battery conservation mode ON.",
      "Your live GPS coordinates have been packaged for sharing."
    ]
  };
  res.json(responseData);
});
router.get("/safety/advisories", (_req, res) => {
  res.json({ advisories: STATE_ADVISORIES });
});
router.get("/reviews", (_req, res) => {
  res.json({ reviews: reviewsStore });
});
router.post("/reviews", (req, res) => {
  const { userName, rating, destination, reviewText, travelType, image } = req.body;
  const newRev = {
    id: `rev-${Date.now()}`,
    userName: userName || "Apna Traveller",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    rating: Number(rating) || 5,
    date: "Just now",
    travelType: travelType || "Explorer",
    destination: destination || "Jaipur",
    reviewText: reviewText || "Great experience with Apna Route!",
    verifiedVisit: true,
    sentiment: (Number(rating) || 5) >= 4 ? "positive" : (Number(rating) || 5) === 3 ? "neutral" : "negative",
    images: image ? [image] : []
  };
  reviewsStore.unshift(newRev);
  res.json({ success: true, review: newRev });
});
router.post("/reviews/analyze-sentiment", async (req, res) => {
  try {
    const result = await analyzeSentimentWithAI(reviewsStore);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed sentiment analysis" });
  }
});
router.get("/trips/saved", (_req, res) => {
  res.json({ savedTrips: savedTripsStore });
});
router.post("/trips/save", (req, res) => {
  const { plan } = req.body;
  if (!plan || !plan.id) {
    return res.status(400).json({ error: "Valid plan object required" });
  }
  const existingIdx = savedTripsStore.findIndex((t) => t.id === plan.id);
  if (existingIdx >= 0) {
    savedTripsStore[existingIdx] = plan;
  } else {
    savedTripsStore.unshift(plan);
  }
  res.json({ success: true, savedTripsCount: savedTripsStore.length });
});
router.delete("/trips/:id", (req, res) => {
  const tripId = req.params.id;
  savedTripsStore = savedTripsStore.filter((t) => t.id !== tripId);
  res.json({ success: true, remaining: savedTripsStore.length });
});
router.get("/notifications", (_req, res) => {
  res.json({ notifications: DEFAULT_NOTIFICATIONS });
});
var routes_default = router;

// server/api-entry.ts
var app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.get(["/auth/callback", "/auth/callback/", "/api/auth/callback"], (req, res) => {
  const { code, error } = req.query;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!DOCTYPE html>
<html>
  <head>
    <title>APNA ROUTE - Authentication</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        background: #0a0a0a;
        color: #f1f5f9;
        font-family: system-ui, -apple-system, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
      }
      .card {
        background: #111625;
        border: 1px solid #1e293b;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        max-width: 360px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      }
      .spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #334155;
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 16px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="spinner"></div>
      <h3 style="margin:0 0 8px;font-size:16px;">APNA ROUTE Authentication</h3>
      <p style="margin:0;font-size:13px;color:#94a3b8;">
        ${error ? "Authentication error occurred." : "Connecting your account securely. Closing window..."}
      </p>
    </div>
    <script>
      if (window.opener) {
        window.opener.postMessage({
          type: 'OAUTH_AUTH_SUCCESS',
          code: ${JSON.stringify(code || "")},
          error: ${JSON.stringify(error || "")}
        }, '*');
        setTimeout(() => { window.close(); }, 400);
      } else {
        window.location.href = '/';
      }
    </script>
  </body>
</html>`);
});
app.get(["/health", "/api/health"], (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use("/api", routes_default);
app.use(routes_default);
var api_entry_default = app;
export {
  api_entry_default as default
};
