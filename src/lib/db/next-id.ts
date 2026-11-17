import { prisma } from "@/lib/db/prisma";

/**
 * MongoDB has no autoincrement. The legacy MySQL integer IDs are preserved in
 * `_id`, so new rows take their IDs from a per-collection Sequence document.
 * `upsert` with `increment` is atomic on MongoDB, so concurrent inserts stay unique.
 */
export async function nextId(collection: string): Promise<number> {
  const [id] = await nextIds(collection, 1);
  return id;
}

export async function nextIds(collection: string, count: number): Promise<number[]> {
  if (count <= 0) return [];
  const sequence = await prisma.sequence.upsert({
    where: { name: collection },
    update: { value: { increment: count } },
    create: { name: collection, value: count },
  });
  const first = sequence.value - count + 1;
  return Array.from({ length: count }, (_, index) => first + index);
}
