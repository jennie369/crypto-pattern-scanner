import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Vietnamese Font Fix - Load first for proper rendering
import './styles/vietnamese-fonts.css'

// Design System Foundation - MUST LOAD FIRST for CSS variables
import './styles/design-tokens.css'
import './index.css'
import './styles/base.css'
import './styles/typography.css'
import './styles/layout.css'
import './styles/animations.css'
import './styles/components.css'
import './styles/themes.css'

import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { PriceProvider } from './contexts/PriceContext'
import { ScanProvider } from './contexts/ScanContext'

createRoot(document.getElementById('root')).render(
  // TEMPORARILY DISABLED StrictMode for debugging
  // <StrictMode>
    <AuthProvider>
      <PriceProvider>
        <ScanProvider>
          <App />
        </ScanProvider>
      </PriceProvider>
    </AuthProvider>
  // </StrictMode>,
)
