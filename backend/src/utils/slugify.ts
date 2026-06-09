import slugifyLib from 'slugify';
import { Model } from 'mongoose';

const slugifyOptions = {
  lower: true,
  strict: true,
  trim: true,
};

export function generateSlug(title: string): string {
  return slugifyLib(title, slugifyOptions);
}

export async function generateUniqueSlug(
  title: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Model: Model<any>,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query: Record<string, unknown> = { slug };
    if (excludeId) {
      query['_id'] = { $ne: excludeId };
    }

    const existing = await Model.findOne(query).select('_id').lean();

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
