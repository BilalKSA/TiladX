import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
// Resolved at build time by the `@root` alias in vite.config.ts — SiteRoot,
// AppRoot, or the combined App depending on BUILD_TARGET.
import Root from '@root'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>,
)
