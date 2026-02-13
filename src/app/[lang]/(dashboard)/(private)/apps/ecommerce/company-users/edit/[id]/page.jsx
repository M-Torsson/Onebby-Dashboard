// Component Imports
import CompanyUserEdit from '@views/apps/ecommerce/company-users/edit/CompanyUserEdit'

const EditCompanyUserPage = async ({ params }) => {
  const { id } = await params

  return <CompanyUserEdit companyId={id} />
}

export default EditCompanyUserPage
