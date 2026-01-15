// Component Imports
import DiscountAdd from '@views/apps/ecommerce/discounts/DiscountAdd'
import { getDictionary } from '@/utils/getDictionary'

const DiscountAddPage = async ({ params }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <DiscountAdd dictionary={dictionary} />
}

export default DiscountAddPage
