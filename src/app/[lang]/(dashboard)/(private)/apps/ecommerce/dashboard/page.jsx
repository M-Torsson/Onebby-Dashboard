import LiveDashboardCRM from '@views/dashboards/crm/LiveDashboardCRM'

const EcommerceDashboard = async ({ params }) => {
  const { lang = 'ar' } = (await params) ?? {}

  return <LiveDashboardCRM lang={lang} />
}

export default EcommerceDashboard
