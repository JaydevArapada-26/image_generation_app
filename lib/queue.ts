import { Queue } from "bullmq";
import type { GenerationJobData } from "@/types";

const QUEUE_NAME = "generation-queue";

// ─── Redis Connection ─────────────────────────────────────────────────────────

function getRedisConnection() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Return a mock connection object so the app doesn't crash in demo mode
    console.warn(
      "[queue] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Queue operations will be no-ops."
    );
    return null;
  }

  // Parse Upstash REST URL to extract host for ioredis compatibility
  // BullMQ uses ioredis under the hood; we use the Upstash Redis URL
  const parsedUrl = new URL(url);
  return {
    host: parsedUrl.hostname,
    port: parseInt(parsedUrl.port || "6379"),
    password: token,
    tls: parsedUrl.protocol === "https:" ? {} : undefined,
  };
}

// ─── Queue Instance ───────────────────────────────────────────────────────────

let _queue: Queue<GenerationJobData> | null = null;

function getQueue(): Queue<GenerationJobData> | null {
  const conn = getRedisConnection();
  if (!conn) return null;

  if (!_queue) {
    _queue = new Queue<GenerationJobData>(QUEUE_NAME, {
      connection: conn,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }
  return _queue;
}

// ─── Producer ─────────────────────────────────────────────────────────────────

export async function enqueueGeneration(
  generationId: string
): Promise<string | null> {
  const queue = getQueue();
  if (!queue) {
    console.warn(
      `[queue] Skipping enqueue for generation ${generationId} — no Redis connection.`
    );
    return null;
  }

  const job = await queue.add(
    "generate",
    { generationId },
    { jobId: `gen-${generationId}` }
  );

  return job.id ?? null;
}

export { QUEUE_NAME };
