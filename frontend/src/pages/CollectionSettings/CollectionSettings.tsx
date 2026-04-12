import { useState, useEffect, useRef } from 'react'
import { z } from 'zod'
import { AppHeader } from '../../components/AppHeader/AppHeader'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import type { AlertConfig, UserAddress } from '../../services/api'
import scheduleImg from '../../assets/garbage-collection.jpeg'
import styles from './CollectionSettings.module.css'

// ── Constants ────────────────────────────────────────────────────────────────

const TRASH_TYPES = ['organic', 'mixed', 'recyclable', 'glass'] as const
type TrashType = typeof TRASH_TYPES[number]

const TRASH_INFO: Record<TrashType, { label: string; schedule: string; color: string }> = {
  organic:    { label: 'Orgânico',   schedule: 'Toda segunda, quarta e sexta-feira',       color: '#16a34a' },
  mixed:      { label: 'Misturado',  schedule: 'Toda terça-feira e sábado',                color: '#ca8a04' },
  recyclable: { label: 'Reciclável', schedule: 'Toda quinta-feira',                        color: '#2563eb' },
  glass:      { label: 'Vidro',      schedule: 'Primeira e última sexta-feira do mês',     color: '#9333ea' },
}

// ── Zod schemas ───────────────────────────────────────────────────────────────

const addressSchema = z.object({
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().optional(),
  country: z.string().min(1, 'País é obrigatório'),
})

const alertSchema = z.object({
  enabled: z.boolean(),
  daysBeforeCollection: z.coerce.number().int().min(0).max(7),
})

// ── ScheduleDialog ────────────────────────────────────────────────────────────

function ScheduleDialog({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={styles.dialogOverlay}
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <p className={styles.dialogTitle}>Calendário de coleta de Malta</p>
          <button className={styles.dialogClose} onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <div className={styles.dialogBody}>
          <img
            src={scheduleImg}
            alt="Calendário nacional de coleta de resíduos domésticos de Malta"
            className={styles.scheduleImage}
          />
        </div>
      </div>
    </div>
  )
}

// ── AddressSection ────────────────────────────────────────────────────────────

function AddressSection() {
  const { token } = useAuth()
  const [street, setStreet] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!token) return
    api.getAddress(token)
      .then((a: UserAddress) => {
        setStreet(a.street ?? '')
        setNeighborhood(a.neighborhood ?? '')
        setCity(a.city)
        setState(a.state ?? '')
        setCountry(a.country)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  async function handleSave() {
    setErrors({}); setSuccess('')
    const result = addressSchema.safeParse({ street, neighborhood, city, state, country })
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ''])))
      return
    }
    if (!token) return
    setSaving(true)
    try {
      const dto = {
        street: result.data.street || undefined,
        neighborhood: result.data.neighborhood || undefined,
        city: result.data.city,
        state: result.data.state || undefined,
        country: result.data.country,
      }
      await api.upsertAddress(dto, token)
      setSuccess('Endereço salvo!')
    } catch (e) {
      setErrors({ _: e instanceof Error ? e.message : 'Falha ao salvar endereço' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.cardTitle}>Endereço</p>
          <p className={styles.cardSubtitle}>Localização do ponto de coleta</p>
        </div>
      </div>
      <div className={styles.cardBody}>
        {loading ? (
          <div className="loadingCenter"><div className="spinner" /></div>
        ) : (
          <>
            {errors._ && <p className={styles.error}>{errors._}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <div className={styles.field}>
              <label className={styles.label}>Rua</label>
              <input className={styles.textInput} value={street} onChange={e => setStreet(e.target.value)} placeholder="Rua da República, 12" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Bairro</label>
              <input className={styles.textInput} value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Valletta" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Cidade *</label>
              <input className={`${styles.textInput} ${errors.city ? styles.inputError : ''}`} value={city} onChange={e => setCity(e.target.value)} placeholder="Birkirkara" />
              {errors.city && <span className={styles.fieldError}>{errors.city}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Distrito</label>
              <input className={styles.textInput} value={state} onChange={e => setState(e.target.value)} placeholder="Porto Norte" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>País *</label>
              <input className={`${styles.textInput} ${errors.country ? styles.inputError : ''}`} value={country} onChange={e => setCountry(e.target.value)} placeholder="Malta" />
              {errors.country && <span className={styles.fieldError}>{errors.country}</span>}
            </div>

            <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar endereço'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── SchedulesSection ──────────────────────────────────────────────────────────

function SchedulesSection() {
  const { token } = useAuth()
  // Map trashType → scheduleId (null = not subscribed)
  const [subscribed, setSubscribed] = useState<Record<string, number | null>>({
    organic: null, mixed: null, recyclable: null, glass: null,
  })
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    if (!token) return
    api.getSchedules(token)
      .then(list => {
        const map: Record<string, number | null> = {
          organic: null, mixed: null, recyclable: null, glass: null,
        }
        list.forEach(s => { map[s.trashType] = s.id })
        setSubscribed(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  async function handleToggle(type: TrashType) {
    if (!token || toggling) return
    setToggling(type)
    try {
      const currentId = subscribed[type]
      if (currentId !== null) {
        await api.deleteSchedule(currentId, token)
        setSubscribed(prev => ({ ...prev, [type]: null }))
      } else {
        const created = await api.createSchedule({ trashType: type }, token)
        setSubscribed(prev => ({ ...prev, [type]: created.id }))
      }
    } catch {} finally {
      setToggling(null)
    }
  }

  return (
    <>
    {showDialog && <ScheduleDialog onClose={() => setShowDialog(false)} />}
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.cardTitle}>Agendas de coleta</p>
          <p className={styles.cardSubtitle}>Selecione os tipos de lixo coletados no seu endereço</p>
        </div>
        <button className={styles.ghostBtn} onClick={() => setShowDialog(true)}>
          Ver calendário
        </button>
      </div>
      <div className={styles.cardBody}>
        {loading ? (
          <div className="loadingCenter"><div className="spinner" /></div>
        ) : (
          <div className={styles.trashTypeList}>
            {TRASH_TYPES.map(type => {
              const info = TRASH_INFO[type]
              const active = subscribed[type] !== null
              const isToggling = toggling === type
              return (
                <div key={type} className={`${styles.trashTypeRow} ${active ? styles.trashTypeRowActive : ''}`}>
                  <div className={styles.trashTypeDot} style={{ background: info.color }} />
                  <div className={styles.trashTypeInfo}>
                    <span className={styles.trashTypeLabel}>{info.label}</span>
                    <span className={styles.trashTypeSchedule}>{info.schedule}</span>
                  </div>
                  <button
                    className={active ? styles.removeBtn : styles.addBtn}
                    onClick={() => handleToggle(type)}
                    disabled={isToggling}
                  >
                    {isToggling ? '…' : active ? 'Remover' : 'Adicionar'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
    </>
  )
}

// ── AlertSection ──────────────────────────────────────────────────────────────

function AlertSection() {
  const { token } = useAuth()
  const [enabled, setEnabled] = useState(true)
  const [days, setDays] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!token) return
    api.getAlertConfig(token)
      .then((cfg: AlertConfig) => {
        setEnabled(cfg.enabled)
        setDays(cfg.daysBeforeCollection)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  async function handleSave() {
    setError(''); setSuccess('')
    const result = alertSchema.safeParse({ enabled, daysBeforeCollection: days })
    if (!result.success) {
      const msg = result.error.flatten().fieldErrors
      setError(Object.values(msg).flat()[0] ?? 'Dados inválidos')
      return
    }
    if (!token) return
    setSaving(true)
    try {
      await api.upsertAlertConfig({ ...result.data, alertTime: '08:00' }, token)
      setSuccess('Configurações salvas!')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.cardTitle}>Configurações de alerta</p>
          <p className={styles.cardSubtitle}>Seja lembrado antes do dia da coleta</p>
        </div>
      </div>
      <div className={styles.cardBody}>
        {loading ? (
          <div className="loadingCenter"><div className="spinner" /></div>
        ) : (
          <>
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Ativar alertas</span>
              <label className={styles.toggle}>
                <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
                <span className={styles.toggleSlider} />
              </label>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Dias antes da coleta</label>
              <input
                className={styles.numberInput}
                type="number"
                min={0}
                max={7}
                value={days}
                onChange={e => setDays(Number(e.target.value))}
                disabled={!enabled}
              />
            </div>

            <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar configurações'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function CollectionSettings() {
  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.content}>
        <div>
          <h1 className={styles.pageTitle}>Configurações de coleta</h1>
          <p className={styles.pageSubtitle}>Gerencie seu endereço, agenda e alertas</p>
        </div>
        <AddressSection />
        <SchedulesSection />
        <AlertSection />
      </div>
    </div>
  )
}
