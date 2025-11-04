let client = null;

async function init() {
  if (!process.env.REDIS_URL) return null;
  try {
    // Lazy require to keep optional
    const { createClient } = require("redis");
    client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        // Disable endless reconnect spam if Redis is down
        reconnectStrategy: () => 0,
      },
    });

    client.on("error", (err) => {
      console.warn(
        "Redis disabled (connection error):",
        err?.code || err?.message || err
      );
    });

    await client.connect().catch((err) => {
      console.warn(
        "Redis connect failed, caching disabled:",
        err?.code || err?.message || err
      );
      client = null;
    });

    return client;
  } catch (e) {
    console.warn("Redis not available, caching disabled:", e.message);
    client = null;
    return null;
  }
}

function isReady() {
  return !!client && client.isOpen;
}

async function get(key) {
  if (!isReady()) return null;
  return await client.get(key);
}

async function set(key, value, ttlSeconds = 60) {
  if (!isReady()) return;
  await client.set(key, value, { EX: ttlSeconds });
}

async function del(key) {
  if (!isReady()) return;
  await client.del(key);
}

// Namespaced helpers for articles
function listKey(paramsHash) {
  return `articles:list:${paramsHash}`;
}
function detailKey(idOrSlug) {
  return `articles:detail:${idOrSlug}`;
}

async function flushArticle(idOrSlug) {
  if (!isReady()) return;
  await del(detailKey(idOrSlug));
}

async function flushArticles() {
  if (!isReady()) return;
  // Best-effort: use SCAN to remove list keys
  try {
    let cursor = 0;
    do {
      const res = await client.scan(cursor, {
        MATCH: "articles:list:*",
        COUNT: 100,
      });
      cursor = parseInt(res.cursor || res[0], 10);
      const keys = res.keys || res[1] || [];
      if (keys.length) await client.del(keys);
    } while (cursor !== 0);
  } catch {}
}

module.exports = {
  init,
  isReady,
  get,
  set,
  del,
  listKey,
  detailKey,
  flushArticle,
  flushArticles,
};
