// LoadingSpinner.jsx
import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ size = 'md', color, text }) {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.spinner} ${styles[size]}`} style={color ? { borderTopColor: color } : {}} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}
