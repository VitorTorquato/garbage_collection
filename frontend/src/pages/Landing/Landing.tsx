import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import styles from './Landing.module.css'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ES' },
]

export function Landing() {
  const { isAuthenticated } = useAuth()
  const { t, i18n } = useTranslation()

  function changeLanguage(lang: string) {
    i18n.changeLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow} />

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Waste Day</span>
        </div>

        <div className={styles.navActions}>
          <div className={styles.langSwitcher}>
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                className={`${styles.langBtn} ${i18n.language === code ? styles.langBtnActive : ''}`}
                onClick={() => changeLanguage(code)}
                aria-label={code.toUpperCase()}
              >
                {label}
              </button>
            ))}
          </div>

          {isAuthenticated ? (
            <Link to="/home" className={styles.btnFilled}>{t('landing.dashboard')}</Link>
          ) : (
            <>
              <Link to="/signin" className={styles.btnOutline}>{t('landing.signIn')}</Link>
              <Link to="/signup" className={styles.btnFilled}>{t('landing.signUp')}</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <main className={styles.hero}>
        <div className={styles.orbitWrapper}>
          <div className={`${styles.orbit} ${styles.orbit1}`}><span className={styles.dot} /></div>
          <div className={`${styles.orbit} ${styles.orbit2}`}><span className={styles.dot} /></div>
          <div className={`${styles.orbit} ${styles.orbit3}`}><span className={styles.dot} /></div>
          <div className={`${styles.orbit} ${styles.orbit4}`}><span className={styles.dot} /></div>
        </div>

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{t('landing.eyebrow')}</p>

          <h1 className={styles.headline}>
            {t('landing.headlineLine1')}<br />
            {t('landing.headlineArticle')}<em>{t('landing.headlineItalic')}</em><br />
            {t('landing.headlineLine3')}
          </h1>

          <p className={styles.tagline}>{t('landing.tagline')}</p>

          <div className={styles.ctaRow}>
            {isAuthenticated ? (
              <Link to="/home" className={styles.ctaPrimary}>{t('landing.goToDashboard')}</Link>
            ) : (
              <>
                <Link to="/signup" className={styles.ctaPrimary}>{t('landing.getStarted')}</Link>
                <Link to="/signin" className={styles.ctaSecondary}>{t('landing.signIn')}</Link>
              </>
            )}
          </div>

          <div className={styles.pillRow}>
            <span className={`${styles.pill} ${styles.pillOrganic}`}>{t('trash.organic')}</span>
            <span className={`${styles.pill} ${styles.pillMixed}`}>{t('trash.mixed')}</span>
            <span className={`${styles.pill} ${styles.pillRecyclable}`}>{t('trash.recyclable')}</span>
            <span className={`${styles.pill} ${styles.pillGlass}`}>{t('trash.glass')}</span>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerLine}>{t('landing.footer')}</p>
      </footer>
    </div>
  )
}
