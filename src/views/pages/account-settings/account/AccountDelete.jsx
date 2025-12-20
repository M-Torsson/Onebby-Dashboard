'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// API Configuration
const API_BASE_URL = 'https://onebby-api.onrender.com'
const API_KEY = 'X9$eP!7wQ@3nZ8^tF#uL2rC6*mH1yB0_dV4+KpS%aGfJ5$qWzR!N7sT#hU9&bE'

const AccountDelete = () => {
  // States
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Hooks
  const {
    control,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { checkbox: false } })

  // Vars
  const checkboxValue = watch('checkbox')

  // Fetch user ID on mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem('accessToken')

        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          method: 'GET',
          headers: {
            'X-API-Key': API_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()

          setUserId(data.id)
        }
      } catch (error) {
        console.error('Error fetching user ID:', error)
      }
    }

    fetchUserId()
  }, [])

  const onSubmit = () => {
    setOpen(true)
  }

  const handleDeleteAccount = async () => {
    if (!userId) return

    setDeleting(true)

    try {
      const token = localStorage.getItem('accessToken')

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': API_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('تم حذف الحساب بنجاح')
        localStorage.clear()
        window.location.href = '/login'
      } else {
        alert('فشل حذف الحساب')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('حدث خطأ أثناء حذف الحساب')
    } finally {
      setDeleting(false)
      setOpen(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Delete Account' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl error={Boolean(errors.checkbox)} className='is-full mbe-6'>
            <Controller
              name='checkbox'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControlLabel control={<Checkbox {...field} />} label='I confirm my account deactivation' />
              )}
            />
            {errors.checkbox && <FormHelperText error>Please confirm you want to delete account</FormHelperText>}
          </FormControl>
          <Button variant='contained' color='error' type='submit' disabled={!checkboxValue}>
            Deactivate Account
          </Button>
        </form>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Confirm Account Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be
              permanently removed.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={handleDeleteAccount} color='error' variant='contained' disabled={deleting}>
              {deleting ? 'جاري الحذف...' : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default AccountDelete
