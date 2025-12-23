// Component Imports
import TaxClassTable from '@views/apps/ecommerce/products/tax/TaxClassTable'
import { getDictionary } from '@/utils/getDictionary'

const TaxListPage = async ({ params }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <TaxClassTable dictionary={dictionary} />
}

export default TaxListPage
