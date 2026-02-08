// Component Imports
import DeliveryAdd from '@views/apps/ecommerce/delivery/DeliveryAdd'
import { getDictionary } from '@/utils/getDictionary'

const DeliveryAddPage = async ({ params }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <DeliveryAdd dictionary={dictionary} />
}

export default DeliveryAddPage
