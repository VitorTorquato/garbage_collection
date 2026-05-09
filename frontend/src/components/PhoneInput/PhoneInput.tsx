import { useEffect, useRef, useState } from 'react'
import styles from './PhoneInput.module.css'

interface Country {
  code: string
  name: string
  dial: string
}

const COUNTRIES: Country[] = [
  { code: 'mt', name: 'Malta', dial: '356' },
  { code: 'af', name: 'Afghanistan', dial: '93' },
  { code: 'al', name: 'Albania', dial: '355' },
  { code: 'dz', name: 'Algeria', dial: '213' },
  { code: 'ar', name: 'Argentina', dial: '54' },
  { code: 'au', name: 'Australia', dial: '61' },
  { code: 'at', name: 'Austria', dial: '43' },
  { code: 'be', name: 'Belgium', dial: '32' },
  { code: 'br', name: 'Brazil', dial: '55' },
  { code: 'ca', name: 'Canada', dial: '1' },
  { code: 'cl', name: 'Chile', dial: '56' },
  { code: 'cn', name: 'China', dial: '86' },
  { code: 'co', name: 'Colombia', dial: '57' },
  { code: 'hr', name: 'Croatia', dial: '385' },
  { code: 'cy', name: 'Cyprus', dial: '357' },
  { code: 'cz', name: 'Czech Republic', dial: '420' },
  { code: 'dk', name: 'Denmark', dial: '45' },
  { code: 'eg', name: 'Egypt', dial: '20' },
  { code: 'fi', name: 'Finland', dial: '358' },
  { code: 'fr', name: 'France', dial: '33' },
  { code: 'de', name: 'Germany', dial: '49' },
  { code: 'gh', name: 'Ghana', dial: '233' },
  { code: 'gr', name: 'Greece', dial: '30' },
  { code: 'hk', name: 'Hong Kong', dial: '852' },
  { code: 'hu', name: 'Hungary', dial: '36' },
  { code: 'in', name: 'India', dial: '91' },
  { code: 'id', name: 'Indonesia', dial: '62' },
  { code: 'ie', name: 'Ireland', dial: '353' },
  { code: 'il', name: 'Israel', dial: '972' },
  { code: 'it', name: 'Italy', dial: '39' },
  { code: 'jp', name: 'Japan', dial: '81' },
  { code: 'ke', name: 'Kenya', dial: '254' },
  { code: 'mx', name: 'Mexico', dial: '52' },
  { code: 'ma', name: 'Morocco', dial: '212' },
  { code: 'nl', name: 'Netherlands', dial: '31' },
  { code: 'nz', name: 'New Zealand', dial: '64' },
  { code: 'ng', name: 'Nigeria', dial: '234' },
  { code: 'no', name: 'Norway', dial: '47' },
  { code: 'pk', name: 'Pakistan', dial: '92' },
  { code: 'pe', name: 'Peru', dial: '51' },
  { code: 'ph', name: 'Philippines', dial: '63' },
  { code: 'pl', name: 'Poland', dial: '48' },
  { code: 'pt', name: 'Portugal', dial: '351' },
  { code: 'ro', name: 'Romania', dial: '40' },
  { code: 'ru', name: 'Russia', dial: '7' },
  { code: 'sa', name: 'Saudi Arabia', dial: '966' },
  { code: 'sg', name: 'Singapore', dial: '65' },
  { code: 'za', name: 'South Africa', dial: '27' },
  { code: 'kr', name: 'South Korea', dial: '82' },
  { code: 'es', name: 'Spain', dial: '34' },
  { code: 'se', name: 'Sweden', dial: '46' },
  { code: 'ch', name: 'Switzerland', dial: '41' },
  { code: 'tw', name: 'Taiwan', dial: '886' },
  { code: 'th', name: 'Thailand', dial: '66' },
  { code: 'tr', name: 'Turkey', dial: '90' },
  { code: 'ae', name: 'UAE', dial: '971' },
  { code: 'ua', name: 'Ukraine', dial: '380' },
  { code: 'gb', name: 'United Kingdom', dial: '44' },
  { code: 'us', name: 'United States', dial: '1' },
  { code: 'uy', name: 'Uruguay', dial: '598' },
  { code: 've', name: 'Venezuela', dial: '58' },
  { code: 'vn', name: 'Vietnam', dial: '84' },
]

// Sort by dial length descending for unambiguous prefix matching
const COUNTRIES_BY_DIAL_LENGTH = [...COUNTRIES].sort(
  (a, b) => b.dial.length - a.dial.length,
)

function parseValue(value: string): { country: Country; local: string } {
  const defaultCountry = COUNTRIES[0]
  if (!value) return { country: defaultCountry, local: '' }
  const stripped = value.startsWith('+') ? value.slice(1) : value
  const match = COUNTRIES_BY_DIAL_LENGTH.find((c) => stripped.startsWith(c.dial))
  if (match) return { country: match, local: stripped.slice(match.dial.length) }
  return { country: defaultCountry, local: stripped }
}

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PhoneInput({ value, onChange, className }: PhoneInputProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const { country, local } = parseValue(value)

  const filtered = search.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search.replace('+', '')),
      )
    : COUNTRIES

  function selectCountry(c: Country) {
    setOpen(false)
    setSearch('')
    onChange(local ? `+${c.dial}${local}` : '')
  }

  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    onChange(digits ? `+${country.dial}${digits}` : '')
  }

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={`fi fi-${country.code} ${styles.flag}`} />
        <span className={styles.dialCode}>+{country.dial}</span>
        <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <span className={styles.divider} />

      <input
        className={styles.numberInput}
        type="tel"
        inputMode="numeric"
        value={local}
        onChange={handleLocalChange}
        placeholder="99 999 999"
        autoComplete="tel-national"
      />

      {open && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.searchWrapper}>
            <input
              ref={searchRef}
              className={styles.searchInput}
              type="text"
              placeholder="Search country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className={styles.list}>
            {filtered.map((c) => (
              <li key={`${c.code}-${c.dial}`}>
                <button
                  type="button"
                  className={`${styles.option} ${c.code === country.code && c.dial === country.dial ? styles.optionActive : ''}`}
                  onClick={() => selectCountry(c)}
                  role="option"
                  aria-selected={c.code === country.code}
                >
                  <span className={`fi fi-${c.code} ${styles.flag}`} />
                  <span className={styles.optionName}>{c.name}</span>
                  <span className={styles.optionDial}>+{c.dial}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className={styles.noResults}>No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
