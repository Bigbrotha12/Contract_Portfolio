import { Divider, Link } from "../Material/Material";
import styles from "../styling.module.css";

export default function Navbar() {
  return (
    <div className={styles.navbar}>
        <Link className={styles.navItem} variant="h6" color="primary" underline="hover">Home</Link>
        <Divider orientation="vertical" flexItem />
        <Link className={styles.navItem} variant="h6" color="primary" underline="hover">About</Link>
        <Divider orientation="vertical" flexItem />
        <Link className={styles.navItem} variant="h6" color="primary" underline="hover">Github</Link>
    </div>
  )
}
