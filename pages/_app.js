import '@/styles/globals.css';
import '@/styles/themes/minimalistic-light.css';
import '@/styles/themes/minimalistic-dark.css';
import '@/styles/themes/funky.css';
import '@/styles/themes/retro.css';
import { ThemeProvider } from '@/components/Theme/ThemeContext';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
