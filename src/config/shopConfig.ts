/**
 * Sai Deveena Traders - Shop Configuration
 * 
 * Configured with Shop Numbers:
 * - Product Enquiries & Orders: 9010454541 (Phone & WhatsApp)
 * - Support & Customer Care: 9014397044 (Phone & WhatsApp)
 */

export interface ShopConfig {
  shopName: {
    en: string;
    te: string;
  };
  tagline: {
    en: string;
    te: string;
  };
  city: string;
  district: string;
  state: string;
  country: string;
  pincode?: string;
  // Primary Contact (Product Enquiries & Orders)
  phoneNumber: string; // "+919010454541"
  whatsappNumber: string; // "919010454541"
  // Dedicated Support Contact (Customer Care & Assistance)
  supportPhoneNumber: string; // "+919014397044"
  supportWhatsappNumber: string; // "919014397044"
  address: {
    en: string;
    te: string;
  };
  googleMapsUrl: string;
  openingHours: {
    en: string;
    te: string;
  };
  emergencyNotice?: {
    en: string;
    te: string;
  };
}

export const shopConfig: ShopConfig = {
  shopName: {
    en: "Sai Deveena Traders",
    te: "సాయి దీవెన ట్రేడర్స్"
  },
  tagline: {
    en: "Quality Agricultural Products & Inputs for Farmers",
    te: "రైతు సోదరుల కోసం నాణ్యమైన వ్యవసాయ ఉత్పత్తులు & విత్తనాలు"
  },
  city: "Bhainsa",
  district: "Nirmal",
  state: "Telangana",
  country: "India",
  pincode: "504103",
  // Primary Product Contact: 9010454541
  phoneNumber: "+919010454541",
  whatsappNumber: "919010454541",
  // Support Contact: 9014397044
  supportPhoneNumber: "+919014397044",
  supportWhatsappNumber: "919014397044",
  address: {
    en: "Near Agricultural Market Yard, Bhainsa, Nirmal District, Telangana 504103, India",
    te: "వ్యవసాయ మార్కెట్ యార్డ్ సమీపం, భైంసా, నిర్మల్ జిల్లా, తెలంగాణ 504103, భారతదేశం"
  },
  googleMapsUrl: "https://maps.google.com/?q=Bhainsa+Nirmal+Telangana",
  openingHours: {
    en: "Monday – Saturday: 7:00 AM – 8:00 PM | Sunday: 7:00 AM – 1:00 PM",
    te: "సోమవారం – శనివారం: ఉదయం 7:00 – రాత్రి 8:00 | ఆదివారం: ఉదయం 7:00 – మధ్యాహ్నం 1:00"
  }
};

/**
 * Helper to check if contact information has been configured
 */
export const isPhoneConfigured = (phone: string): boolean => {
  return phone.trim().length >= 10 && !phone.includes("X");
};

export const isWhatsappConfigured = (whatsapp: string): boolean => {
  return whatsapp.trim().length >= 10 && !whatsapp.includes("X");
};
