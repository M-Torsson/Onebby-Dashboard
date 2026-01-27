// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

// React Imports
import { useContext } from 'react'

// Context Imports
import VerticalNavContext from '../contexts/verticalNavContext'

const useVerticalNav = () => {
  // Hooks
  const context = useContext(VerticalNavContext)

  if (context === undefined) {
    //TODO: set better error message
    throw new Error('VerticalNav Component is required!')
  }

  return context
}

export default useVerticalNav
