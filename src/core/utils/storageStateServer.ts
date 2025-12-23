import Fastify, { FastifyReply, FastifyRequest } from 'fastify';

const app = Fastify();

// Simple in-memory cache
const storageCache: Record<string, any> = {};

// Track which keys are currently being processed (locked)
const pendingLocks: Record<string, boolean> = {};

/**
 * Generate consistent cache key
 */
function getCacheKey(env: string, tenant: string, user: string): string {
  return `${env}:${tenant}:${user}`;
}

// Type definitions for request parameters
interface QueryParams {
  env: string;
  tenant: string;
  user: string;
}

interface LockBody {
  env: string;
  tenant: string;
  user: string;
}

interface SaveBody {
  env: string;
  tenant: string;
  user: string;
  state: any;
}

// Health check endpoint for Playwright webServer
app.get('/', async (req: FastifyRequest, reply: FastifyReply) => {
  return reply.status(200).send({ status: 'ok', service: 'storage-state-cache' });
});

// GET /get?env=test&tenant=xxx&user=yyy
app.get<{ Querystring: QueryParams }>(
  '/get',
  async (req: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    try {
      const { env, tenant, user } = req.query;

      if (!env || !tenant || !user) {
        return reply.status(400).send({ error: 'env, tenant, and user query parameters are required' });
      }

      const cacheKey = getCacheKey(env, tenant, user);
      const cachedState = storageCache[cacheKey];

      if (cachedState === undefined) {
        console.log(`[SERVER] Cache MISS for key: ${cacheKey}`);
        return reply.status(404).send({ error: 'Storage state not found in cache' });
      }

      console.log(`[SERVER] Cache HIT for key: ${cacheKey}`);
      return reply.status(200).send(cachedState);
    } catch (error) {
      console.error('Error in GET /get:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
);

// GET /pending?env=test&tenant=xxx&user=yyy - Check if key is being processed
app.get<{ Querystring: QueryParams }>(
  '/pending',
  async (req: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
    try {
      const { env, tenant, user } = req.query;

      if (!env || !tenant || !user) {
        return reply.status(400).send({ error: 'env, tenant, and user query parameters are required' });
      }

      const cacheKey = getCacheKey(env, tenant, user);
      const isPending = pendingLocks[cacheKey] === true;
      console.log(`[SERVER] Pending check for key: ${cacheKey} = ${isPending ? 'LOCKED' : 'NOT LOCKED'}`);

      return reply.status(200).send({ pending: isPending });
    } catch (error) {
      console.error('Error in GET /pending:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
);

// POST /lock - Set lock for a key (called before login) - Returns true if lock was acquired, false if already locked
app.post<{ Body: LockBody }>('/lock', async (req: FastifyRequest<{ Body: LockBody }>, reply: FastifyReply) => {
  try {
    const { env, tenant, user } = req.body;

    if (!env || !tenant || !user) {
      return reply.status(400).send({ error: 'env, tenant, and user are required' });
    }

    const cacheKey = getCacheKey(env, tenant, user);

    // Atomic check-and-set: only set if not already locked
    if (pendingLocks[cacheKey]) {
      console.log(`[SERVER] ⚠️  Lock already exists for key: ${cacheKey} (another worker is already processing)`);
      return reply.status(200).send({ success: false, locked: true, message: 'Lock already exists' });
    } else {
      pendingLocks[cacheKey] = true;
      console.log(`[SERVER] 🔒 Lock SET for key: ${cacheKey}`);
      return reply.status(200).send({ success: true, locked: false, message: 'Lock acquired' });
    }
  } catch (error) {
    console.error('Error in POST /lock:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// POST /unlock - Release lock without saving (used on login failure)
app.post<{ Body: LockBody }>('/unlock', async (req: FastifyRequest<{ Body: LockBody }>, reply: FastifyReply) => {
  try {
    const { env, tenant, user } = req.body;

    if (!env || !tenant || !user) {
      return reply.status(400).send({ error: 'env, tenant, and user are required' });
    }

    const cacheKey = getCacheKey(env, tenant, user);
    const hadLock = pendingLocks[cacheKey];
    delete pendingLocks[cacheKey];

    console.log(`[SERVER] 🔓 Lock RELEASED for key: ${cacheKey}${hadLock ? '' : ' (was not locked)'}`);
    return reply.status(200).send({ success: true, wasLocked: hadLock });
  } catch (error) {
    console.error('Error in POST /unlock:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// POST /save { env, tenant, user, state }
app.post<{ Body: SaveBody }>('/save', async (req: FastifyRequest<{ Body: SaveBody }>, reply: FastifyReply) => {
  try {
    const { env, tenant, user, state } = req.body;

    if (!env || !tenant || !user || !state) {
      return reply.status(400).send({ error: 'env, tenant, user, and state are required in request body' });
    }

    const cacheKey = getCacheKey(env, tenant, user);
    storageCache[cacheKey] = state;
    const hadLock = pendingLocks[cacheKey];
    delete pendingLocks[cacheKey]; // Release lock

    console.log(`[SERVER] 💾 Cache SAVED for key: ${cacheKey}${hadLock ? ' (lock released)' : ''}`);
    return reply.status(200).send({ success: true, key: cacheKey });
  } catch (error) {
    console.error('Error in POST /save:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// DELETE /clear - Clear all cache entries
app.delete('/clear', async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const count = Object.keys(storageCache).length;
    Object.keys(storageCache).forEach(key => delete storageCache[key]);
    console.log(`Cache CLEARED: ${count} entries removed`);
    return reply.status(200).send({ success: true, cleared: count });
  } catch (error) {
    console.error('Error in DELETE /clear:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// GET /stats - Get cache statistics
app.get('/stats', async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const total = Object.keys(storageCache).length;
    return reply.status(200).send({
      total,
      keys: Object.keys(storageCache),
    });
  } catch (error) {
    console.error('Error in GET /stats:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

export async function startServer(port = 3010): Promise<string> {
  return await app.listen({ port, host: '0.0.0.0' });
}

if (require.main === module) {
  const port = process.env.CACHE_SERVER_PORT ? parseInt(process.env.CACHE_SERVER_PORT, 10) : 3010;
  startServer(port)
    .then(address => {
      console.log(`🚀 Storage state cache server running at: ${address}`);
      console.log(`✅ Server ready - health check available at ${address}/`);
    })
    .catch(error => {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    });

  process.on('SIGINT', () => {
    void app.close().then(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  });
}
