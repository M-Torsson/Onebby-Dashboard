// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

export const useDictionary = () => {
  const { lang } = useParams()
  const [dictionary, setDictionary] = useState({ common: {}, navigation: {} })

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const dict = await import(`@/data/dictionaries/${lang}.json`)
        setDictionary(dict.default || dict)
      } catch (error) {
        // Fallback to English if the language file is not found
        try {
          const dict = await import('@/data/dictionaries/en.json')
          setDictionary(dict.default || dict)
        } catch (fallbackError) {
          // Failed to load fallback dictionary
        }
      }
    }

    if (lang) {
      loadDictionary()
    }
  }, [lang])

  return dictionary
}
