// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import AccountSettings from '@views/pages/account-settings'
import { getDictionary } from '@/utils/getDictionary'

const AccountTab = dynamic(() => import('@views/pages/account-settings/account'))
const SecurityTab = dynamic(() => import('@views/pages/account-settings/security'))
const BillingPlansTab = dynamic(() => import('@views/pages/account-settings/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/pages/account-settings/notifications'))
const ConnectionsTab = dynamic(() => import('@views/pages/account-settings/connections'))

// Vars
const tabContentList = dictionary => ({
  account: <AccountTab dictionary={dictionary} />,
  security: <SecurityTab dictionary={dictionary} />,
  'billing-plans': <BillingPlansTab dictionary={dictionary} />,
  notifications: <NotificationsTab dictionary={dictionary} />,
  connections: <ConnectionsTab dictionary={dictionary} />
})

const AccountSettingsPage = async ({ params }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return <AccountSettings tabContentList={tabContentList(dictionary)} dictionary={dictionary} />
}

export default AccountSettingsPage
