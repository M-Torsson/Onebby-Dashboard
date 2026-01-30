// Component Imports
import Login from '@views/Login'

export const metadata = {
  title: 'Login - Onebby Dashboard',
  description: 'Login to your account'
}

const LoginPage = () => {
  // Use light mode as default for login page
  const mode = 'light'

  return <Login mode={mode} />
}

export default LoginPage
