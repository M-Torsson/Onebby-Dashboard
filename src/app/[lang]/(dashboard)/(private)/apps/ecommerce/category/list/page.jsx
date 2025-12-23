// Component Imports
import CategoryListTable from '@views/apps/ecommerce/category/list/CategoryListTable'
import { getDictionary } from '@/utils/getDictionary'

const CategoryList = async ({ params }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <CategoryListTable dictionary={dictionary} />
}

export default CategoryList
