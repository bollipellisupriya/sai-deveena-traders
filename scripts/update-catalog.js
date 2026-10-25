import fs from 'fs';
import path from 'path';

const catalogPath = path.resolve('public/catalog.json');
const current = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const newCategories = [
  {
    id: "seeds",
    name: { en: "Seeds", te: "విత్తనాలు" },
    icon: "Sprout",
    image: "/images/categories/quick-seeds.svg",
    photo: "/images/categories/seeds.jpg",
    description: { en: "Certified hybrid and high yield crop & vegetable seeds", te: "ధృవీకరించబడిన హైబ్రిడ్ మరియు నాణ్యమైన విత్తనాలు" }
  },
  {
    id: "fertilizers",
    name: { en: "Fertilizers", te: "ఎరువులు" },
    icon: "Layers",
    image: "/images/categories/quick-fertilizers.svg",
    photo: "/images/categories/fertilizers.jpg",
    description: { en: "DAP, Urea, NPK water-soluble and organic fertilizers", te: "డి.ఎ.పి, యూరియా మరియు ఎన్.పి.కె పోషక ఎరువులు" }
  },
  {
    id: "crop-protection",
    name: { en: "Crop Care", te: "పంట సంరక్షణ" },
    icon: "ShieldCheck",
    image: "/images/categories/quick-cropcare.svg",
    photo: "/images/categories/crop-protection.jpg",
    description: { en: "Pesticides, fungicides, weedicides, and pest control", te: "పురుగుమందులు, శిలీంద్ర సంహారిణులు మరియు తెగుళ్ల నివారణ" }
  },
  {
    id: "groceries",
    name: { en: "Groceries", te: "కిరాణా" },
    icon: "Package",
    image: "/images/categories/quick-groceries.svg",
    photo: "/images/categories/other.jpg",
    description: { en: "Cooking oils, staples, pulses, and daily grocery items", te: "వంట నూనెలు, పప్పులు మరియు నిత్యావసర సరుకులు" }
  },
  {
    id: "household",
    name: { en: "Household", te: "గృహోపకరణాలు" },
    icon: "Wrench",
    image: "/images/categories/quick-household.svg",
    photo: "/images/categories/tools.jpg",
    description: { en: "Tarpaulins, storage cans, ropes, and household utilities", te: "టార్పాలిన్లు, నిల్వ డబ్బాలు మరియు గృహ పరికరాలు" }
  },
  {
    id: "cleaning",
    name: { en: "Cleaning", te: "క్లీనింగ్" },
    icon: "Sparkles",
    image: "/images/categories/quick-cleaning.svg",
    photo: "/images/categories/other.jpg",
    description: { en: "Disinfectants, detergents, floor cleaners, and hygiene", te: "డిటర్జెంట్లు, ఫ్లోర్ క్లీనర్లు మరియు పరిశుభ్రత సామాగ్రి" }
  },
  {
    id: "personal-care",
    name: { en: "Personal Care", te: "వ్యక్తిగత సంరక్షణ" },
    icon: "Heart",
    image: "/images/categories/quick-personal-care.svg",
    photo: "/images/categories/other.jpg",
    description: { en: "Soaps, shampoos, hair oils, and everyday health care", te: "సబ్బులు, షాంపూలు మరియు వ్యక్తిగత సంరక్షణ ఉత్పత్తులు" }
  },
  {
    id: "more",
    name: { en: "More", te: "మరిన్ని" },
    icon: "MoreHorizontal",
    image: "/images/categories/quick-more.svg",
    photo: "/images/categories/irrigation.jpg",
    description: { en: "Irrigation pipes, agricultural sprayers, and tools", te: "డ్రిప్ పైపులు, స్ప్రేయర్లు మరియు వ్యవసాయ ఉపకరణాలు" }
  }
];

const referenceProducts = [
  {
    id: "paddy-seed-hy",
    category: "seeds",
    subCategory: "Paddy",
    name: {
      en: "Paddy Seeds (High Yield)",
      te: "వరి విత్తనాలు (అధిక దిగుబడి)"
    },
    brand: "State Certified",
    packSize: "25 kg bag",
    price: 850,
    originalPrice: 950,
    description: {
      en: "High quality paddy seeds with excellent germination rate and better yield. Suitable for all seasons.",
      te: "అత్యుత్తమ మొలక శాతం మరియు అధిక దిగుబడినిచ్చే ధృవీకృత వరి విత్తనాలు. అన్ని కాలాలకు అనుకూలం."
    },
    image: "/images/products/paddy-seeds-pouch.svg",
    active: true,
    featured: true,
    inStock: true,
    keyFeatures: [
      "High germination rate",
      "Better crop yield",
      "Disease resistant variety",
      "Suitable for multiple seasons"
    ]
  },
  {
    id: "dap-fert-50kg",
    category: "fertilizers",
    subCategory: "Fertilizer",
    name: {
      en: "DAP Fertilizer 50 Kg",
      te: "డి.ఎ.పి ఎరువు 50 కేజీలు"
    },
    brand: "IFFCO / Coromandel",
    packSize: "50 kg bag",
    price: 1350,
    originalPrice: 1450,
    description: {
      en: "High-grade Di-Ammonium Phosphate (18:46:0) fertilizer for robust root development and vegetative vigor.",
      te: "బలమైన వేరు వ్యవస్థ మరియు అధిక పైరు పెరుగుదలకు అవసరమైన 18:46:0 ఎరువు."
    },
    image: "/images/products/dap-fertilizer-pouch.svg",
    active: true,
    featured: true,
    inStock: true,
    keyFeatures: [
      "18% Nitrogen & 46% Phosphorus",
      "Stimulates vigorous root growth",
      "Ideal for basal soil application",
      "100% genuine sealed bags"
    ]
  },
  {
    id: "sunflower-oil-1l",
    category: "groceries",
    subCategory: "Cooking Oil",
    name: {
      en: "Sunflower Oil 1 Ltr",
      te: "సన్‌ఫ్లవర్ నూనె 1 లీటర్"
    },
    brand: "Sunrich / Gold Drop",
    packSize: "1 Litre pouch",
    price: 145,
    originalPrice: 165,
    description: {
      en: "Pure refined sunflower cooking oil enriched with Vitamins A & D for healthy, delicious family cooking.",
      te: "విటమిన్లు A & D కలిగిన స్వచ్ఛమైన రిఫైన్డ్ సన్‌ఫ్లవర్ వంట నూనె."
    },
    image: "/images/products/sunflower-oil-bottle.svg",
    active: true,
    featured: true,
    inStock: true,
    keyFeatures: [
      "Enriched with Vitamins A & D",
      "Light and low cholesterol",
      "High smoke point for frying",
      "100% pure edible oil"
    ]
  },
  {
    id: "maize-seed-hy",
    category: "seeds",
    subCategory: "Paddy",
    name: {
      en: "Maize Seeds",
      te: "మొక్కజొన్న విత్తనాలు"
    },
    brand: "Kaveri Seeds",
    packSize: "4 kg pack",
    price: 780,
    originalPrice: 890,
    description: {
      en: "Uniform large cobs with dense, bright yellow flint kernels and strong drought resistance.",
      te: "ఏకరీతి పెద్ద కంకులు మరియు బెట్టను తట్టుకునే శక్తి కలిగిన హైబ్రిడ్ మొక్కజొన్న విత్తనాలు."
    },
    image: "/images/products/maize-seeds-pouch.svg",
    active: true,
    featured: true,
    inStock: true,
    keyFeatures: [
      "Uniform golden kernels",
      "High drought tolerance",
      "Sturdy non-lodging stalks",
      "Excellent commercial market price"
    ]
  },
  {
    id: "cotton-seed-hy",
    category: "seeds",
    subCategory: "Paddy",
    name: {
      en: "Cotton Seeds",
      te: "పత్తి విత్తనాలు"
    },
    brand: "Rasi Seeds (Bt-II)",
    packSize: "475 g packet",
    price: 920,
    originalPrice: 1050,
    description: {
      en: "Premium hybrid cotton seeds with Bt-II technology, large bolls, and high boll retention.",
      te: "Bt-II సాంకేతికత కలిగిన పెద్ద కాయలు కాసే నాణ్యమైన హైబ్రిడ్ పత్తి విత్తనాలు."
    },
    image: "/images/products/cotton-seeds-pouch.svg",
    active: true,
    featured: true,
    inStock: true,
    keyFeatures: [
      "Bollworm protection Bt-II",
      "Bigger boll weight (5.5 - 6.0 g)",
      "High ginning out-turn",
      "Suitable for Telangana black soil"
    ]
  },
  {
    id: "veg-combo-pack",
    category: "seeds",
    subCategory: "Vegetables",
    name: {
      en: "Vegetable Seeds Combo Pack",
      te: "కూరగాయల విత్తనాల కాంబో ప్యాక్"
    },
    brand: "Local Agro",
    packSize: "5 in 1 Packet",
    price: 299,
    originalPrice: 350,
    description: {
      en: "5 in 1 vegetable seeds combo containing Tomato, Brinjal, Bhendi, Chilli, and Ridge Gourd.",
      te: "టమాటా, వంకాయ, బెండ, మిరప, బీరకాయ విత్తనాల 5-ఇన్-1 కాంబో ప్యాక్."
    },
    image: "/images/products/veg-seeds-combo-pouch.svg",
    active: true,
    featured: false,
    inStock: true,
    keyFeatures: [
      "5 popular high yield vegetables",
      "90%+ germination certified",
      "Ideal for kitchen gardens & farms",
      "Fresh seasonal harvest seeds"
    ]
  },
  {
    id: "groundnut-seed-hy",
    category: "seeds",
    subCategory: "Paddy",
    name: {
      en: "Groundnut Seeds",
      te: "వేరుశనగ విత్తనాలు"
    },
    brand: "Nirmal Seeds",
    packSize: "30 kg bag",
    price: 650,
    originalPrice: 720,
    description: {
      en: "Bold seed kernel groundnut variety with high oil content and tolerance to leaf spot disease.",
      te: "అధిక నూనె శాతం మరియు తెగుళ్లను తట్టుకునే నాణ్యమైన వేరుశనగ విత్తనాలు."
    },
    image: "/images/products/groundnut-seeds-pouch.svg",
    active: true,
    featured: false,
    inStock: true,
    keyFeatures: [
      "Bold two-seeded pods",
      "High shelling percentage (72%)",
      "Tolerant to rust & tikka",
      "Consistent high market demand"
    ]
  },
  {
    id: "sunflower-seed-hy",
    category: "seeds",
    subCategory: "Flowers",
    name: {
      en: "Sunflower Seeds",
      te: "పొద్దుతిరుగుడు విత్తనాలు"
    },
    brand: "Syngenta",
    packSize: "2 kg pack",
    price: 710,
    originalPrice: 800,
    description: {
      en: "High oil content sunflower hybrid with uniform large heads and excellent seed setting.",
      te: "అధిక నూనె శాతం మరియు పెద్ద పువ్వులు కలిగిన హైబ్రిడ్ పొద్దుతిరుగుడు విత్తనాలు."
    },
    image: "/images/products/sunflower-seeds-pouch.svg",
    active: true,
    featured: false,
    inStock: true,
    keyFeatures: [
      "High oil recovery (42%)",
      "Uniform flowering & maturity",
      "Excellent center seed filling",
      "Drought & disease tolerant"
    ]
  },
  {
    id: "tomato-seed-hy",
    category: "seeds",
    subCategory: "Vegetables",
    name: {
      en: "Tomato Seeds",
      te: "టమాటా విత్తనాలు"
    },
    brand: "Seminis / Syngenta",
    packSize: "10 g packet",
    price: 120,
    originalPrice: 150,
    description: {
      en: "Firm, glossy red hybrid tomatoes with thick pericarp suitable for long distance transportation.",
      te: "రవాణాకు అనువైన గట్టి గుజ్జు మరియు మెరిసే ఎరుపు రంగు హైబ్రిడ్ టమాటా విత్తనాలు."
    },
    image: "/images/products/tomato-seeds-pouch.svg",
    active: true,
    featured: false,
    inStock: true,
    keyFeatures: [
      "Firm glossy red fruit (85-95 g)",
      "High yield per plant (15-20 kg)",
      "Long shelf life for transport",
      "Resistant to TLCV virus"
    ]
  },
  {
    id: "chilli-seed-hy",
    category: "seeds",
    subCategory: "Vegetables",
    name: {
      en: "Chilli Seeds",
      te: "మిరప విత్తనాలు"
    },
    brand: "Teja Hybrid",
    packSize: "10 g packet",
    price: 130,
    originalPrice: 160,
    description: {
      en: "Hot, pungent deep red dry chilli hybrid with heavy bearing and virus tolerance.",
      te: "గాఢమైన కారం మరియు తెగుళ్లను తట్టుకునే తేజా హైబ్రిడ్ మిరప విత్తనాలు."
    },
    image: "/images/products/chilli-seeds-pouch.svg",
    active: true,
    featured: false,
    inStock: true,
    keyFeatures: [
      "High pungency & deep red color",
      "Heavy continuous bearing",
      "Tolerant to sucking pests & mites",
      "Premium export quality dry chilli"
    ]
  }
];

// Combine reference products with remaining existing products to keep catalogue rich
const existingIds = new Set(referenceProducts.map(p => p.id));
const otherProducts = current.products.filter(p => !existingIds.has(p.id));

current.categories = newCategories;
current.products = [...referenceProducts, ...otherProducts];

fs.writeFileSync(catalogPath, JSON.stringify(current, null, 2));
console.log('Catalogue updated with reference categories and products!');
