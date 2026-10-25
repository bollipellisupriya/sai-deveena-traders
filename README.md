# Sai Deveena Traders — Agricultural Products Store Catalogue

A modern, responsive, production-ready frontend catalogue website for **Sai Deveena Traders**, an agricultural products retail shop located in Bhainsa, Nirmal District, Telangana, India.

Built specifically for local farmers and customers in Bhainsa and surrounding villages with full bilingual support (**English** and **తెలుగు**), client-side search and category filtering, product detail modals, and direct phone & WhatsApp enquiry workflows.

---

## 🌾 Key Features

1. **Frontend-Only Architecture**:
   - Zero databases, backend servers, customer accounts, or payment gateways.
   - Local farmers browse products, view details, and contact the shop owner directly via Phone call or WhatsApp.

2. **Complete Bilingual Support (English & తెలుగు)**:
   - Instant language switching without page reloads or losing current search/category filters.
   - Noto Sans Telugu typography with enhanced line-height and contrast for readability.
   - Fallbacks ensure no `null` or `undefined` text appears on missing translations.

3. **Separate, Editable Static JSON Catalogue (`public/catalog.json`)**:
   - Products and categories are managed purely by editing `public/catalog.json`.
   - Supports: Seeds, Fertilizers, Crop Protection, Irrigation Supplies, Agricultural Tools, and Other Agri Products.
   - Inactive products (`active: false`) are safely hidden from customers.
   - Flexible pricing: numerical INR prices (e.g. ₹864) or "Contact for price" / "ధర కోసం సంప్రదించండి" if `price: null`.
   - Image fallback handler ensures no broken image icons appear if an image file is missing.

4. **Dedicated Shop Contact Configuration (`src/config/shopConfig.ts`)**:
   - Separate from product records.
   - Configurable phone number, WhatsApp number, physical shop address, Google Maps link, and opening hours.
   - Gracefully indicates unconfigured contact info to avoid dead or broken links.

5. **WhatsApp & Phone Integration**:
   - One-tap `tel:` phone dialer link.
   - `wa.me` WhatsApp enquiry buttons generate prefilled bilingual inquiry messages containing the product name, brand, pack size, and displayed price.
   - Floating quick-action bar on mobile for instant calling and WhatsApp messaging.

6. **Farmer Price & Stock Disclaimers**:
   - Transparent disclaimer banners in English and Telugu explaining that displayed prices are indicative and final pricing, stock availability, and pickup/delivery details are confirmed directly by the shop owner.

---

## 📁 Project Structure

```
d:/sai deevena/
├── public/
│   ├── catalog.json          # Main product and category data (editable)
│   ├── favicon.svg           # Agricultural leaf favicon
│   └── images/
│       └── products/         # Place product photos here (.webp / .jpg / .png)
├── src/
│   ├── components/
│   │   ├── AboutSection.tsx      # Authentic story of Sai Deveena Traders in Bhainsa
│   │   ├── CategorySection.tsx   # Dynamic category cards with counts & icons
│   │   ├── ContactSection.tsx    # Phone, WhatsApp, address, timings cards
│   │   ├── DisclaimerBanner.tsx  # Indicative price and order disclaimer banner
│   │   ├── Footer.tsx            # Footer navigation, address, and legal notes
│   │   ├── Header.tsx            # Sticky header with logo, nav, language toggle
│   │   ├── Hero.tsx              # Welcoming agricultural banner & CTAs
│   │   ├── ProductCard.tsx       # Grid card with image fallback, price & actions
│   │   ├── ProductModal.tsx      # Fullscreen bilingual modal with enquiry
│   │   └── SearchBar.tsx         # Search bar, category pills, sort dropdown
│   ├── config/
│   │   └── shopConfig.ts         # Shop contact numbers, address & hours
│   ├── translations/
│   │   └── index.ts              # English and Telugu UI strings
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces for products & categories
│   ├── utils/
│   │   └── whatsapp.ts           # WhatsApp URL and phone dialer link generators
│   ├── App.tsx                   # Main app orchestrator with state & filtering
│   ├── index.css                 # Clean green-and-white theme & responsive styles
│   └── main.tsx                  # React 19 root entry
├── index.html                    # SEO metadata, Telugu Google Fonts, Schema.org
├── package.json
└── vite.config.ts
```

---

## 🛠️ How to Manage the Store

### 1. Updating Shop Contact Details

Open [`src/config/shopConfig.ts`](file:///d:/sai%20deevena/src/config/shopConfig.ts):

```typescript
export const shopConfig: ShopConfig = {
  shopName: {
    en: "Sai Deveena Traders",
    te: "సాయి దీవెన ట్రేడర్స్"
  },
  // Update with actual shop phone number (e.g., "+919876543210")
  phoneNumber: "+919876543210",

  // Update with digits-only international WhatsApp number (e.g., "919876543210")
  whatsappNumber: "919876543210",

  // Shop address
  address: {
    en: "Bhainsa, Nirmal District, Telangana 504103, India",
    te: "భైంసా, నిర్మల్ జిల్లా, తెలంగాణ 504103, భారతదేశం"
  },

  // Paste Google Maps URL when available
  googleMapsUrl: "https://maps.google.com/?q=Bhainsa+Telangana",

  // Opening hours
  openingHours: {
    en: "Monday – Saturday: 7:00 AM – 8:00 PM | Sunday: 7:00 AM – 1:00 PM",
    te: "సోమవారం – శనివారం: ఉదయం 7:00 – రాత్రి 8:00 | ఆదివారం: ఉదయం 7:00 – మధ్యాహ్నం 1:00"
  }
};
```

---

### 2. Adding or Editing Products in `public/catalog.json`

Open [`public/catalog.json`](file:///d:/sai%20deevena/public/catalog.json).

#### Sample Product Entry:

```json
{
  "id": "seed-008",
  "category": "seeds",
  "name": {
    "en": "Hybrid Sunflower Seeds",
    "te": "హైబ్రిడ్ పొద్దుతిరుగుడు విత్తనాలు"
  },
  "brand": "Kaveri",
  "packSize": "2 kg bag",
  "price": 850,
  "description": {
    "en": "High oil content variety with strong stem and drought tolerance.",
    "te": "అధిక నూనె శాతం మరియు బెట్టను తట్టుకునే శక్తి కలిగిన హైబ్రిడ్ పొద్దుతిరుగుడు విత్తనాలు."
  },
  "image": "/images/products/sunflower-seed.webp",
  "active": true,
  "featured": true
}
```

#### Important Rules:
- **`price`**: Set to a number (e.g., `850` displays as `₹850`). If seasonal or fluctuating, set `"price": null` to show **"Contact for price"** in English and **"ధర కోసం సంప్రదించండి"** in Telugu.
- **`active`**: Set to `true` to display in the catalogue, or `false` to hide temporarily (e.g., out-of-season items).
- **`featured`**: Set to `true` to highlight with a golden badge and show first in default sort.

---

### 3. Adding Product Images

1. Save product images (in `.webp`, `.jpg`, or `.png` format) inside `public/images/products/`.
2. Reference the image path in `catalog.json` (e.g. `"/images/products/cotton-seed.webp"`).
3. If an image is not yet available or fails to load, a clean agricultural leaf badge and the product's brand name are automatically rendered as a fallback.

---

## 🚀 Running Locally & Deploying

### Run Locally:
```bash
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Build for Production:
```bash
npm run build
```
The compiled static website will be created in the `dist/` directory.

### Deploy to Static Hosting:
The project is 100% static and can be deployed to:
- **Cloudflare Pages**: Connect GitHub repository, build command `npm run build`, output directory `dist`.
- **Vercel**: Framework preset `Vite`, output directory `dist`.
- **Netlify**: Build command `npm run build`, publish directory `dist`.
- **GitHub Pages**: Deploy the `dist` folder.

---

## 📋 Checklist for Shop Owner Before Public Launch

1. **Configure Real Contact Details**:
   - Add the verified shop mobile number in `src/config/shopConfig.ts`.
   - Add the WhatsApp business number in `src/config/shopConfig.ts`.
   - Add the Google Maps shop pin link in `src/config/shopConfig.ts`.
2. **Review Real Inventory**:
   - Review the sample products in `public/catalog.json` and adjust to match the shop's actual current inventory, pack sizes, and prices.
3. **Product Photos**:
   - Add photos for priority items to `public/images/products/`.
