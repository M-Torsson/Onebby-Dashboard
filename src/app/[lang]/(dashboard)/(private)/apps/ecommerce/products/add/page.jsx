// Component Imports
import ProductsAdd from '@views/apps/ecommerce/products/add/ProductsAdd'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'

const eCommerceProductsAdd = async props => {
  const params = await props.params

  // Vars
  const lang = i18n.locales.includes(params.lang) ? params.lang : i18n.defaultLocale
  const dictionary = await getDictionary(lang)

  return <ProductsAdd dictionary={dictionary} />
}

export default eCommerceProductsAdd
