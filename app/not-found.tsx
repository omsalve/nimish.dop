import Link from 'next/link';
import { Icon } from '@/components/Icon';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main id="main" className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={`t-section ${styles.title}`}>This reel is missing from the can.</h1>
      <p className={styles.body}>The page may have moved, or the film is no longer in the program.</p>
      <Link href="/#program" className={styles.back} transitionTypes={['page']}>
        Back to the films
        <Icon name="arrow" />
      </Link>
    </main>
  );
}
