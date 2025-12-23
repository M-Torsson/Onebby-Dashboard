'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { useParams, useRouter, usePathname } from 'next/navigation'

// Config Imports
import { i18n } from '@configs/i18n'

const LanguageLoader = () => {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentLang = params.lang

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return

    // Get saved language from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage')

    // If there's a saved language and it's different from current, redirect
    if (savedLanguage && i18n.locales.includes(savedLanguage) && savedLanguage !== currentLang) {
      // Replace current language in pathname with saved language
      const segments = pathname.split('/')
      segments[1] = savedLanguage
      const newPath = segments.join('/')

      router.replace(newPath)
    } else if (!savedLanguage && currentLang) {
      // If no saved language, save the current one
      localStorage.setItem('selectedLanguage', currentLang)
    }
  }, [currentLang, pathname, router])

  return null
}

export default LanguageLoader
