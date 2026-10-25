import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import type { Category, Language } from '../types';
import { translations } from '../translations';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  currentLang: Language;
  totalFiltered: number;
  totalProducts: number;
  onClearFilters: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  currentLang,
  totalFiltered,
  totalProducts,
  onClearFilters
}) => {
  const t = translations[currentLang];
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedCategory !== 'all' || sortBy !== 'default';

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Search Input and Sort Row */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: '1.25rem'
      }}>
        {/* Search Field with Dynamic Shadow */}
        <div style={{
          position: 'relative',
          flex: '1 1 min(280px, 100%)',
        }}>
          <div style={{
            position: 'absolute',
            left: '1.1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <Search size={20} />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.catalogue.searchPlaceholder}
            style={{
              width: '100%',
              padding: '0.95rem 3rem 0.95rem 3.1rem',
              fontSize: '0.96rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-light)',
              backgroundColor: 'white',
              color: 'var(--text-primary)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              outline: 'none',
              fontFamily: currentLang === 'te' ? 'var(--font-telugu)' : 'inherit',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#16a34a';
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(22, 163, 74, 0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.04)';
            }}
            aria-label={t.catalogue.searchPlaceholder}
          />

          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          flex: '0 0 auto'
        }}>
          <div style={{
            position: 'absolute',
            left: '0.95rem',
            color: '#ea580c',
            pointerEvents: 'none'
          }}>
            <ArrowUpDown size={16} />
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              padding: '0.95rem 2.2rem 0.95rem 2.5rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-light)',
              backgroundColor: 'white',
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
            }}
            aria-label={t.catalogue.sortBy}
          >
            <option value="default">{t.catalogue.sortDefault}</option>
            <option value="price-asc">{t.catalogue.sortPriceAsc}</option>
            <option value="price-desc">{t.catalogue.sortPriceDesc}</option>
            <option value="name-asc">{t.catalogue.sortNameAsc}</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="btn btn-outline"
            style={{
              padding: '0.85rem 1.15rem',
              fontSize: '0.88rem',
              flex: '0 0 auto',
              borderColor: '#ea580c',
              color: '#c2410c'
            }}
          >
            <X size={16} />
            <span>{t.catalogue.clearFilters}</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills with Active Glow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.55rem',
        overflowX: 'auto',
        paddingBottom: '0.65rem',
        scrollbarWidth: 'thin'
      }} role="tablist" aria-label="Product categories">
        <button
          onClick={() => onSelectCategory('all')}
          style={{
            whiteSpace: 'nowrap',
            padding: '0.55rem 1.15rem',
            borderRadius: 'var(--radius-full)',
            border: selectedCategory === 'all' ? '2px solid #15803d' : '1.5px solid var(--border-light)',
            backgroundColor: selectedCategory === 'all' ? '#15803d' : 'white',
            color: selectedCategory === 'all' ? 'white' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: selectedCategory === 'all' ? '0 4px 12px rgba(21, 128, 61, 0.3)' : 'var(--shadow-xs)',
            transition: 'all 0.2s ease'
          }}
          role="tab"
          aria-selected={selectedCategory === 'all'}
        >
          {t.catalogue.allProducts} ({totalProducts})
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const catName = cat.name[currentLang] || cat.name.en;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                whiteSpace: 'nowrap',
                padding: '0.55rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '2px solid #ea580c' : '1.5px solid var(--border-light)',
                backgroundColor: isSelected ? '#ea580c' : 'white',
                color: isSelected ? 'white' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 4px 12px rgba(234, 88, 12, 0.3)' : 'var(--shadow-xs)',
                transition: 'all 0.2s ease'
              }}
              role="tab"
              aria-selected={isSelected}
            >
              {catName}
            </button>
          );
        })}
      </div>

      {/* Result Count Status & Active Feedback */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '0.85rem',
        fontSize: '0.88rem',
        color: 'var(--text-muted)'
      }}>
        <span style={{ fontWeight: 600 }}>
          {t.catalogue.showingFilteredCount
            .replace('{count}', totalFiltered.toString())
            .replace('{total}', totalProducts.toString())}
        </span>
        {searchQuery && (
          <span style={{ fontStyle: 'italic', color: '#ea580c', fontWeight: 600 }}>
            {currentLang === 'te' ? `శోధన: "${searchQuery}"` : `Searching: "${searchQuery}"`}
          </span>
        )}
      </div>
    </div>
  );
};
