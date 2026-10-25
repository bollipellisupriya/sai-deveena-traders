import fs from 'fs';
import path from 'path';

const productDir = path.resolve('public/images/products');
const catDir = path.resolve('public/images/categories');
if (!fs.existsSync(productDir)) fs.mkdirSync(productDir, { recursive: true });
if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

function createPouchSvg({ title, subtitle, mainColor = '#166534', lightColor = '#f0fdf4', accent = '#f59e0b', artSvg }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="100%" height="100%">
  <defs>
    <linearGradient id="pouchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${mainColor}"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
    <linearGradient id="sealGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#dcfce7"/>
      <stop offset="100%" stop-color="${mainColor}"/>
    </linearGradient>
    <filter id="shadow" x="-8%" y="-6%" width="116%" height="116%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="rgba(15, 23, 42, 0.16)"/>
    </filter>
  </defs>

  <!-- Pouch Body with top seal indent -->
  <g filter="url(#shadow)">
    <!-- Main Pouch shape with ribbed top seal -->
    <path d="M 60,35 L 340,35 Q 355,35 352,55 L 342,435 Q 340,455 320,455 L 80,455 Q 60,455 58,435 L 48,55 Q 45,35 60,35 Z" fill="url(#pouchGrad)" stroke="#cbd5e1" stroke-width="2"/>
    
    <!-- Top Foil Seal with heat seal ridges -->
    <path d="M 58,35 L 342,35 Q 350,35 348,52 L 52,52 Q 50,35 58,35 Z" fill="url(#sealGrad)"/>
    <line x1="60" y1="41" x2="340" y2="41" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
    <line x1="60" y1="47" x2="340" y2="47" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>

    <!-- Top Green Header Band with Sai Deveena emblem notch -->
    <rect x="52" y="52" width="296" height="75" fill="url(#headerGrad)"/>
    <text x="200" y="80" text-anchor="middle" fill="#ffffff" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="22" letter-spacing="1">
      ${title}
    </text>
    <text x="200" y="105" text-anchor="middle" fill="#fef08a" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="13" letter-spacing="0.5">
      ${subtitle}
    </text>

    <!-- Brand emblem circle on top center -->
    <circle cx="200" cy="52" r="16" fill="#ffffff" stroke="${mainColor}" stroke-width="2"/>
    <path d="M 194,52 Q 200,44 206,52 Q 200,60 194,52 Z" fill="${accent}"/>

    <!-- Center Product Illustration Art -->
    <g transform="translate(60, 135)">
      ${artSvg}
    </g>

    <!-- Bottom Wave / Accent Stripe -->
    <path d="M 60,395 Q 200,420 340,395 L 338,435 Q 338,455 318,455 L 82,455 Q 62,455 60,435 Z" fill="${mainColor}"/>
    <text x="200" y="438" text-anchor="middle" fill="#ffffff" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="12" letter-spacing="1.5">
      SAI DEVEENA TRADERS • 100% GENUINE
    </text>
  </g>
</svg>`;
}

const pouchDefinitions = [
  {
    filename: 'paddy-seeds-pouch.svg',
    title: 'PADDY SEEDS',
    subtitle: 'High Yield Hybrid Variety',
    mainColor: '#15803d',
    artSvg: `
      <!-- Paddy Sheaf Art -->
      <rect x="0" y="0" width="280" height="250" rx="12" fill="#fefce8" stroke="#fef08a"/>
      <g transform="translate(140, 140)">
        <path d="M 0,90 Q -20,20 -60,-40 Q -30,-20 0,90 Z" fill="#eab308"/>
        <path d="M 0,90 Q 0,10 0,-60 Q 15,-20 0,90 Z" fill="#ca8a04"/>
        <path d="M 0,90 Q 20,20 60,-40 Q 30,-20 0,90 Z" fill="#eab308"/>
        <!-- Golden Grains -->
        <ellipse cx="-45" cy="-25" rx="14" ry="7" transform="rotate(-40 -45 -25)" fill="#fde047" stroke="#ca8a04"/>
        <ellipse cx="-30" cy="-5" rx="14" ry="7" transform="rotate(-30 -30 -5)" fill="#facc15" stroke="#ca8a04"/>
        <ellipse cx="0" cy="-45" rx="14" ry="7" transform="rotate(0 0 -45)" fill="#fde047" stroke="#ca8a04"/>
        <ellipse cx="0" cy="-20" rx="14" ry="7" transform="rotate(0 0 -20)" fill="#facc15" stroke="#ca8a04"/>
        <ellipse cx="45" cy="-25" rx="14" ry="7" transform="rotate(40 45 -25)" fill="#fde047" stroke="#ca8a04"/>
        <ellipse cx="30" cy="-5" rx="14" ry="7" transform="rotate(30 30 -5)" fill="#facc15" stroke="#ca8a04"/>
      </g>
      <text x="140" y="235" text-anchor="middle" fill="#854d0e" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="14">
        PREMIUM CERTIFIED PADDY
      </text>
    `
  },
  {
    filename: 'maize-seeds-pouch.svg',
    title: 'MAIZE SEEDS',
    subtitle: 'Golden Kernel Hybrid',
    mainColor: '#b45309',
    artSvg: `
      <rect x="0" y="0" width="280" height="250" rx="12" fill="#fffbeb" stroke="#fde68a"/>
      <!-- Corn Cob Art -->
      <g transform="translate(140, 130)">
        <!-- Corn Husks (Leaves) -->
        <path d="M -50,60 Q -70,-10 -30,-50 Q -30,20 -10,70 Z" fill="#4ade80" stroke="#16a34a"/>
        <path d="M 50,60 Q 70,-10 30,-50 Q 30,20 10,70 Z" fill="#22c55e" stroke="#15803d"/>
        <!-- Golden Corn Cob -->
        <rect x="-26" y="-55" width="52" height="120" rx="26" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
        <!-- Corn kernels pattern -->
        <circle cx="-12" cy="-35" r="5" fill="#fde047"/><circle cx="0" cy="-35" r="5" fill="#fde047"/><circle cx="12" cy="-35" r="5" fill="#fde047"/>
        <circle cx="-12" cy="-18" r="5" fill="#eab308"/><circle cx="0" cy="-18" r="5" fill="#fde047"/><circle cx="12" cy="-18" r="5" fill="#eab308"/>
        <circle cx="-12" cy="0" r="5" fill="#fde047"/><circle cx="0" cy="0" r="5" fill="#fde047"/><circle cx="12" cy="0" r="5" fill="#fde047"/>
        <circle cx="-12" cy="18" r="5" fill="#eab308"/><circle cx="0" cy="18" r="5" fill="#fde047"/><circle cx="12" cy="18" r="5" fill="#eab308"/>
        <circle cx="-12" cy="35" r="5" fill="#fde047"/><circle cx="0" cy="35" r="5" fill="#fde047"/><circle cx="12" cy="35" r="5" fill="#fde047"/>
      </g>
      <text x="140" y="235" text-anchor="middle" fill="#92400e" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="14">
        HIGH YIELD SWEET MAIZE
      </text>
    `
  },
  {
    filename: 'cotton-seeds-pouch.svg',
    title: 'COTTON SEEDS',
    subtitle: 'Bt-II Bollworm Resistant',
    mainColor: '#1e3a8a',
    artSvg: `
      <rect x="0" y="0" width="280" height="250" rx="12" fill="#eff6ff" stroke="#bfdbfe"/>
      <!-- Fluffy Cotton Bolls -->
      <g transform="translate(140, 125)">
        <!-- Calyx (green base) -->
        <path d="M 0,55 L -35,35 L -15,15 L 0,35 L 15,15 L 35,35 Z" fill="#15803d"/>
        <!-- 4 fluffy white cloud bolls -->
        <circle cx="-25" cy="-5" r="28" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
        <circle cx="25" cy="-5" r="28" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
        <circle cx="0" cy="-35" r="28" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
        <circle cx="0" cy="5" r="30" fill="#f8fafc" stroke="#93c5fd" stroke-width="1.5"/>
      </g>
      <text x="140" y="235" text-anchor="middle" fill="#1e40af" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="14">
        WHITE GOLD COTTON HYBRID
      </text>
    `
  },
  {
    filename: 'veg-seeds-combo-pouch.svg',
    title: 'VEG SEEDS COMBO',
    subtitle: '5 in 1 High Germination Pack',
    mainColor: '#15803d',
    artSvg: `
      <rect x="0" y="0" width="280" height="250" rx="12" fill="#f0fdf4" stroke="#bbf7d0"/>
      <!-- Vegetables Collage -->
      <g transform="translate(140, 125)">
        <!-- Tomato -->
        <circle cx="-35" cy="5" r="32" fill="#ef4444" stroke="#b91c1c"/>
        <path d="M -35,-27 L -42,-35 L -35,-32 L -28,-35 Z" fill="#15803d"/>
        <!-- Chilli -->
        <path d="M 30,35 Q 55,0 40,-45 Q 25,-40 20,-30 Q 15,10 30,35 Z" fill="#dc2626" stroke="#991b1b"/>
        <!-- Brinjal (Eggplant) -->
        <ellipse cx="0" cy="-10" rx="22" ry="34" transform="rotate(-15 0 -10)" fill="#7c3aed" stroke="#5b21b6"/>
        <path d="M -5,-45 L 5,-45 L 8,-35 L -8,-35 Z" fill="#15803d"/>
      </g>
      <text x="140" y="235" text-anchor="middle" fill="#166534" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="14">
        TOMATO • CHILLI • BRINJAL • BHENDI
      </text>
    `
  },
  {
    filename: 'groundnut-seeds-pouch.svg',
    title: 'GROUNDNUT SEEDS',
    subtitle: 'High Oil Content Variety',
    mainColor: '#9a3412',
    artSvg: `
      <rect x="0" y="0" width="280" height="250" rx="12" fill="#fff7ed" stroke="#fed7aa"/>
      <!-- Groundnut Pods -->
      <g transform="translate(140, 125)">
        <g transform="rotate(-25)">
          <rect x="-45" y="-18" width="90" height="36" rx="18" fill="#d97706" stroke="#92400e" stroke-width="2"/>
          <circle cx="-18" cy="0" r="14" fill="#f59e0b"/>
          <circle cx="18" cy="0" r="14" fill="#f59e0b"/>
        </g>
        <g transform="translate(20, 20) rotate(20)">
          <rect x="-40" y="-16" width="80" height="32" rx="16" fill="#b45309" stroke="#78350f" stroke-width="2"/>
        </g>
      </g>
      <text x="140" y="235" text-anchor="middle" fill="#9a3412" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="14">
        BOLD PEANUT / VERUSANAGA
      </text>
    `
  },
  {
    filename: 'sunflower-seeds-pouch.svg',
    title: 'SUNFLOWER SEEDS',
    subtitle: 'Certified Agro Hybrid',
    mainColor: '#ca8a04',
    artSvg: `
      <rect x="0" y="0" width="280" height="250" rx="12" fill="#fefce8" stroke="#fef08a"/>
      <!-- Sunflower Art -->
      <g transform="translate(140, 125)">
        <!-- Petals -->
        <g fill="#facc15" stroke="#ca8a04">
          <ellipse cx="0" cy="-45" rx="10" ry="24"/>
          <ellipse cx="0" cy="45" rx="10" ry="24"/>
          <ellipse cx="-45" cy="0" rx="24" ry="10"/>
          <ellipse cx="45" cy="0" rx="24" ry="10"/>
          <ellipse cx="-32" cy="-32" rx="10" ry="24" transform="rotate(-45 -32 -32)"/>
          <ellipse cx="32" cy="-32" rx="10" ry="24" transform="rotate(45 32 -32)"/>
          <ellipse cx="-32" cy="32" rx="10" ry="24" transform="rotate(45 -32 32)"/>
          <ellipse cx="32" cy="32" rx="10" ry="24" transform="rotate(-45 32 32)"/>
        </g>
        <!-- Center Seed Disc -->
        <circle cx="0" cy="0" r="28" fill="#713f12" stroke="#451a03" stroke-width="2"/>
        <circle cx="0" cy="0" r="24" fill="#854d0e"/>
      </g>
      <text x="140" y="235" text-anchor="middle" fill="#713f12" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="14">
        HIGH OIL HYBRID SUNFLOWER
      </text>
    `
  },
  {
    filename: 'tomato-seeds-pouch.svg',
    title: 'TOMATO SEEDS',
    subtitle: 'F1 Hybrid Red Bounty',
    mainColor: '#dc2626',
    artSvg: `
      <rect x="0" y="0" width="280" height="250" rx="12" fill="#fef2f2" stroke="#fecaca"/>
      <!-- Tomato Art -->
      <g transform="translate(140, 125)">
        <circle cx="0" cy="5" r="45" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
        <!-- Star Calyx Leaf -->
        <path d="M 0,-40 L -6,-28 L -20,-30 L -10,-20 L -16,-8 L 0,-16 L 16,-8 L 10,-20 L 20,-30 L 6,-28 Z" fill="#15803d"/>
        <!-- Stem -->
        <path d="M 0,-40 Q 5,-50 12,-52" stroke="#15803d" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Shine highlight -->
        <ellipse cx="-16" cy="-12" rx="12" ry="6" transform="rotate(-30 -16 -12)" fill="rgba(255,255,255,0.45)"/>
      </g>
      <text x="140" y="235" text-anchor="middle" fill="#991b1b" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="14">
        FIRM • GLOSSY RED • HIGH YIELD
      </text>
    `
  },
  {
    filename: 'chilli-seeds-pouch.svg',
    title: 'CHILLI SEEDS',
    subtitle: 'Super Hot Hybrid Variety',
    mainColor: '#b91c1c',
    artSvg: `
      <rect x="0" y="0" width="280" height="250" rx="12" fill="#fff1f2" stroke="#fecdd3"/>
      <!-- 2 Chillies Art -->
      <g transform="translate(140, 125)">
        <!-- Chilli 1 -->
        <path d="M -15,-40 Q 20,-20 15,25 Q 10,45 -5,55 Q -2,45 0,25 Q 5,-15 -20,-35 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
        <path d="M -18,-42 L -12,-38 L -15,-34 Z" fill="#15803d"/>
        <!-- Chilli 2 -->
        <path d="M 10,-35 Q -30,-15 -20,25 Q -15,45 -5,52 Q -12,38 -15,15 Q -18,-15 5,-30 Z" fill="#ea580c" stroke="#c2410c" stroke-width="2"/>
      </g>
      <text x="140" y="235" text-anchor="middle" fill="#9f1239" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="14">
        SPICY TEJA HYBRID CHILLI
      </text>
    `
  },
  {
    filename: 'dap-fertilizer-pouch.svg',
    title: 'DAP FERTILIZER',
    subtitle: 'Di-Ammonium Phosphate (18:46:0)',
    mainColor: '#15803d',
    artSvg: `
      <rect x="0" y="0" width="280" height="250" rx="12" fill="#f0fdf4" stroke="#bbf7d0"/>
      <!-- Woven Fertilizer Sack -->
      <g transform="translate(140, 125)">
        <path d="M -50,-50 L 50,-50 L 58,45 L -58,45 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5"/>
        <rect x="-42" y="-35" width="84" height="65" fill="#15803d" rx="6"/>
        <text x="0" y="-8" text-anchor="middle" fill="#ffffff" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="24">
          DAP
        </text>
        <text x="0" y="16" text-anchor="middle" fill="#fef08a" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="14">
          50 KG
        </text>
      </g>
      <text x="140" y="235" text-anchor="middle" fill="#14532d" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="14">
        ROOT BOOSTER • 100% GENUINE
      </text>
    `
  },
  {
    filename: 'sunflower-oil-bottle.svg',
    title: 'SUNFLOWER OIL',
    subtitle: 'Pure Refined Cooking Oil 1 Ltr',
    mainColor: '#ca8a04',
    artSvg: `
      <rect x="0" y="0" width="280" height="250" rx="12" fill="#fefce8" stroke="#fef08a"/>
      <!-- Clear Oil Bottle with golden oil -->
      <g transform="translate(140, 120)">
        <!-- Cap -->
        <rect x="-12" y="-55" width="24" height="15" rx="3" fill="#eab308" stroke="#a16207"/>
        <!-- Neck -->
        <rect x="-8" y="-40" width="16" height="15" fill="#fef9c3" stroke="#fde047"/>
        <!-- Bottle Body -->
        <path d="M -8,-25 Q -32,0 -30,55 L 30,55 Q 32,0 8,-25 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
        <!-- Label -->
        <rect x="-24" y="0" width="48" height="40" rx="4" fill="#ffffff" stroke="#eab308"/>
        <text x="0" y="20" text-anchor="middle" fill="#a16207" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="11">
          SUNFLOWER
        </text>
        <text x="0" y="32" text-anchor="middle" fill="#15803d" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="10">
          1 LITRE
        </text>
      </g>
      <text x="140" y="235" text-anchor="middle" fill="#854d0e" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="14">
        HEALTHY & LIGHT COOKING OIL
      </text>
    `
  }
];

pouchDefinitions.forEach(def => {
  const svgContent = createPouchSvg(def);
  fs.writeFileSync(path.join(productDir, def.filename), svgContent);
  console.log(`Created ${def.filename}`);
});

console.log('All product pouches generated successfully!');
