'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'

// API Config
import { API_KEY } from '@/configs/apiConfig'

const API_BASE_URL = 'https://onebby-api.onrender.com/api'

const UserProfileHeader = () => {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    full_name: ''
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          // Fallback to localStorage if no token
          const storedUsername = localStorage.getItem('username')
          setUserData({
            username: storedUsername || '',
            email: '',
            full_name: ''
          })
          setLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-API-KEY': API_KEY
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUserData({
            username: data.username,
            email: data.email,
            full_name: data.full_name || data.username
          })
        } else {
          // Fallback to localStorage
          const storedUsername = localStorage.getItem('username')
          setUserData({
            username: storedUsername || '',
            email: '',
            full_name: ''
          })
        }
      } catch (err) {
        // Fallback to localStorage on error
        const storedUsername = localStorage.getItem('username')
        setUserData({
          username: storedUsername || '',
          email: '',
          full_name: ''
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center' style={{ minHeight: '180px' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className='flex gap-5 justify-center flex-col items-center md:flex-row md:justify-start'>
        <Avatar sx={{ width: 120, height: 120, fontSize: '3rem' }} className='rounded'>
          {userData.username.charAt(0).toUpperCase()}
        </Avatar>
        <div className='flex is-full justify-start flex-col items-center gap-2 sm:items-start'>
          <Typography variant='h4'>{userData.full_name || userData.username}</Typography>
          <div className='flex items-center gap-2'>
            <i className='tabler-shield-check' />
            <Typography className='font-medium'>Admin</Typography>
          </div>
          {userData.email && (
            <div className='flex items-center gap-2'>
              <i className='tabler-mail' />
              <Typography className='font-medium' color='text.secondary'>
                {userData.email}
              </Typography>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
