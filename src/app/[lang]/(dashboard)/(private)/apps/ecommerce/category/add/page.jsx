// Component Imports
import CategoryAdd from '@views/apps/ecommerce/category/add/CategoryAdd'
import { getDictionary } from '@/utils/getDictionary'

const AddCategory = async ({ params }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <CategoryAdd dictionary={dictionary} />
}

export default AddCategory
