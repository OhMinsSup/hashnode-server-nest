import slugifyCJK from 'cjk-slug';
import slugify from 'slugify';
import { createHmac } from 'crypto';

export const escapeForUrl = (text: string) =>
  text
    .replace(
      /[^0-9a-zA-Zㄱ-힣.\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf -]/g,
      '',
    )
    .trim()
    .replace(/ /g, '-')
    .replace(/--+/g, '-')
    .replace(/\.+$/, '');

const G = 0.35;

export function calculateRankingScore(likes: number, hourAge: number) {
  return likes / Math.pow(hourAge + 2, G);
}

export function getSlug(text: string) {
  const slug = slugifyCJK(text);
  return slugify(slug, { trim: true, lower: true });
}

export function generateHash(text: string, salt: string) {
  return createHmac('sha256', salt).update(text).digest('hex');
}
