import { Link } from 'react-router-dom'
import { AvatarPopover } from '../AvatarPopover/AvatarPopover'
import styles from './AppHeader.module.css'


export function AppHeader() {
  return (
    <header className={styles.header}>
      <Link to="/home" className={styles.logoWrap}>
        <span className={styles.logoText}>Waste Day</span>
      </Link>

      <AvatarPopover />
    </header>
  )
}
