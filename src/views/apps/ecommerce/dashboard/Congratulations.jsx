// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

const CongratulationsJohn = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant='h5' className='mbe-0.5'>
          Congratulations!
        </Typography>
        <Typography variant='subtitle1' className='mbe-2'>
          Best seller of the month
        </Typography>
        <Typography variant='h4' color='primary.main' className='mbe-1'>
          $48.9k
        </Typography>
        <Button variant='contained' color='primary'>
          View Sales
        </Button>
      </CardContent>
    </Card>
  )
}

export default CongratulationsJohn
