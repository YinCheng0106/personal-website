import { redis } from "@/lib/redis";

const key = (slug: string) => `views:${slug}`;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!redis) return Response.json({ views: null });

  const views = await redis.get<number>(key(slug));
  return Response.json({ views: views ?? 0 });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!redis) return Response.json({ views: null });

  const views = await redis.incr(key(slug));
  return Response.json({ views });
}
