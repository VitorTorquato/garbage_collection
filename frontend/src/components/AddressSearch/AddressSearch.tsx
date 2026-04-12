import { useState, useEffect, useRef } from 'react'
import styles from './AddressSearch.module.css'

export interface AddressResult {
  display_name: string
  street: string | undefined
  neighborhood: string | undefined
  city: string
  state: string
  country: string
  lat: number
  lng: number
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  address: {
    // street
    road?: string
    pedestrian?: string
    footway?: string
    path?: string
    cycleway?: string
    track?: string
    // neighbourhood
    neighbourhood?: string
    quarter?: string
    suburb?: string
    // city
    city?: string
    town?: string
    village?: string
    hamlet?: string
    municipality?: string
    county?: string
    city_district?: string
    // state
    state?: string
    region?: string
    state_district?: string
    // country
    country?: string
  }
}

function mapResult(r: NominatimResult): AddressResult {
  const a = r.address
  const lat = parseFloat(r.lat)
  const lng = parseFloat(r.lon)
  return {
    display_name: r.display_name,
    street: a.road ?? a.pedestrian ?? a.footway ?? a.path ?? a.cycleway ?? a.track ?? undefined,
    neighborhood: a.neighbourhood ?? a.quarter ?? a.suburb,
    city:
      a.city ?? a.town ?? a.village ?? a.hamlet ??
      a.municipality ?? a.city_district ?? a.county ?? '',
    state: a.state ?? a.region ?? a.state_district ?? '',
    country: a.country ?? '',
    lat: isNaN(lat) ? 0 : lat,
    lng: isNaN(lng) ? 0 : lng,
  }
}

interface Props {
  onSelect: (result: AddressResult) => void
  initialValue?: string
}

export function AddressSearch({ onSelect, initialValue = '' }: Props) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<AddressResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Debounced Nominatim search
  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'en', 'User-Agent': 'GarbageCollectionApp/1.0' },
        })
        const data: NominatimResult[] = await res.json()
        setResults(data.map(mapResult))
        setOpen(data.length > 0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query])

  function handleSelect(result: AddressResult) {
    setQuery(result.display_name)
    setOpen(false)
    setResults([])
    onSelect(result)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <input
        className={styles.input}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search for your address…"
        autoComplete="off"
      />

      {open && (
        <div className={styles.dropdown}>
          {loading ? (
            <p className={styles.loading}>Searching…</p>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                className={styles.option}
                onClick={() => handleSelect(r)}
                type="button"
              >
                {r.display_name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
