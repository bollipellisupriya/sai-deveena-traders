import React from 'react';
import { Info } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../translations';

interface DisclaimerBannerProps {
  currentLang: Language;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  return (
    <aside
      style={{
        backgroundColor: '#fffbeb',
        borderBottom: '1px solid #fef3c7',
        padding: '0.65rem 1rem',
        fontSize: '0.84rem',
        color: '#92400e'
      }}
      aria-label="Store notice"
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          textAlign: 'center',
          flexWrap: 'wrap'
        }}
      >
        <Info size={16} style={{ color: '#d97706', flexShrink: 0 }} />
        <span>
          <strong>{t.disclaimer.title}:</strong> {t.disclaimer.body}
        </span>
      </div>
    </aside>
  );
};
