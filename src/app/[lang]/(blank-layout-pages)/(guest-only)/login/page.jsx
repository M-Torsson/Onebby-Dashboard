// Component Imports
import Login from '@views/Login'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Login - Onebby Dashboard',
  description: 'Login to your account'
}

const LoginPage = async () => {
  // Vars with fallback for serverless
  let mode

  try {
    mode = await getServerMode()
  } catch (error) {
    mode = 'light'
  }

  return <Login mode={mode} />
}

export default LoginPage
