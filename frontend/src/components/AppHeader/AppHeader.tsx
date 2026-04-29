import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AvatarPopover } from '../AvatarPopover/AvatarPopover'
import styles from './AppHeader.module.css'

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'pt', flag: '🇵🇹' },
  { code: 'es', flag: '🇪🇸' },
]

export function AppHeader() {
  const { i18n } = useTranslation()

  function changeLanguage(lang: string) {
    i18n.changeLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  return (
    <header className={styles.header}>
      <Link to="/home" className={styles.logo}>Waste Day</Link>
      <div className={styles.controls}>
        <div className={styles.langSwitcher}>
          {LANGUAGES.map(({ code, flag }) => (
            <button
              key={code}
              className={`${styles.langBtn} ${i18n.language === code ? styles.langBtnActive : ''}`}
              onClick={() => changeLanguage(code)}
              aria-label={code.toUpperCase()}
            >
              {flag}
            </button>
          ))}
        </div>
        <AvatarPopover />
      </div>
    </header>
  )
}
