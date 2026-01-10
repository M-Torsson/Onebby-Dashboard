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
const API_BASE_URL = (process.env.NEXT_PUBLIC_ONEBBY_API_BASE_URL || 'https://onebby-api.onrender.com/api').replace(
  /\/api\/?$/,
  ''
)
const API_KEY = process.env.NEXT_PUBLIC_ONEBBY_API_KEY

const AccountDelete = ({ dictionary = { common: {} } }) => {
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
            'X-API-KEY': API_KEY,
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
          'X-API-KEY': API_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert(dictionary.common?.accountDeleted || 'Account deleted successfully')
        localStorage.clear()
        window.location.href = '/login'
      } else {
        alert(dictionary.common?.deleteAccountFailed || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert(dictionary.common?.errorDeletingAccount || 'An error occurred while deleting account')
    } finally {
      setDeleting(false)
      setOpen(false)
    }
  }

  return (
    <Card>
      <CardHeader title={dictionary.common?.deleteAccount || 'Delete Account'} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl error={Boolean(errors.checkbox)} className='is-full mbe-6'>
            <Controller
              name='checkbox'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} />}
                  label={dictionary.common?.confirmAccountDeactivation || 'I confirm my account deactivation'}
                />
              )}
            />
            {errors.checkbox && (
              <FormHelperText error>
                {dictionary.common?.pleaseConfirmDelete || 'Please confirm you want to delete account'}
              </FormHelperText>
            )}
          </FormControl>
          <Button variant='contained' color='error' type='submit' disabled={!checkboxValue}>
            {dictionary.common?.deactivateAccount || 'Deactivate Account'}
          </Button>
        </form>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>{dictionary.common?.confirmAccountDeletion || 'Confirm Account Deletion'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {dictionary.common?.deleteAccountWarning ||
                'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={deleting}>
              {dictionary.common?.cancel || 'Cancel'}
            </Button>
            <Button onClick={handleDeleteAccount} color='error' variant='contained' disabled={deleting}>
              {deleting
                ? dictionary.common?.deleting || 'Deleting...'
                : dictionary.common?.deleteAccount || 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default AccountDelete
