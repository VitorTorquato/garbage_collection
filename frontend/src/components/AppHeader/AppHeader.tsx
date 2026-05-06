import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AvatarPopover } from '../AvatarPopover/AvatarPopover'
import styles from './AppHeader.module.css'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ES' },
]

export function AppHeader() {
  const { i18n } = useTranslation()

  function changeLanguage(lang: string) {
    i18n.changeLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  return (
    <header className={styles.header}>
      <Link to="/home" className={styles.logoWrap}>
        <span className={styles.logoText}>Waste Day</span>
      </Link>
      <div className={styles.actions}>
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
        <AvatarPopover />
      </div>
    </header>
  )
}
