/**
 * HTMLRenderer - Renders HTML content from Shopify using WebView
 * Properly displays tables, lists, and formatted text
 * Theme-aware component
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSettings } from '../../contexts/SettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HTMLRenderer = ({ html, style }) => {
  const { colors, settings } = useSettings();
  const [webViewHeight, setWebViewHeight] = useState(200);

  // Handle height change from WebView
  const onMessage = useCallback((event) => {
    const height = parseInt(event.nativeEvent.data, 10);
    if (height && height > 0) {
      setWebViewHeight(height + 20); // Add padding
    }
  }, []);

  // Memoize styles
  const styles = useMemo(() => StyleSheet.create({
    container: {
      width: '100%',
      overflow: 'hidden',
    },
    webview: {
      width: SCREEN_WIDTH - 64,
      backgroundColor: 'transparent',
    },
  }), []);

  // Memoize wrapped HTML to avoid recreation on every render
  const wrappedHtml = useMemo(() => {
    if (!html) return '';

    // Theme-aware colors
    const textPrimary = colors.textPrimary;
    const textSecondary = colors.textSecondary;
    const goldColor = colors.gold;
    const purpleColor = colors.purple || colors.burgundy || '#9C0612';
    const borderColor = settings.theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(106, 91, 255, 0.3)';
    const tableBg = settings.theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(106, 91, 255, 0.08)';
    const theadBg = settings.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(106, 91, 255, 0.2)';
    const codeBg = settings.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(106, 91, 255, 0.1)';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: ${textPrimary};
          background-color: transparent;
          padding: 0;
          margin: 0;
        }
        p {
          margin-bottom: 12px;
          color: ${textPrimary};
        }
        h1, h2, h3, h4, h5, h6 {
          color: ${goldColor};
          margin-bottom: 10px;
          margin-top: 16px;
          font-weight: 600;
        }
        h1 { font-size: 22px; }
        h2 { font-size: 20px; }
        h3 { font-size: 18px; }
        h4 { font-size: 16px; }
        ul, ol {
          padding-left: 20px;
          margin-bottom: 12px;
        }
        li {
          margin-bottom: 6px;
          color: ${textSecondary};
        }
        strong, b {
          color: ${textPrimary};
          font-weight: 600;
        }
        em, i {
          font-style: italic;
        }
        a {
          color: ${purpleColor};
          text-decoration: none;
        }
        /* Table Styles */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          background: ${tableBg};
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid ${borderColor};
        }
        thead {
          background: ${theadBg};
        }
        th {
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          color: ${goldColor};
          border-bottom: 1px solid ${borderColor};
          font-size: 13px;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid ${settings.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(106, 91, 255, 0.15)'};
          color: ${textPrimary};
          font-size: 14px;
          vertical-align: top;
        }
        tr:last-child td {
          border-bottom: none;
        }
        tr:nth-child(even) {
          background: ${settings.theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(106, 91, 255, 0.05)'};
        }
        td:first-child, th:first-child {
          font-weight: 500;
          color: ${textPrimary};
          min-width: 80px;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
        }
        hr {
          border: none;
          border-top: 1px solid ${borderColor};
          margin: 16px 0;
        }
        blockquote {
          border-left: 3px solid ${goldColor};
          padding-left: 12px;
          margin: 12px 0;
          color: ${textSecondary};
          font-style: italic;
        }
        code {
          background: ${codeBg};
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }
        pre {
          background: ${codeBg};
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 12px 0;
        }
      </style>
    </head>
    <body>
      ${html}
      <script>
        function sendHeight() {
          const height = document.body.scrollHeight;
          window.ReactNativeWebView.postMessage(String(height));
        }
        setTimeout(sendHeight, 100);
        window.onload = sendHeight;
        window.onresize = sendHeight;
        const observer = new MutationObserver(sendHeight);
        observer.observe(document.body, { childList: true, subtree: true });
      </script>
    </body>
    </html>
  `;
  }, [html, colors, settings.theme]);

  if (!html) return null;

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html: wrappedHtml }}
        style={[styles.webview, { height: webViewHeight }]}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={onMessage}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={false}
        mixedContentMode="compatibility"
        automaticallyAdjustContentInsets={false}
        contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
        overScrollMode="never"
      />
    </View>
  );
};

export default HTMLRenderer;
