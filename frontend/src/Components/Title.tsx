import { Typography } from "@mui/material";
import styles from "../styling.module.css";

export default function Title() {
  return (
    <div className={styles.headerTitle}>
        <Typography variant="h6">Portfolio</Typography>
        <Typography className={styles.titleRight} variant="h6">Mendoza <span className={styles.titleSpan}>Development</span></Typography>
    </div>
  )
}
