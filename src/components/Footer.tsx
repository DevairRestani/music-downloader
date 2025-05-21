// src/components/Footer.tsx
import packageInfo from '../../package.json';
import styles from '../styles/components/Footer.module.css'; // Import the CSS module

const Footer = () => {
  const version = packageInfo.version;

  return (
    <footer className={styles.footer}> {/* Apply the style to the footer element */}
      <p>Created by Restani</p>
      <p>Version: {version}</p>
    </footer>
  );
};

export default Footer;
