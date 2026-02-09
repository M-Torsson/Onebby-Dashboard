// Component Imports
import WarrantyAdd from '@views/apps/ecommerce/warranty/WarrantyAdd'
import { getDictionary } from '@/utils/getDictionary'

const WarrantyAddPage = async ({ params }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <WarrantyAdd dictionary={dictionary} />
}

export default WarrantyAddPage
