// Component Imports
import UserEdit from '@views/apps/ecommerce/users/edit/UserEdit'

const EditUserPage = async ({ params }) => {
  const { id } = await params

  return <UserEdit userId={id} />
}

export default EditUserPage
