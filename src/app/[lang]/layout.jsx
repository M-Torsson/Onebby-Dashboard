// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

// Component Imports
import ClientProviders from '@components/ClientProviders'

// Style Imports
import '@/app/globals.css'
import 'react-perfect-scrollbar/dist/css/styles.css'
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'Onebby Dashboard',
  description: 'Onebby Dashboard - Modern eCommerce Admin Dashboard'
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
