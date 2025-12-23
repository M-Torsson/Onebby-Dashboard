'use client'

// Component Imports
import LanguageLoader from './LanguageLoader'

const ClientProviders = ({ children }) => {
  return (
    <>
      <LanguageLoader />
      {children}
    </>
  )
}

export default ClientProviders
