// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

// Next Imports
import { cookies } from 'next/headers'

// Config Imports
import themeConfig from '@configs/themeConfig'

export const getSettingsFromCookie = async () => {
  try {
    const cookieStore = await cookies()
    const cookieName = themeConfig.settingsCookieName

    return JSON.parse(cookieStore.get(cookieName)?.value || '{}')
  } catch (error) {
    // Fallback if cookies() fails on serverless
    return {}
  }
}

export const getMode = async () => {
  try {
    const settingsCookie = await getSettingsFromCookie()

    // Get mode from cookie or fallback to theme config
    const _mode = settingsCookie.mode || themeConfig.mode

    return _mode
  } catch (error) {
    return themeConfig.mode || 'light'
  }
}

export const getSystemMode = async () => {
  try {
    const cookieStore = await cookies()
    const mode = await getMode()
    const colorPrefCookie = cookieStore.get('colorPref')?.value || 'light'

    return (mode === 'system' ? colorPrefCookie : mode) || 'light'
  } catch (error) {
    return 'light'
  }
}

export const getServerMode = async () => {
  try {
    const mode = await getMode()
    const systemMode = await getSystemMode()

    return mode === 'system' ? systemMode : mode
  } catch (error) {
    return 'light'
  }
}

export const getSkin = async () => {
  const settingsCookie = await getSettingsFromCookie()

  return settingsCookie.skin || 'default'
}
