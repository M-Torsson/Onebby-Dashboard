// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

// React Imports
import { useContext } from 'react'

// Context Imports
import { VerticalMenuContext } from '../components/vertical-menu/Menu'

const useVerticalMenu = () => {
  // Hooks
  const context = useContext(VerticalMenuContext)

  if (context === undefined) {
    //TODO: set better error message
    throw new Error('Menu Component is required!')
  }

  return context
}

export default useVerticalMenu
