/**
 * Hakee Ilojaloin Jalkaterapian julkiset arvostelut Vellosta ja tallentaa ne
 * tiedostoon src/data/reviews.json. Ajetaan automaattisesti ennen buildia
 * (npm run build -> prebuild).
 *
 * Vellon rajapinta ei salli hakua suoraan selaimesta (ei CORS-otsakkeita),
 * joten arvostelut haetaan koontivaiheessa. Jos haku epäonnistuu, vanha
 * tiedosto säilytetään eikä build kaadu.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMPANY_ID = 'b2c5bb1e-ee2d-440e-86fc-cf9c81836bb1';
const PROFILE_URL = 'https://vello.fi/ilojaloin-jalkaterapia?locale=fi';
const REVIEWS_URL = 'https://vello.fi/_api/review';
const OUTPUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/reviews.json');
const PAGE_SIZE = 50;
const MAX_PAGES = 20;

const headers = { 'User-Agent': 'Mozilla/5.0 (ilojaloin.fi build)' };

async function fetchAllReviews() {
  const reviews = [];
  let offset = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({
      company: COMPANY_ID,
      op: 'public',
      limit: String(PAGE_SIZE),
      sort: 'descending',
    });
    if (offset) params.set('offset', offset);
    const res = await fetch(`${REVIEWS_URL}?${params}`, { headers });
    if (!res.ok) throw new Error(`Review API responded ${res.status}`);
    const json = await res.json();
    reviews.push(...(json?.data?.reviews ?? []));
    offset = json?.next_offset || null;
    if (!offset) break;
  }
  return reviews;
}

// Koko profiilin keskiarvo ja arvostelumäärä luetaan sivun schema.org-datasta
async function fetchStats() {
  const res = await fetch(PROFILE_URL, { headers });
  if (!res.ok) throw new Error(`Profile page responded ${res.status}`);
  const html = await res.text();
  const rating = html.match(/"ratingValue":([\d.]+)/);
  const count = html.match(/"reviewCount":(\d+)/);
  if (!rating || !count) return null;
  return { rating: Number(rating[1]), count: Number(count[1]) };
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUTPUT, 'utf8'));
  } catch {
    return null;
  }
}

try {
  const [reviews, stats] = await Promise.all([fetchAllReviews(), fetchStats()]);

  const items = reviews
    .filter((r) => r.public !== false && r.feedback && r.feedback.trim())
    .map((r) => ({
      id: r.id,
      score: r.score,
      text: r.feedback.trim(),
      author: r.author_name || '',
      created: new Date(r.created * 1000).toISOString().slice(0, 10),
    }));

  const data = {
    rating: stats?.rating ?? null,
    count: stats?.count ?? null,
    reviews: items,
  };

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Fetched ${items.length} reviews with text (profile: ${data.rating} / ${data.count}).`);
} catch (err) {
  console.warn(`Could not fetch Vello reviews: ${err.message}`);
  if (!(await readExisting())) {
    await mkdir(dirname(OUTPUT), { recursive: true });
    await writeFile(OUTPUT, JSON.stringify({ rating: null, count: null, reviews: [] }, null, 2) + '\n', 'utf8');
  }
}
