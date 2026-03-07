// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// Config Imports
import { i18n } from '@/configs/i18n'

const dictionaryLoaders = {
  en: () => import('@/data/dictionaries/en.json').then(module => module.default || module),
  fr: () => import('@/data/dictionaries/fr.json').then(module => module.default || module),
  it: () => import('@/data/dictionaries/it.json').then(module => module.default || module)
}

export const useDictionary = () => {
  const { lang } = useParams()
  const [dictionary, setDictionary] = useState({ common: {}, navigation: {} })

  useEffect(() => {
    let isMounted = true

    const loadDictionary = async () => {
      const normalizedLang = i18n.locales.includes(lang) ? lang : i18n.defaultLocale

      try {
        const dict = await dictionaryLoaders[normalizedLang]()

        if (isMounted) {
          setDictionary(dict)
        }
      } catch (error) {
        try {
          const fallbackDictionary = await dictionaryLoaders[i18n.defaultLocale]()

          if (isMounted) {
            setDictionary(fallbackDictionary)
          }
        } catch (fallbackError) {
          if (isMounted) {
            setDictionary({ common: {}, navigation: {} })
          }
        }
      }
    }

    if (lang) {
      loadDictionary()
    }

    return () => {
      isMounted = false
    }
  }, [lang])

  return dictionary
}
