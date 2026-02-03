// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth/next'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Auth Imports
import { authOptions } from '@/libs/auth'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const GuestOnlyRoute = async ({ children, lang }) => {
  try {
    const session = await getServerSession(authOptions)

    if (session) {
      redirect(getLocalizedUrl(themeConfig.homePageUrl, lang))
    }
  } catch (error) {
    // If NextAuth session retrieval fails in a serverless/edge environment,
    // do not hard-fail the whole route; allow the guest page to render.
    console.error('[GuestOnlyRoute] getServerSession failed:', error)
  }

  return <>{children}</>
}

export default GuestOnlyRoute
