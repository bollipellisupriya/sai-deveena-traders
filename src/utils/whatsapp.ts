import type { Product, Language } from '../types';
import { shopConfig, isWhatsappConfigured, isPhoneConfigured } from '../config/shopConfig';

/**
 * Clean phone number to digits only (e.g. "919010454541")
 */
export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Format numerical price to Indian Rupee standard format (e.g. ₹1,450)
 */
export const formatPrice = (price: number | null, lang: Language): string => {
  if (price === null || price === undefined) {
    return lang === 'te' ? 'ధర కోసం సంప్రదించండి' : 'Contact for price';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Build WhatsApp click-to-chat URL with prefilled bilingual message for a specific product
 * Target: Primary product enquiry number (9010454541)
 */
export const getProductWhatsappUrl = (product: Product, lang: Language): { url: string; isConfigured: boolean } => {
  const isConfigured = isWhatsappConfigured(shopConfig.whatsappNumber);
  const cleanNumber = sanitizePhoneNumber(shopConfig.whatsappNumber);

  const productName = product.name[lang] || product.name.en;
  const brandPart = product.brand ? ` (${product.brand})` : '';
  const packPart = product.packSize ? ` [${product.packSize}]` : '';
  const priceDisplay = formatPrice(product.price, lang);

  let message = '';
  if (lang === 'te') {
    message = `నమస్కారం సాయి దీవెన ట్రేడర్స్ & జనరల్ స్టోర్ (భైంసా).\nనేను మీ వెబ్‌సైట్‌లో ఈ ఉత్పత్తిని చూశాను:\n\n• ఉత్పత్తి: ${productName}${brandPart}\n• ప్యాక్ సైజు: ${packPart || 'అందుబాటులో ఉన్నది'}\n• చూపిన ధర: ${priceDisplay}\n\nదయచేసి ప్రస్తుత ధర మరియు స్టాక్ లభ్యత వివరాలను తెలియజేయగలరు.`;
  } else {
    message = `Hello Sai Deveena Traders & General Store (Bhainsa),\nI saw this product on your catalogue website:\n\n• Product: ${productName}${brandPart}\n• Pack Size: ${packPart || 'Standard'}\n• Displayed Price: ${priceDisplay}\n\nPlease confirm if this item is currently in stock and its latest price. Thank you!`;
  }

  const encodedMessage = encodeURIComponent(message);
  
  if (!isConfigured) {
    return {
      url: `https://wa.me/?text=${encodedMessage}`,
      isConfigured: false
    };
  }

  return {
    url: `https://wa.me/${cleanNumber}?text=${encodedMessage}`,
    isConfigured: true
  };
};

/**
 * Build general WhatsApp click-to-chat URL for inquiries without a specific product
 * Target: 9010454541
 */
export const getGeneralWhatsappUrl = (lang: Language): { url: string; isConfigured: boolean } => {
  const isConfigured = isWhatsappConfigured(shopConfig.whatsappNumber);
  const cleanNumber = sanitizePhoneNumber(shopConfig.whatsappNumber);

  const message = lang === 'te'
    ? 'నమస్కారం సాయి దీవెన ట్రేడర్స్ & జనరల్ స్టోర్ (భైంసా). నాకు వ్యవసాయ ఉత్పత్తులు, విత్తనాలు మరియు ఎరువుల గురించి సమాచారం కావాలి.'
    : 'Hello Sai Deveena Traders & General Store (Bhainsa). I would like to enquire about your available agricultural products, seeds, and fertilizers.';

  const encodedMessage = encodeURIComponent(message);

  if (!isConfigured) {
    return {
      url: `https://wa.me/?text=${encodedMessage}`,
      isConfigured: false
    };
  }

  return {
    url: `https://wa.me/${cleanNumber}?text=${encodedMessage}`,
    isConfigured: true
  };
};

/**
 * Build tel: link for primary shop phone dialer (9010454541)
 */
export const getPhoneDialUrl = (): { url: string; isConfigured: boolean } => {
  const isConfigured = isPhoneConfigured(shopConfig.phoneNumber);
  if (!isConfigured) {
    return { url: '#contact', isConfigured: false };
  }
  return { url: `tel:${shopConfig.phoneNumber}`, isConfigured: true };
};

/**
 * Build tel: link for customer support helpline (9014397044)
 */
export const getSupportPhoneDialUrl = (): { url: string; isConfigured: boolean } => {
  const isConfigured = isPhoneConfigured(shopConfig.supportPhoneNumber);
  if (!isConfigured) {
    return { url: '#contact', isConfigured: false };
  }
  return { url: `tel:${shopConfig.supportPhoneNumber}`, isConfigured: true };
};

/**
 * Build WhatsApp click-to-chat URL for customer support (9014397044)
 */
export const getSupportWhatsappUrl = (lang: Language): { url: string; isConfigured: boolean } => {
  const isConfigured = isWhatsappConfigured(shopConfig.supportWhatsappNumber);
  const cleanNumber = sanitizePhoneNumber(shopConfig.supportWhatsappNumber);

  const message = lang === 'te'
    ? 'నమస్కారం సాయి దీవెన ట్రేడర్స్ & జనరల్ స్టోర్ కస్టమర్ సపోర్ట్. నాకు సహాయం కావాలి.'
    : 'Hello Sai Deveena Traders & General Store Support. I need assistance with agricultural products and order guidance.';

  const encodedMessage = encodeURIComponent(message);

  if (!isConfigured) {
    return {
      url: `https://wa.me/?text=${encodedMessage}`,
      isConfigured: false
    };
  }

  return {
    url: `https://wa.me/${cleanNumber}?text=${encodedMessage}`,
    isConfigured: true
  };
};
