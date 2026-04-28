import { useState, useEffect, useRef } from 'react'
import { z } from 'zod'
import { AppHeader } from '../../components/AppHeader/AppHeader'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import type { NotificationPreference, UserAddress } from '../../services/api'
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
  city: z.string().min(1, 'Cidade é obrigatória'),
})

const notificationSchema = z.object({
  enabled: z.boolean(),
  notificationTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Telefone inválido (ex: +35699999999)').optional().or(z.literal('')),
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

interface AddressSectionProps {
  street: string
  city: string
  errors: Record<string, string>
  onStreetChange: (v: string) => void
  onCityChange: (v: string) => void
}

function AddressSection({ street, city, errors, onStreetChange, onCityChange }: AddressSectionProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.cardTitle}>Endereço</p>
          <p className={styles.cardSubtitle}>Localização do ponto de coleta</p>
        </div>
      </div>
      <div className={styles.cardBody}>
        {errors._ && <p className={styles.error}>{errors._}</p>}

        <div className={styles.field}>
          <label className={styles.label}>Rua</label>
          <input className={styles.textInput} value={street} onChange={e => onStreetChange(e.target.value)} placeholder="Triq Naxxar, 12" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Cidade *</label>
          <input
            className={`${styles.textInput} ${errors.city ? styles.inputError : ''}`}
            value={city}
            onChange={e => onCityChange(e.target.value)}
            placeholder="Naxxar"
          />
          {errors.city && <span className={styles.fieldError}>{errors.city}</span>}
        </div>
      </div>
    </div>
  )
}

// ── SchedulesSection ──────────────────────────────────────────────────────────

interface SchedulesSectionProps {
  selected: Set<TrashType>
  onToggle: (type: TrashType) => void
}

function SchedulesSection({ selected, onToggle }: SchedulesSectionProps) {
  const [showDialog, setShowDialog] = useState(false)

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
          <div className={styles.trashTypeList}>
            {TRASH_TYPES.map(type => {
              const info = TRASH_INFO[type]
              const active = selected.has(type)
              return (
                <div key={type} className={`${styles.trashTypeRow} ${active ? styles.trashTypeRowActive : ''}`}>
                  <div className={styles.trashTypeDot} style={{ background: info.color }} />
                  <div className={styles.trashTypeInfo}>
                    <span className={styles.trashTypeLabel}>{info.label}</span>
                    <span className={styles.trashTypeSchedule}>{info.schedule}</span>
                  </div>
                  <button
                    className={active ? styles.removeBtn : styles.addBtn}
                    onClick={() => onToggle(type)}
                  >
                    {active ? 'Remover' : 'Adicionar'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

// ── NotificationsSection ──────────────────────────────────────────────────────

interface NotificationsSectionProps {
  enabled: boolean
  notificationTime: string
  phoneNumber: string
  error: string
  onEnabledChange: (v: boolean) => void
  onTimeChange: (v: string) => void
  onPhoneChange: (v: string) => void
}

function NotificationsSection({ enabled, notificationTime, phoneNumber, error, onEnabledChange, onTimeChange, onPhoneChange }: NotificationsSectionProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.cardTitle}>Notificações WhatsApp</p>
          <p className={styles.cardSubtitle}>
            Receba uma mensagem no WhatsApp nos dias em que houver coleta configurada
          </p>
        </div>
      </div>
      <div className={styles.cardBody}>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.field}>
          <label className={styles.label}>Telefone WhatsApp</label>
          <input
            className={styles.textInput}
            type="tel"
            value={phoneNumber}
            onChange={e => onPhoneChange(e.target.value)}
            placeholder="+35699999999"
          />
        </div>

        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Ativar notificações</span>
          <label className={styles.toggle}>
            <input type="checkbox" checked={enabled} onChange={e => onEnabledChange(e.target.checked)} />
            <span className={styles.toggleSlider} />
          </label>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Horário do lembrete</label>
          <input
            className={styles.timeInput}
            type="time"
            value={notificationTime}
            onChange={e => onTimeChange(e.target.value)}
            disabled={!enabled}
          />
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function CollectionSettings() {
  const { token } = useAuth()

  // Address
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({})

  // Schedules: desired selection + persisted map (trashType → scheduleId)
  const [selected, setSelected] = useState<Set<TrashType>>(new Set())
  const [savedSchedules, setSavedSchedules] = useState<Record<string, number | null>>({
    organic: null, mixed: null, recyclable: null, glass: null,
  })

  // Notifications
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifTime, setNotifTime] = useState('08:00')
  const [notifPhone, setNotifPhone] = useState('')
  const [notifError, setNotifError] = useState('')

  // Global
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!token) return
    Promise.all([
      api.getAddress(token).catch(() => null),
      api.getSchedules(token).catch(() => [] as Awaited<ReturnType<typeof api.getSchedules>>),
      api.getNotificationPrefs(token).catch(() => null),
    ]).then(([addr, schedules, prefs]) => {
      if (addr) {
        setStreet(addr.street ?? '')
        setCity(addr.city ?? '')
      }
      const map: Record<string, number | null> = { organic: null, mixed: null, recyclable: null, glass: null }
      const sel = new Set<TrashType>()
      schedules.forEach(s => {
        map[s.trashType] = s.id
        sel.add(s.trashType as TrashType)
      })
      setSavedSchedules(map)
      setSelected(sel)
      if (prefs) {
        setNotifEnabled(prefs.enabled)
        setNotifTime(prefs.notificationTime)
        if (prefs.phoneNumber) setNotifPhone(prefs.phoneNumber)
      }
    }).finally(() => setLoading(false))
  }, [token])

  function handleToggle(type: TrashType) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  async function handleSave() {
    setAddressErrors({})
    setNotifError('')
    setSuccess('')

    const addrResult = addressSchema.safeParse({ street, city })
    if (!addrResult.success) {
      const flat = addrResult.error.flatten().fieldErrors
      setAddressErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ''])))
      return
    }

    const notifResult = notificationSchema.safeParse({ enabled: notifEnabled, notificationTime: notifTime, phoneNumber: notifPhone || undefined })
    if (!notifResult.success) {
      const errs = notifResult.error.flatten().fieldErrors
      setNotifError(errs.notificationTime?.[0] ?? errs.phoneNumber?.[0] ?? 'Dados inválidos')
      return
    }

    if (!token) return
    setSaving(true)
    try {
      await api.upsertAddress({
        street: addrResult.data.street || undefined,
        city: addrResult.data.city,
      }, token)

      const toDelete = TRASH_TYPES.filter(t => !selected.has(t) && savedSchedules[t] !== null)
      const toCreate = TRASH_TYPES.filter(t => selected.has(t) && savedSchedules[t] === null)

      await Promise.all(toDelete.map(t => api.deleteSchedule(savedSchedules[t]!, token)))
      const createdResults = await Promise.all(toCreate.map(t => api.createSchedule({ trashType: t }, token)))

      const newMap = { ...savedSchedules }
      toDelete.forEach(t => { newMap[t] = null })
      toCreate.forEach((t, i) => { newMap[t] = createdResults[i].id })
      setSavedSchedules(newMap)

      await api.upsertNotificationPrefs({
        enabled: notifResult.data.enabled,
        notificationTime: notifResult.data.notificationTime,
        ...(notifResult.data.phoneNumber ? { phoneNumber: notifResult.data.phoneNumber } : {}),
      }, token)

      setSuccess('Configurações salvas!')
    } catch (e) {
      setAddressErrors({ _: e instanceof Error ? e.message : 'Falha ao salvar' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.content}>
        <div>
          <h1 className={styles.pageTitle}>Configurações de coleta</h1>
          <p className={styles.pageSubtitle}>Gerencie seu endereço, agenda e alertas</p>
        </div>
        {loading ? (
          <div className="loadingCenter"><div className="spinner" /></div>
        ) : (
          <>
            <AddressSection
              street={street}
              city={city}
              errors={addressErrors}
              onStreetChange={setStreet}
              onCityChange={setCity}
            />
            <SchedulesSection
              selected={selected}
              onToggle={handleToggle}
            />
            <NotificationsSection
              enabled={notifEnabled}
              notificationTime={notifTime}
              phoneNumber={notifPhone}
              error={notifError}
              onEnabledChange={setNotifEnabled}
              onTimeChange={setNotifTime}
              onPhoneChange={setNotifPhone}
            />
            {success && <p className={styles.success}>{success}</p>}
            <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar configurações'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
