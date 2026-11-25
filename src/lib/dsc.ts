// Price table copied from the website's DSC application form (bookfxorder.com/digital-signature).
// Prices are in INR before GST, keyed by validity in years.

export type Region = 'Indian' | 'Foreign';
export type Category = 'Individual' | 'Organization' | 'DGFT' | 'DocSigner';
export type CertType = 'Sign' | 'Encrypt' | 'Both';
export type Validity = '1' | '2' | '3';

type ByValidity = Record<Validity, number>;

const indianBasic: ByValidity = { 1: 720, 2: 839, 3: 1271 };
const indianBoth: ByValidity = { 1: 1441, 2: 1694, 3: 2542 };
const foreignBasic: ByValidity = { 1: 3000, 2: 3800, 3: 5700 };
const foreignBoth: ByValidity = { 1: 6000, 2: 7600, 3: 11400 };
const docSigner: Record<CertType, ByValidity> = {
  Sign: { 1: 7500, 2: 9000, 3: 13500 },
  Encrypt: { 1: 7500, 2: 9000, 3: 13500 },
  Both: { 1: 15000, 2: 18000, 3: 27000 },
};

const PRICES: Record<Region, Partial<Record<Category, Record<CertType, ByValidity> | ByValidity>>> = {
  Indian: {
    Individual: { Sign: indianBasic, Encrypt: indianBasic, Both: indianBoth },
    Organization: { Sign: indianBasic, Encrypt: indianBasic, Both: indianBoth },
    DGFT: { 1: 1441, 2: 1695, 3: 2542 },
    DocSigner: docSigner,
  },
  Foreign: {
    Individual: { Sign: foreignBasic, Encrypt: foreignBasic, Both: foreignBoth },
    Organization: { Sign: foreignBasic, Encrypt: foreignBasic, Both: foreignBoth },
  },
};

export const CATEGORIES: Record<Region, Category[]> = {
  Indian: ['Individual', 'Organization', 'DGFT', 'DocSigner'],
  Foreign: ['Individual', 'Organization'],
};

export const CERT_TYPE_LABELS: Record<CertType, string> = {
  Sign: 'Sign',
  Encrypt: 'Encrypt',
  Both: 'Sign + Encrypt',
};

export function dscQuote(region: Region, category: Category, type: CertType, validity: Validity) {
  const entry = PRICES[region][category];
  let amount = 0;
  if (entry) {
    // DGFT has a single price per validity, the rest are keyed by certificate type first.
    amount = category === 'DGFT' ? (entry as ByValidity)[validity] : (entry as Record<CertType, ByValidity>)[type][validity];
  }
  const gst = Math.round(0.18 * amount);
  return { amount, gst, total: amount + gst };
}

// Same wording as the website's plan summary, e.g. "Indian · Individual · Sign · 1 Year — ₹850 incl. GST".
export function dscPlanSummary(region: Region, category: Category, type: CertType, validity: Validity) {
  const { total } = dscQuote(region, category, type, validity);
  const plan = category === 'DGFT' ? category : `${category} · ${CERT_TYPE_LABELS[type]}`;
  const years = `${validity} Year${validity === '1' ? '' : 's'}`;
  return `${region} · ${plan} · ${years} — ₹${total.toLocaleString('en-IN')} incl. GST`;
}
