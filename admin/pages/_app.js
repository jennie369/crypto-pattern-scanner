/**
 * Next.js App Component
 * Global layout and providers
 */

import '../styles/globals.css';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  // Check if the page has a custom layout
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return getLayout(<Component {...pageProps} />);
}
