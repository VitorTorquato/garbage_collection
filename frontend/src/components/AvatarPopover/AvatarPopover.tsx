import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import styles from './AvatarPopover.module.css'

export function AvatarPopover() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleSettings() {
    setOpen(false)
    navigate('/settings')
  }

  function handleLogout() {
    setOpen(false)
    logout()
    navigate('/signin')
  }

  const initial = user?.name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={styles.badge}
        onClick={() => setOpen((v) => !v)}
        aria-label={t('avatar.openMenu')}
      >
        {initial}
      </button>

      {open && (
        <div className={styles.popover} role="menu">
          <div className={styles.profile}>
            <p className={styles.profileName}>{user?.name}</p>
            <p className={styles.profileEmail}>{user?.email}</p>
          </div>

          <hr className={styles.divider} />

          <div className={styles.menu}>
            <button className={styles.menuItem} onClick={handleSettings}>
              {t('avatar.collectionSettings')}
            </button>
          </div>

          <hr className={styles.divider} />

          <div className={styles.menu}>
            <button
              className={`${styles.menuItem} ${styles.menuItemDanger}`}
              onClick={handleLogout}
            >
              {t('avatar.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
