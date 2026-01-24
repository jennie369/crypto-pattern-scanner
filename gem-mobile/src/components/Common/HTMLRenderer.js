/**
 * HTMLRenderer - Renders HTML content from Shopify using WebView
 * Properly displays tables, lists, and formatted text
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, TYPOGRAPHY } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HTMLRenderer = ({ html, style }) => {
  const [webViewHeight, setWebViewHeight] = useState(200);

  // Handle height change from WebView
  const onMessage = useCallback((event) => {
    const height = parseInt(event.nativeEvent.data, 10);
    if (height && height > 0) {
      setWebViewHeight(height + 20); // Add padding
    }
  }, []);

  if (!html) return null;

  // Wrap HTML with proper styling
  const wrappedHtml = `
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
          color: ${COLORS.textPrimary};
          background-color: transparent;
          padding: 0;
          margin: 0;
        }
        p {
          margin-bottom: 12px;
          color: ${COLORS.textPrimary};
        }
        h1, h2, h3, h4, h5, h6 {
          color: ${COLORS.gold};
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
          color: ${COLORS.textSecondary};
        }
        strong, b {
          color: ${COLORS.textPrimary};
          font-weight: 600;
        }
        em, i {
          font-style: italic;
        }
        a {
          color: ${COLORS.purple};
          text-decoration: none;
        }
        /* Table Styles */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          background: rgba(106, 91, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(106, 91, 255, 0.3);
        }
        thead {
          background: rgba(106, 91, 255, 0.2);
        }
        th {
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          color: ${COLORS.gold};
          border-bottom: 1px solid rgba(106, 91, 255, 0.3);
          font-size: 13px;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid rgba(106, 91, 255, 0.15);
          color: ${COLORS.textPrimary};
          font-size: 14px;
          vertical-align: top;
        }
        tr:last-child td {
          border-bottom: none;
        }
        tr:nth-child(even) {
          background: rgba(106, 91, 255, 0.05);
        }
        /* First column styling */
        td:first-child, th:first-child {
          font-weight: 500;
          color: ${COLORS.textPrimary};
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
          border-top: 1px solid rgba(106, 91, 255, 0.2);
          margin: 16px 0;
        }
        blockquote {
          border-left: 3px solid ${COLORS.gold};
          padding-left: 12px;
          margin: 12px 0;
          color: ${COLORS.textSecondary};
          font-style: italic;
        }
        code {
          background: rgba(106, 91, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }
        pre {
          background: rgba(106, 91, 255, 0.1);
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
        // Send height to React Native
        function sendHeight() {
          const height = document.body.scrollHeight;
          window.ReactNativeWebView.postMessage(String(height));
        }
        // Initial height
        setTimeout(sendHeight, 100);
        // On load
        window.onload = sendHeight;
        // On resize
        window.onresize = sendHeight;
        // Observe DOM changes
        const observer = new MutationObserver(sendHeight);
        observer.observe(document.body, { childList: true, subtree: true });
      </script>
    </body>
    </html>
  `;

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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  webview: {
    width: SCREEN_WIDTH - 64, // Account for section padding
    backgroundColor: 'transparent',
  },
});

export default HTMLRenderer;
