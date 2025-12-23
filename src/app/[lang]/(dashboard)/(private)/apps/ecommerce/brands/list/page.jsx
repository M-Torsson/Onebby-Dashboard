// Component Imports
import BrandsList from '@views/apps/ecommerce/brands/list/BrandsList'
import { getDictionary } from '@/utils/getDictionary'

export const metadata = {
  title: 'Brands List - Onebby Dashboard',
  description: 'View and manage all brands'
}

const BrandsListPage = async ({ params }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <BrandsList dictionary={dictionary} />
}

export default BrandsListPage
