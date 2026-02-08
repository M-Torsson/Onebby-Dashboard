// Component Imports
import DeliveryList from '@views/apps/ecommerce/delivery/DeliveryList'
import { getDictionary } from '@/utils/getDictionary'

const DeliveryListPage = async ({ params }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <DeliveryList dictionary={dictionary} />
}

export default DeliveryListPage
