import fs from 'fs';
import path from 'path';

const catDir = path.resolve('public/images/categories');
if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

function createQuickCategoryIcon({ bg, border, iconSvg }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <circle cx="50" cy="50" r="48" fill="${bg}" stroke="${border}" stroke-width="1.5"/>
  <g transform="translate(20, 20)">
    ${iconSvg}
  </g>
</svg>`;
}

const icons = [
  {
    filename: 'quick-seeds.svg',
    bg: '#fef3c7',
    border: '#fde68a',
    iconSvg: `
      <!-- Seeds bowl/pouch -->
      <g transform="translate(10, 8)">
        <ellipse cx="20" cy="32" rx="22" ry="12" fill="#d97706" stroke="#92400e" stroke-width="2"/>
        <path d="M 0,32 Q 20,52 40,32 Z" fill="#b45309"/>
        <!-- Golden grains -->
        <circle cx="12" cy="24" r="5" fill="#facc15"/>
        <circle cx="22" cy="22" r="5.5" fill="#fde047"/>
        <circle cx="28" cy="25" r="4.5" fill="#facc15"/>
        <!-- Green sprout growing out -->
        <path d="M 20,20 Q 14,8 8,10 Q 14,16 20,20 Z" fill="#22c55e"/>
        <path d="M 20,20 Q 26,6 32,8 Q 26,16 20,20 Z" fill="#16a34a"/>
      </g>
    `
  },
  {
    filename: 'quick-fertilizers.svg',
    bg: '#dcfce7',
    border: '#bbf7d0',
    iconSvg: `
      <!-- Fertilizer Sack -->
      <g transform="translate(10, 8)">
        <path d="M 6,10 L 34,10 L 38,44 L 2,44 Z" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
        <rect x="8" y="18" width="24" height="18" rx="3" fill="#ffffff"/>
        <text x="20" y="30" text-anchor="middle" fill="#15803d" font-family="sans-serif" font-weight="900" font-size="9">NPK</text>
        <path d="M 4,10 Q 20,4 36,10" stroke="#14532d" stroke-width="2" fill="none"/>
      </g>
    `
  },
  {
    filename: 'quick-cropcare.svg',
    bg: '#e0f2fe',
    border: '#bae6fd',
    iconSvg: `
      <!-- Crop Care Spray Bottle -->
      <g transform="translate(10, 8)">
        <rect x="15" y="6" width="10" height="6" rx="2" fill="#0284c7"/>
        <path d="M 20,6 L 20,0 L 28,0 L 26,6" stroke="#0369a1" stroke-width="2.5" fill="none"/>
        <path d="M 12,12 L 28,12 L 32,44 L 8,44 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
        <!-- Leaf symbol -->
        <path d="M 20,22 Q 28,26 24,34 Q 16,34 20,22 Z" fill="#22c55e"/>
      </g>
    `
  },
  {
    filename: 'quick-groceries.svg',
    bg: '#ffedd5',
    border: '#fed7aa',
    iconSvg: `
      <!-- Grocery Bag with apple/bread -->
      <g transform="translate(10, 8)">
        <path d="M 6,14 L 34,14 L 32,44 L 8,44 Z" fill="#f97316" stroke="#ea580c" stroke-width="2"/>
        <circle cx="20" cy="10" r="7" fill="#ef4444"/>
        <path d="M 20,3 L 22,0" stroke="#15803d" stroke-width="2"/>
        <rect x="12" y="6" width="6" height="12" rx="3" fill="#84cc16"/>
        <line x1="12" y1="26" x2="28" y2="26" stroke="#ffffff" stroke-width="2"/>
      </g>
    `
  },
  {
    filename: 'quick-household.svg',
    bg: '#fef9c3',
    border: '#fef08a',
    iconSvg: `
      <!-- Cooking Oil / Household jug -->
      <g transform="translate(10, 8)">
        <path d="M 10,12 L 30,12 L 34,44 L 6,44 Z" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
        <rect x="16" y="6" width="8" height="6" fill="#ca8a04"/>
        <path d="M 30,18 C 38,18 38,36 30,36" stroke="#ca8a04" stroke-width="3" fill="none"/>
        <circle cx="20" cy="28" r="5" fill="#ffffff" opacity="0.6"/>
      </g>
    `
  },
  {
    filename: 'quick-cleaning.svg',
    bg: '#f1f5f9',
    border: '#e2e8f0',
    iconSvg: `
      <!-- Cleaning Spray / Detergent -->
      <g transform="translate(10, 8)">
        <path d="M 14,14 L 28,14 L 30,44 L 10,44 Z" fill="#64748b" stroke="#475569" stroke-width="2"/>
        <!-- Trigger spray head -->
        <path d="M 16,8 L 26,8 L 26,14 L 16,14 Z" fill="#0ea5e9"/>
        <path d="M 26,8 L 36,4 L 34,10 L 26,12" fill="#0284c7"/>
        <circle cx="16" cy="28" r="4" fill="#38bdf8"/>
        <circle cx="24" cy="34" r="3" fill="#38bdf8"/>
      </g>
    `
  },
  {
    filename: 'quick-personal-care.svg',
    bg: '#fce7f3',
    border: '#fbcfe8',
    iconSvg: `
      <!-- Lotion / Care Bottle -->
      <g transform="translate(10, 8)">
        <rect x="14" y="16" width="16" height="28" rx="8" fill="#ec4899" stroke="#db2777" stroke-width="2"/>
        <rect x="18" y="10" width="8" height="6" fill="#f472b6"/>
        <!-- Pump dispenser -->
        <path d="M 22,10 L 22,4 L 32,4" stroke="#be185d" stroke-width="2.5" fill="none"/>
        <circle cx="22" cy="28" r="4" fill="#ffffff" opacity="0.8"/>
      </g>
    `
  },
  {
    filename: 'quick-more.svg',
    bg: '#f8fafc',
    border: '#cbd5e1',
    iconSvg: `
      <!-- 3 dots 'More' icon -->
      <g transform="translate(10, 16)">
        <circle cx="8" cy="14" r="4" fill="#475569"/>
        <circle cx="20" cy="14" r="4" fill="#475569"/>
        <circle cx="32" cy="14" r="4" fill="#475569"/>
      </g>
    `
  }
];

icons.forEach(ic => {
  const content = createQuickCategoryIcon(ic);
  fs.writeFileSync(path.join(catDir, ic.filename), content);
  console.log(`Created ${ic.filename}`);
});

console.log('Category icons created!');
