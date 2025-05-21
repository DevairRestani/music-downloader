// src/pages/_app.tsx
import '../styles/globals.css';
import Footer from '../components/Footer'; // Import the Footer component

function MyApp({ Component, pageProps }) {
  return (
    <> {/* Use a Fragment or a div to wrap Component and Footer */}
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
