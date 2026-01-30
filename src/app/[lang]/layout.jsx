// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Component Imports
import ClientProviders from '@components/ClientProviders'

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

const RootLayout = ({ children }) => {
  return (
    <html id='__next' lang='en' dir='ltr' suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <InitColorSchemeScript attribute='data' defaultMode='light' />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}

export default RootLayout
