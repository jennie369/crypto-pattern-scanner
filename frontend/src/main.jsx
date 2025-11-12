import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Design System Foundation
import './styles/design-tokens.css'
import './styles/base.css'
import './styles/typography.css'
import './styles/layout.css'
import './styles/animations.css'
import './styles/themes.css'

import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { PriceProvider } from './contexts/PriceContext'
import { ScanProvider } from './contexts/ScanContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PriceProvider>
        <ScanProvider>
          <App />
        </ScanProvider>
      </PriceProvider>
    </AuthProvider>
  </StrictMode>,
)
