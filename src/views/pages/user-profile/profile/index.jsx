'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

const API_BASE_URL = 'https://onebby-api.onrender.com/api'
const API_KEY = 'X9$eP!7wQ@3nZ8^tF#uL2rC6*mH1yB0_dV4+KpS%aGfJ5$qWzR!N7sT#hU9&bE'

const ProfileTab = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({
    id: null,
    username: '',
    email: '',
    full_name: '',
    is_active: false,
    is_superuser: false,
    created_at: ''
  })
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: ''
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          router.push('/login')
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
          setUserData(data)
          setEditData({
            username: data.username,
            email: data.email,
            full_name: data.full_name || '',
            password: ''
          })
          // Store user ID for future use
          localStorage.setItem('userId', data.id.toString())
        } else {
          setError('Failed to load user data')
        }
      } catch (err) {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  // Handle Edit Profile
  const handleEdit = () => {
    setEditMode(true)
    setError('')
    setSuccess('')
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setEditData({
      username: userData.username,
      email: userData.email,
      full_name: userData.full_name || '',
      password: ''
    })
    setError('')
  }

  const handleSaveEdit = async () => {
    try {
      setError('')
      const accessToken = localStorage.getItem('accessToken')

      const body = {
        username: editData.username,
        email: editData.email,
        full_name: editData.full_name
      }

      // Only include password if user entered one
      if (editData.password) {
        body.password = editData.password
      }

      const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'X-API-KEY': API_KEY
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const updatedData = await response.json()
        setUserData(updatedData)
        setEditMode(false)
        setSuccess('Profile updated successfully!')

        // Update localStorage
        localStorage.setItem('username', updatedData.username)
        if (editData.password) {
          localStorage.setItem('password', editData.password)
        }

        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to update profile')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  // Handle Delete Account
  const handleDeleteAccount = () => {
    setDeleteDialogOpen(true)
    setDeletePassword('')
    setError('')
  }

  const handleConfirmDelete = async () => {
    try {
      setError('')
      const storedPassword = localStorage.getItem('password')

      if (deletePassword !== storedPassword) {
        setError('Incorrect password')
        return
      }

      const accessToken = localStorage.getItem('accessToken')

      const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-API-KEY': API_KEY
        }
      })

      if (response.ok) {
        // Clear all localStorage
        localStorage.clear()
        // Redirect to login
        router.push('/login')
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to delete account')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  if (loading) {
    return (
      <Grid container spacing={6} justifyContent='center' alignItems='center' style={{ minHeight: '300px' }}>
        <CircularProgress />
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        {error && (
          <Alert severity='error' onClose={() => setError('')} className='mbe-4'>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' onClose={() => setSuccess('')} className='mbe-4'>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            <div className='flex justify-between items-center mbe-4'>
              <Typography variant='h5'>Informazioni Utente</Typography>
              {!editMode && (
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<i className='tabler-edit' />}
                  onClick={handleEdit}
                >
                  Modifica Profilo
                </Button>
              )}
            </div>

            {editMode ? (
              <div className='flex flex-col gap-4'>
                <TextField
                  fullWidth
                  label='Nome Utente'
                  value={editData.username}
                  onChange={e => setEditData({ ...editData, username: e.target.value })}
                />
                <TextField
                  fullWidth
                  label='Email'
                  type='email'
                  value={editData.email}
                  onChange={e => setEditData({ ...editData, email: e.target.value })}
                />
                <TextField
                  fullWidth
                  label='Nome Completo'
                  value={editData.full_name}
                  onChange={e => setEditData({ ...editData, full_name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label='Nuova Password (lascia vuoto per mantenere quella attuale)'
                  type='password'
                  value={editData.password}
                  onChange={e => setEditData({ ...editData, password: e.target.value })}
                />
                <div className='flex gap-2 justify-end'>
                  <Button variant='outlined' color='secondary' onClick={handleCancelEdit}>
                    Annulla
                  </Button>
                  <Button variant='contained' color='primary' onClick={handleSaveEdit}>
                    Salva Modifiche
                  </Button>
                </div>
              </div>
            ) : (
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2'>
                  <i className='tabler-user text-xl' />
                  <div>
                    <Typography variant='body2' color='text.secondary'>
                      Nome Utente
                    </Typography>
                    <Typography variant='body1'>{userData.username}</Typography>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <i className='tabler-mail text-xl' />
                  <div>
                    <Typography variant='body2' color='text.secondary'>
                      Email
                    </Typography>
                    <Typography variant='body1'>{userData.email || 'Non fornito'}</Typography>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <i className='tabler-id text-xl' />
                  <div>
                    <Typography variant='body2' color='text.secondary'>
                      Nome Completo
                    </Typography>
                    <Typography variant='body1'>{userData.full_name || 'Non fornito'}</Typography>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <i className='tabler-calendar text-xl' />
                  <div>
                    <Typography variant='body2' color='text.secondary'>
                      Membro Dal
                    </Typography>
                    <Typography variant='body1'>
                      {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>

      {!editMode && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' color='error' className='mbe-2'>
                Zona Pericolosa
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mbe-4'>
                Una volta eliminato il tuo account, non si può tornare indietro. Assicurati di essere certo.
              </Typography>
              <Button
                variant='contained'
                color='error'
                startIcon={<i className='tabler-trash' />}
                onClick={handleDeleteAccount}
              >
                Elimina Account
              </Button>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Conferma Eliminazione Account</DialogTitle>
        <DialogContent>
          <Typography variant='body1' className='mbe-4'>
            Sei sicuro di voler eliminare il tuo account? Questa azione non può essere annullata.
          </Typography>
          <Typography variant='body2' color='text.secondary' className='mbe-4'>
            Inserisci la tua password per confermare:
          </Typography>
          <TextField
            fullWidth
            type='password'
            label='Password'
            value={deletePassword}
            onChange={e => setDeletePassword(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='secondary'>
            Annulla
          </Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained'>
            Elimina Account
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ProfileTab
