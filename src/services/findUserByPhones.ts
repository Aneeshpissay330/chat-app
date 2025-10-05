import firestore from '@react-native-firebase/firestore';
import type { UserDoc } from './user';

// Very lightweight normalizer. In production, prefer libphonenumber-js for strict E.164.
export function normalizeVariants(raw: string): string[] {
  const cleaned = raw.replace(/[^\d]/g, ''); // keep digits only
  let finalE164 = '';

  if (cleaned.length === 10) {
    // e.g. "7892235545" ➝ "+917892235545"
    finalE164 = `+91${cleaned}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // e.g. "917892235545" ➝ "+917892235545"
    finalE164 = `+${cleaned}`;
  } else if (cleaned.length === 13 && cleaned.startsWith('091')) {
    // Just in case someone adds a leading 0 before 91 (rare case)
    finalE164 = `+${cleaned.slice(1)}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    // e.g. "07892235545" ➝ "+917892235545"
    finalE164 = `+91${cleaned.slice(1)}`;
  }

  const last10 = cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;

  const uniq = new Set<string>();
  if (finalE164) uniq.add(finalE164); // Always: +917892235545
  if (cleaned) uniq.add(cleaned); // Raw digits: 917892235545
  if (last10) uniq.add(last10); // Last 10 digits: 7892235545

  return Array.from(uniq);
}

export async function findUsersByPhones(
  phones: string[],
): Promise<(UserDoc & { id: string })[]> {
  const variants = new Set<string>();
  phones.forEach(p => normalizeVariants(p).forEach(v => variants.add(v)));

  const all = Array.from(variants);
  if (!all.length) return [];

  const batches = [];
  while (all.length) batches.push(all.splice(0, 10));

  const results: (UserDoc & { id: string })[] = [];

  for (const values of batches) {
    const snap = await firestore()
      .collection('users')
      .where('searchablePhones', 'array-contains-any', values)
      .get(); // ⬅️ Removed .limit(1)

    snap.forEach(doc => {
      results.push({ id: doc.id, ...(doc.data() as UserDoc) });
    });
  }

  // Optionally, deduplicate by UID
  const seen = new Set<string>();
  return results.filter(user => {
    if (seen.has(user.uid)) return false;
    seen.add(user.uid);
    return true;
  });
}
