import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/images/products');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Product visual definitions for crisp, professional packaging visuals
const productAssets = [
  {
    filename: 'soyabean-seed.svg',
    title: 'SOYABEAN JS-335',
    telugu: 'సోయాబీన్ విత్తనాలు',
    brand: 'MAHYCO SEEDS',
    pack: '30 KG BAG',
    bg1: '#15803d',
    bg2: '#166534',
    accent: '#facc15',
    category: 'CERTIFIED SEEDS',
    iconType: 'pod'
  },
  {
    filename: 'maize-seed.svg',
    title: 'HYBRID MAIZE',
    telugu: 'మొక్కజొన్న విత్తనాలు',
    brand: 'KAVERI SEEDS',
    pack: '4 KG PACK',
    bg1: '#ca8a04',
    bg2: '#a16207',
    accent: '#fef08a',
    category: 'HYBRID SEEDS',
    iconType: 'corn'
  },
  {
    filename: 'paddy-seed.svg',
    title: 'PADDY BPT 5204',
    telugu: 'సాంబ మసూరి వరి విత్తనాలు',
    brand: 'STATE CERTIFIED',
    pack: '25 KG BAG',
    bg1: '#047857',
    bg2: '#065f46',
    accent: '#6ee7b7',
    category: 'HIGH YIELD PADDY',
    iconType: 'paddy'
  },
  {
    filename: 'redgram-seed.svg',
    title: 'RED GRAM (TUR)',
    telugu: 'కంది విత్తనాలు',
    brand: 'NIRMAL SEEDS',
    pack: '2 KG PACK',
    bg1: '#b45309',
    bg2: '#78350f',
    accent: '#fde68a',
    category: 'PULSES & GRAINS',
    iconType: 'seeds'
  },
  {
    filename: 'chilli-seed.svg',
    title: 'TEJA HYBRID CHILLI',
    telugu: 'తేజా మిరప విత్తనాలు',
    brand: 'SYNGENTA',
    pack: '10 G FOIL PACK',
    bg1: '#b91c1c',
    bg2: '#991b1b',
    accent: '#fca5a5',
    category: 'VEGETABLE SEEDS',
    iconType: 'chilli'
  },
  {
    filename: 'veg-seeds.svg',
    title: 'SEASONAL VEGETABLE KIT',
    telugu: 'కూరగాయల విత్తనాల కిట్',
    brand: 'LOCAL AGRO',
    pack: '5-IN-1 COMBO',
    bg1: '#15803d',
    bg2: '#047857',
    accent: '#86efac',
    category: 'KITCHEN GARDEN',
    iconType: 'combo'
  },
  {
    filename: 'zinc-sulphate.svg',
    title: 'ZINC SULPHATE 21%',
    telugu: 'జింక్ సల్ఫేట్ సూక్ష్మ పోషకం',
    brand: 'COROMANDEL',
    pack: '5 KG BAG',
    bg1: '#0369a1',
    bg2: '#075985',
    accent: '#7dd3fc',
    category: 'MICRONUTRIENT',
    iconType: 'crystal'
  },
  {
    filename: 'humic-acid.svg',
    title: 'HUMIC ACID 98% FLAKES',
    telugu: 'హ్యూమిక్ యాసిడ్ సేంద్రీయ ఎరువు',
    brand: 'AGROKING',
    pack: '500 G PACK',
    bg1: '#1f2937',
    bg2: '#111827',
    accent: '#4ade80',
    category: 'BIO-STIMULANT',
    iconType: 'leaf'
  },
  {
    filename: 'boron.svg',
    title: 'BORON 20% SOLUBLE',
    telugu: 'బోరాన్ 20% సూక్ష్మ పోషకం',
    brand: 'MULTIPLEX',
    pack: '250 G PACK',
    bg1: '#4338ca',
    bg2: '#3730a3',
    accent: '#a5b4fc',
    category: 'FLOWERING & FRUITING',
    iconType: 'flower'
  },
  {
    filename: 'neem-cake.svg',
    title: 'ORGANIC NEEM CAKE',
    telugu: 'వేప పిండి సేంద్రీయ ఎరువు',
    brand: 'GREEN EARTH',
    pack: '25 KG BAG',
    bg1: '#2e7d32',
    bg2: '#1b5e20',
    accent: '#c8e6c9',
    category: 'SOIL CONDITIONER',
    iconType: 'neem'
  },
  {
    filename: 'dap-fertilizer.svg',
    title: 'DAP 18-46-0 / COMPLEX',
    telugu: 'డి.ఎ.పి కాంప్లెక్స్ ఎరువు',
    brand: 'IFFCO / COROMANDEL',
    pack: '50 KG BAG',
    bg1: '#c2410c',
    bg2: '#9a3412',
    accent: '#fdba74',
    category: 'FIELD FERTILIZER',
    iconType: 'granules'
  },
  {
    filename: 'neem-oil.svg',
    title: 'NEEM OIL 10000 PPM',
    telugu: 'వేప నూనె బయో పెస్టిసైడ్',
    brand: 'NAGARJUNA AGRO',
    pack: '1 LITRE BOTTLE',
    bg1: '#15803d',
    bg2: '#166534',
    accent: '#facc15',
    category: 'BIO-PESTICIDE',
    iconType: 'bottle'
  },
  {
    filename: 'imidacloprid.svg',
    title: 'IMIDACLOPRID 17.8% SL',
    telugu: 'ఇమిడాక్లోప్రిడ్ పురుగుమందు',
    brand: 'BAYER / CONFIDOR',
    pack: '250 ML BOTTLE',
    bg1: '#0284c7',
    bg2: '#0369a1',
    accent: '#38bdf8',
    category: 'SYSTEMIC INSECTICIDE',
    iconType: 'shield'
  },
  {
    filename: 'mancozeb.svg',
    title: 'MANCOZEB 75% WP',
    telugu: 'మాంకోజెబ్ శిలీంద్ర సంహారిణి',
    brand: 'UPL INDOFIL M-45',
    pack: '500 G PACK',
    bg1: '#b45309',
    bg2: '#92400e',
    accent: '#fde68a',
    category: 'BROAD SPECTRUM FUNGICIDE',
    iconType: 'plant'
  },
  {
    filename: 'coragen.svg',
    title: 'CORAGEN (CHLORANTRANILIPROLE)',
    telugu: 'కోరాజెన్ పురుగుమందు',
    brand: 'FMC AGRO',
    pack: '60 ML PACK',
    bg1: '#991b1b',
    bg2: '#7f1d1d',
    accent: '#fca5a5',
    category: 'CROP PROTECTION',
    iconType: 'bottle'
  },
  {
    filename: 'godrej-double.svg',
    title: 'GODREJ DOUBLE BOOSTER',
    telugu: 'పూత, పిందె వృద్ధి టానిక్',
    brand: 'GODREJ AGRO',
    pack: '100 ML BOTTLE',
    bg1: '#047857',
    bg2: '#065f46',
    accent: '#fde047',
    category: 'GROWTH BOOSTER',
    iconType: 'flower'
  },
  {
    filename: 'trichoderma.svg',
    title: 'TRICHODERMA VIRIDE',
    telugu: 'ట్రైకోడెర్మా విరిడే జీవ శిలీంద్రం',
    brand: 'KRISHI BIO',
    pack: '1 KG PACKET',
    bg1: '#15803d',
    bg2: '#166534',
    accent: '#a7f3d0',
    category: 'BIO-FUNGICIDE',
    iconType: 'leaf'
  },
  {
    filename: 'drip-lateral.svg',
    title: '16MM INLINE DRIP LATERAL',
    telugu: '16mm డ్రిప్ ఇరిగేషన్ పైపు',
    brand: 'JAIN IRRIGATION',
    pack: '400 METRE BUNDLE',
    bg1: '#0f172a',
    bg2: '#1e293b',
    accent: '#38bdf8',
    category: 'MICRO IRRIGATION',
    iconType: 'drip'
  },
  {
    filename: 'sprinkler-set.svg',
    title: 'MICRO SPRINKLERS WITH STAND',
    telugu: 'మైక్రో స్ప్రింక్లర్ నాజిల్స్ సెట్',
    brand: 'FINOLEX PLASTRO',
    pack: 'SET OF 10 UNITS',
    bg1: '#0369a1',
    bg2: '#0284c7',
    accent: '#bae6fd',
    category: 'IRRIGATION TOOLS',
    iconType: 'sprinkler'
  },
  {
    filename: 'screen-filter.svg',
    title: 'SCREEN FILTER 2 INCH',
    telugu: '2 అంగుళాల స్క్రీన్ ఫిల్టర్',
    brand: 'CAPTAIN AGRO',
    pack: '1 UNIT',
    bg1: '#334155',
    bg2: '#1e293b',
    accent: '#93c5fd',
    category: 'FILTRATION SYSTEM',
    iconType: 'filter'
  },
  {
    filename: 'ball-valves.svg',
    title: 'HEAVY DUTY BALL VALVES',
    telugu: 'డ్రిప్ బాల్ వాల్వ్‌లు',
    brand: 'SUPREME AGRO',
    pack: 'PACK OF 20 PIECES',
    bg1: '#c2410c',
    bg2: '#9a3412',
    accent: '#fed7aa',
    category: 'IRRIGATION VALVES',
    iconType: 'valve'
  },
  {
    filename: 'hose-pipe.svg',
    title: 'PVC DELIVERY HOSE PIPE',
    telugu: 'పివిసి డెలివరీ హోస్ పైపు',
    brand: 'KISAN GREEN',
    pack: '2.5 INCH X 50M',
    bg1: '#15803d',
    bg2: '#166534',
    accent: '#bbf7d0',
    category: 'WATER DELIVERY',
    iconType: 'hose'
  },
  {
    filename: 'battery-sprayer.svg',
    title: '16L 2-IN-1 BATTERY SPRAYER',
    telugu: '16 లీటర్ల బ్యాటరీ & మాన్యువల్ స్ప్రేయర్',
    brand: 'KISANKRAFT',
    pack: '1 COMPLETE UNIT',
    bg1: '#0284c7',
    bg2: '#0369a1',
    accent: '#facc15',
    category: 'FARM SPRAYER',
    iconType: 'sprayer'
  },
  {
    filename: 'secateur.svg',
    title: 'STAINLESS STEEL PRUNING SHEARS',
    telugu: 'ప్రూనింగ్ కట్టర్ & కత్తెర',
    brand: 'FALCON GARDEN TOOLS',
    pack: '1 PIECE',
    bg1: '#475569',
    bg2: '#334155',
    accent: '#f97316',
    category: 'PRUNING TOOLS',
    iconType: 'shears'
  },
  {
    filename: 'tarpaulin.svg',
    title: 'WATERPROOF TARPAULIN (150 GSM)',
    telugu: 'వాటర్‌ప్రూఫ్ రైతు పట్టా',
    brand: 'SILPAULIN',
    pack: '18 X 24 FEET',
    bg1: '#1d4ed8',
    bg2: '#1e40af',
    accent: '#fde047',
    category: 'CROP COVER & DRYING',
    iconType: 'sheet'
  },
  {
    filename: 'sickle.svg',
    title: 'TEMPERED STEEL SICKLE (KODAVALI)',
    telugu: 'స్టీల్ కొడవలి',
    brand: 'LOCAL ARTISAN',
    pack: '1 PIECE (WOODEN HANDLE)',
    bg1: '#64748b',
    bg2: '#475569',
    accent: '#f97316',
    category: 'HARVESTING TOOLS',
    iconType: 'sickle'
  },
  {
    filename: 'hand-weeder.svg',
    title: 'GARDEN HAND WEEDER & HOE',
    telugu: 'చేతి కలుపు తీసే పరికరం',
    brand: 'KISAN PRIDE',
    pack: '1 PIECE',
    bg1: '#15803d',
    bg2: '#14532d',
    accent: '#fef08a',
    category: 'WEEDING TOOLS',
    iconType: 'tool'
  },
  {
    filename: 'mulch-film.svg',
    title: 'SILVER-BLACK MULCHING FILM',
    telugu: 'సిల్వర్-బ్లాక్ మల్చింగ్ షీట్',
    brand: 'AGROFILM INDIA',
    pack: '25 MICRON (1.2M X 400M)',
    bg1: '#334155',
    bg2: '#0f172a',
    accent: '#e2e8f0',
    category: 'MOISTURE CONSERVATION',
    iconType: 'roll'
  },
  {
    filename: 'seed-trays.svg',
    title: 'SEEDLING PRO-TRAYS (98 CAVITY)',
    telugu: 'సీడ్లింగ్ నర్సరీ ట్రేలు',
    brand: 'GREENPLAST',
    pack: 'PACK OF 10 TRAYS',
    bg1: '#047857',
    bg2: '#065f46',
    accent: '#86efac',
    category: 'NURSERY SUPPLIES',
    iconType: 'tray'
  },
  {
    filename: 'vermicompost.svg',
    title: 'PURE ORGANIC VERMICOMPOST',
    telugu: 'సేంద్రీయ వర్మీ కంపోస్ట్ ఎరువు',
    brand: 'TELANGANA BIO FARM',
    pack: '40 KG BAG',
    bg1: '#78350f',
    bg2: '#451a03',
    accent: '#4ade80',
    category: 'ORGANIC MANURE',
    iconType: 'compost'
  },
  {
    filename: 'sticky-traps.svg',
    title: 'YELLOW & BLUE STICKY TRAPS',
    telugu: 'పసుపు & నీలం జిగురు అట్టలు',
    brand: 'BIOTRAP',
    pack: 'PACK OF 10 SHEETS',
    bg1: '#ca8a04',
    bg2: '#a16207',
    accent: '#38bdf8',
    category: 'PEST MONITORING',
    iconType: 'trap'
  }
];

function generatePackagingSVG(item) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${item.bg1}" />
      <stop offset="100%" stop-color="${item.bg2}" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="100%" stop-color="#f97316" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#000000" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Clean Studio Background -->
  <rect width="500" height="500" fill="#f8fafc" />
  <circle cx="250" cy="250" r="210" fill="#f1f5f9" opacity="0.6" />

  <!-- Package Outer Bag / Box Container -->
  <g filter="url(#shadow)">
    <!-- Main Packet Body -->
    <rect x="75" y="45" width="350" height="410" rx="20" fill="url(#bgGrad)" stroke="#ffffff" stroke-width="3" />
    
    <!-- Top Foil Seal Ridge -->
    <rect x="75" y="45" width="350" height="30" rx="8" fill="#ffffff" opacity="0.18" />
    <line x1="85" y1="60" x2="415" y2="60" stroke="#ffffff" stroke-dasharray="6,4" stroke-width="2" opacity="0.4" />
    
    <!-- Header Brand Ribbon -->
    <rect x="75" y="80" width="350" height="48" fill="#ffffff" />
    <text x="250" y="112" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="19" fill="#14532d" text-anchor="middle" letter-spacing="1">
      ★ ${item.brand} ★
    </text>

    <!-- Center Product Title Card -->
    <rect x="95" y="145" width="310" height="150" rx="14" fill="#ffffff" />
    
    <!-- Category Badge -->
    <rect x="180" y="155" width="140" height="22" rx="11" fill="${item.bg1}" />
    <text x="250" y="170" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="10" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">
      ${item.category}
    </text>

    <!-- Product Name in English -->
    <text x="250" y="210" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="18" fill="#0f172a" text-anchor="middle">
      ${item.title.length > 22 ? item.title.substring(0, 22) + '...' : item.title}
    </text>
    
    <!-- Product Name in Telugu -->
    <text x="250" y="240" font-family="'Noto Sans Telugu', sans-serif" font-weight="800" font-size="16" fill="#ea580c" text-anchor="middle">
      ${item.telugu}
    </text>

    <!-- Quality Guarantee Seal -->
    <circle cx="250" cy="272" r="14" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" />
    <text x="250" y="277" font-family="sans-serif" font-weight="900" font-size="13" fill="#b45309" text-anchor="middle">✓</text>

    <!-- Agricultural Field Waves -->
    <path d="M 75 350 Q 160 330 250 350 T 425 350 L 425 435 Q 425 455 405 455 L 95 455 Q 75 455 75 435 Z" fill="#ffffff" opacity="0.12" />

    <!-- Pack Size & Authenticity Ribbon -->
    <rect x="110" y="380" width="280" height="45" rx="12" fill="url(#accentGrad)" />
    <text x="250" y="408" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">
      NET WT: ${item.pack}
    </text>

    <!-- Sai Deveena Traders Authenticity Sub-label -->
    <text x="250" y="445" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="10" fill="#f8fafc" opacity="0.85" text-anchor="middle">
      SAI DEEVENA TRADERS • BHAINSA, TELANGANA
    </text>
  </g>
</svg>`;
}

let count = 0;
for (const item of productAssets) {
  const filePath = path.join(outDir, item.filename);
  fs.writeFileSync(filePath, generatePackagingSVG(item), 'utf8');
  count++;
}

console.log(`Successfully generated ${count} product packaging graphics in ${outDir}`);
