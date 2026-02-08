// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

const verticalMenuData = dictionary => [
  // Dashboard at top
  {
    label: dictionary['navigation'].dashboard,
    icon: 'tabler-smart-home',
    href: '/apps/ecommerce/dashboard'
  },

  // eCommerce Management
  {
    label: dictionary['navigation'].eCommerce,
    icon: 'tabler-shopping-cart',
    children: [
      {
        label: dictionary['navigation'].brands,
        href: '/apps/ecommerce/brands/list'
      },
      {
        label: dictionary['navigation'].products,
        href: '/apps/ecommerce/products/list'
      },
      {
        label: dictionary['navigation'].category,
        href: '/apps/ecommerce/category/list'
      },
      {
        label: dictionary['navigation'].taxClasses,
        href: '/apps/ecommerce/tax/list'
      },
      {
        label: dictionary['navigation'].discounts || 'Discounts',
        href: '/apps/ecommerce/discounts/list'
      },
      {
        label: dictionary['navigation'].delivery || 'Delivery',
        href: '/apps/ecommerce/delivery/list'
      },
      {
        label: dictionary['navigation'].orders,
        href: '/apps/ecommerce/orders/list'
      },
      {
        label: dictionary['navigation'].customers,
        href: '/apps/ecommerce/customers/list'
      },
      {
        label: dictionary['navigation'].manageReviews,
        href: '/apps/ecommerce/manage-reviews'
      },
      {
        label: dictionary['navigation'].referrals,
        href: '/apps/ecommerce/referrals'
      },
      {
        label: dictionary['navigation'].settings,
        href: '/apps/ecommerce/settings'
      }
    ]
  },

  // Invoice Management
  {
    label: dictionary['navigation'].invoice,
    icon: 'tabler-file-description',
    children: [
      {
        label: dictionary['navigation'].list,
        href: '/apps/invoice/list'
      },
      {
        label: dictionary['navigation'].preview,
        href: '/apps/invoice/preview/4987',
        exactMatch: false,
        activeUrl: '/apps/invoice/preview'
      },
      {
        label: dictionary['navigation'].edit,
        href: '/apps/invoice/edit/4987',
        exactMatch: false,
        activeUrl: '/apps/invoice/edit'
      },
      {
        label: dictionary['navigation'].add,
        href: '/apps/invoice/add'
      }
    ]
  },

  // User Management
  {
    label: dictionary['navigation'].user,
    icon: 'tabler-user',
    children: [
      {
        label: dictionary['navigation'].list,
        href: '/apps/user/list'
      },
      {
        label: dictionary['navigation'].view,
        href: '/apps/user/view'
      }
    ]
  },

  // Roles & Permissions
  {
    label: dictionary['navigation'].rolesPermissions,
    icon: 'tabler-lock',
    children: [
      {
        label: dictionary['navigation'].roles,
        href: '/apps/roles'
      },
      {
        label: dictionary['navigation'].permissions,
        href: '/apps/permissions'
      }
    ]
  },

  // Settings & Pages
  {
    label: dictionary['navigation'].pages,
    icon: 'tabler-settings',
    children: [
      {
        label: dictionary['navigation'].userProfile,
        href: '/pages/user-profile'
      },
      {
        label: dictionary['navigation'].accountSettings,
        href: '/pages/account-settings'
      },
      {
        label: dictionary['navigation'].faq,
        href: '/pages/faq'
      }
    ]
  }
]

export default verticalMenuData
