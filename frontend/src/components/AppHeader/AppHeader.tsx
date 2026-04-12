import { Link } from 'react-router-dom'
import { AvatarPopover } from '../AvatarPopover/AvatarPopover'
import styles from './AppHeader.module.css'

export function AppHeader() {
  return (
    <header className={styles.header}>
      <Link to="/home" className={styles.logo}>BinDay</Link>
      <AvatarPopover />
    </header>
  )
}
