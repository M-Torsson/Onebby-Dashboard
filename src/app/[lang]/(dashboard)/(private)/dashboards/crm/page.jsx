import LiveDashboardCRM from '@views/dashboards/crm/LiveDashboardCRM'

const DashboardCRM = async ({ params }) => {
  const { lang } = await params

  return <LiveDashboardCRM lang={lang} />
}

export default DashboardCRM
