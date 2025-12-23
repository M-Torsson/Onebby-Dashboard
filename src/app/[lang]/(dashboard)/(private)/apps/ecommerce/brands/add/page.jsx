// Component Imports
import BrandsAdd from '@views/apps/ecommerce/brands/add/BrandsAdd'
import { getDictionary } from '@/utils/getDictionary'

export const metadata = {
  title: 'Add Brand - Onebby Dashboard',
  description: 'Add or edit brand'
}

const BrandsAddPage = async ({ params }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <BrandsAdd dictionary={dictionary} />
}

export default BrandsAddPage
