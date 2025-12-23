'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { redirect, usePathname, useRouter } from 'next/navigation'

// Config Imports
import { i18n } from '@configs/i18n'

const LangRedirect = () => {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Check if language is saved in localStorage
    const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('selectedLanguage') : null

    // Use saved language if available and valid, otherwise use default
    const languageToUse = savedLanguage && i18n.locales.includes(savedLanguage) ? savedLanguage : i18n.defaultLocale

    const redirectUrl = `/${languageToUse}${pathname}`

    router.replace(redirectUrl)
  }, [pathname, router])

  return null
}

export default LangRedirect
