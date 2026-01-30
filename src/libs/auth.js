// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  // Add secret for production
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-please-change-in-production',

  // Enable debug mode
  debug: true,

  // Add logger for debugging
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata)
    }
  },

  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    CredentialProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
      name: 'Credentials',
      type: 'credentials',

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      credentials: {},
      async authorize(credentials) {
        /*
         * You need to provide your own logic here that takes the credentials submitted and returns either
         * an object representing a user or value that is false/null if the credentials are invalid.
         */
        const { email, password } = credentials

        console.log('[AUTH] Starting login attempt for:', email)

        try {
          // ** Login API Call to Onebby API
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://onebby-api.onrender.com'

          console.log('[AUTH] API Base URL:', API_BASE_URL)

          const loginData = {
            username: email,
            password
          }

          console.log('[AUTH] Sending request to:', `${API_BASE_URL}/api/users/login`)

          const res = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
          })

          console.log('[AUTH] Response status:', res.status)

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ detail: 'Invalid credentials' }))
            console.error('[AUTH] Login failed:', errorData)
            throw new Error(errorData.detail || 'Invalid username or password')
          }

          const data = await res.json()
          console.log('[AUTH] Login successful, got token')

          if (data.access_token) {
            // Return user object with token
            const user = {
              id: '1',
              name: email,
              email: email,
              accessToken: data.access_token,
              tokenType: data.token_type
            }
            console.log('[AUTH] Returning user object')
            return user
          }

          console.error('[AUTH] No access token in response')
          return null
        } catch (e) {
          console.error('[AUTH] Exception during login:', e.message)
          throw new Error(e.message)
        }
      }
    })

    // ** Google OAuth disabled for now
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET
    // })

    // ** ...add more providers here
  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login'
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user }) {
      console.log('[AUTH] JWT callback - user:', !!user, 'token:', !!token)
      if (user) {
        /*
         * For adding custom parameters to user in session, we first need to add those parameters
         * in token which then will be available in the `session()` callback
         */
        token.name = user.name
        token.email = user.email
        token.accessToken = user.accessToken
        token.tokenType = user.tokenType
        console.log('[AUTH] JWT callback - added user data to token')
      }

      return token
    },
    async session({ session, token }) {
      console.log('[AUTH] Session callback - session:', !!session, 'token:', !!token)
      if (session.user) {
        // ** Add custom params to user in session which are added in `jwt()` callback via `token` parameter
        session.user.name = token.name
        session.user.email = token.email
        session.user.accessToken = token.accessToken
        session.user.tokenType = token.tokenType
        console.log('[AUTH] Session callback - added token data to session')
      }

      return session
    }
  }
}
