/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useRouter } from 'next/router';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  const router = useRouter();

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/logo.svg" alt="logo" onClick={() => router.push('/')} />
      </div>
    </div>
  );
}
