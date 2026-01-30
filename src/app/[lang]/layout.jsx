// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Component Imports
import ClientProviders from '@components/ClientProviders'

// HOC Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'

// Config Imports
import { i18n } from '@configs/i18n'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'Onebby Dashboard',
  description: 'Onebby Dashboard - Modern eCommerce Admin Dashboard'
}

// Force dynamic rendering for serverless
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const RootLayout = props => {
  const { children } = props

  // Use default locale and values for serverless compatibility
  const lang = 'en'
  const systemMode = 'light'
  const direction = 'ltr'

  return (
    <TranslationWrapper lang={lang}>
      <html id='__next' lang={lang} dir={direction} suppressHydrationWarning>
        <body className='flex is-full min-bs-full flex-auto flex-col'>
          <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
          <ClientProviders>{children}</ClientProviders>
        </body>
      </html>
    </TranslationWrapper>
  )
}

export default RootLayout
