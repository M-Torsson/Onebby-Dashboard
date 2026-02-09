// Component Imports
import WarrantyList from '@views/apps/ecommerce/warranty/WarrantyList'
import { getDictionary } from '@/utils/getDictionary'

const WarrantyListPage = async ({ params }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <WarrantyList dictionary={dictionary} />
}

export default WarrantyListPage
