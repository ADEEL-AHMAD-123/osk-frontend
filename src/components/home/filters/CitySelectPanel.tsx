'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { US_CITIES, type USCity } from '../heroSearch.data';
import { cn } from '@/lib/cn';
import styles from './CitySelectPanel.module.scss';

interface CitySelectPanelProps {
  selected: USCity | null;
  onChange: (city: USCity | null) => void;
  close: () => void;
}

/** Searchable + scrollable city list. Includes an "Any city" reset option. */
export function CitySelectPanel({
  selected,
  onChange,
  close,
}: CitySelectPanelProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return US_CITIES;
    return US_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        `${c.name}, ${c.state}`.toLowerCase().includes(q),
    );
  }, [query]);

  const onPick = (city: USCity | null) => {
    onChange(city);
    close();
  };

  return (
    <div className={styles.root}>
      <div className={styles.searchRow}>
        <span className={styles.searchIcon} aria-hidden="true">
          <svg viewBox="0 0 20 20" width="16" height="16">
            <path
              d="M9 3a6 6 0 014.47 9.99l3.27 3.27-1.06 1.06-3.27-3.27A6 6 0 119 3zm0 1.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
              fill="currentColor"
            />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          className={styles.search}
          placeholder="Search cities or states…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search cities"
        />
      </div>

      <ul className={styles.list} role="listbox" aria-label="Cities">
        <li>
          <button
            type="button"
            className={cn(styles.item, !selected && styles.itemActive)}
            onClick={() => onPick(null)}
            role="option"
            aria-selected={!selected}
          >
            <span className={styles.itemName}>Any city</span>
            <span className={styles.itemMeta}>Show results everywhere</span>
          </button>
        </li>
        {filtered.length === 0 ? (
          <li className={styles.empty}>No cities match “{query.trim()}”.</li>
        ) : (
          filtered.map((city) => {
            const active = selected?.id === city.id;
            return (
              <li key={city.id}>
                <button
                  type="button"
                  className={cn(styles.item, active && styles.itemActive)}
                  onClick={() => onPick(city)}
                  role="option"
                  aria-selected={active}
                >
                  <span className={styles.itemName}>{city.name}</span>
                  <span className={styles.itemMeta}>{city.state}</span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
