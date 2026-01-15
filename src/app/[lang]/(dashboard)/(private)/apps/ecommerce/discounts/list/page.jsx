// Component Imports
import DiscountList from '@views/apps/ecommerce/discounts/DiscountList'
import { getDictionary } from '@/utils/getDictionary'

const DiscountListPage = async ({ params }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <DiscountList dictionary={dictionary} />
}

export default DiscountListPage
