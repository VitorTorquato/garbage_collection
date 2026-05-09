import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../services/api'
import { PhoneInput } from '../../components/PhoneInput/PhoneInput'
import styles from './SignUp.module.css'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export function SignUp() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.signUp(name, email, password, phoneNumber || undefined)
      navigate('/signin')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('signUp.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('signUp.title')}</h1>
        <p className={styles.subtitle}>{t('signUp.subtitle')}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">{t('signUp.name')}</label>
            <input
              id="name"
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('signUp.namePlaceholder')}
              required
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">{t('signUp.email')}</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('signUp.emailPlaceholder')}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">
              {t('signUp.whatsapp')} <span className={styles.optional}>{t('signUp.optional')}</span>
            </label>
            <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">{t('signUp.password')}</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('signUp.passwordPlaceholder')}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? t('signUp.hidePassword') : t('signUp.showPassword')}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? t('signUp.creating') : t('signUp.create')}
          </button>
        </form>

        <p className={styles.footer}>
          {t('signUp.hasAccount')}{' '}
          <Link to="/signin" className={styles.link}>{t('signUp.signIn')}</Link>
        </p>
      </div>
    </div>
  )
}
