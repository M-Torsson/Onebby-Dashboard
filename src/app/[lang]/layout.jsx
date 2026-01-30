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

const RootLayout = async props => {
  try {
    // Handle params properly for Next.js 15+
    const params = await props.params
    const { children } = props

    // Get lang from params or use default
    const lang = params?.lang && i18n.locales.includes(params.lang) ? params.lang : i18n.defaultLocale
    const systemMode = 'light'
    const direction = i18n.langDirection?.[lang] || 'ltr'

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
  } catch (error) {
    console.error('RootLayout Error:', error)

    // Fallback layout on error
    return (
      <html id='__next' lang='en' dir='ltr' suppressHydrationWarning>
        <body className='flex is-full min-bs-full flex-auto flex-col'>
          <InitColorSchemeScript attribute='data' defaultMode='light' />
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Loading...</h1>
          </div>
        </body>
      </html>
    )
  }
}

export default RootLayout
