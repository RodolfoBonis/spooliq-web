// Role constants matching backend
export const ROLES = {
  PLATFORM_ADMIN: 'PlatformAdmin',
  OWNER: 'Owner',
  ORG_ADMIN: 'OrgAdmin',
  USER: 'User',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// Route permissions
export const ROUTE_PERMISSIONS = {
  // Dashboard
  '/dashboard': [ROLES.PLATFORM_ADMIN, ROLES.OWNER, ROLES.ORG_ADMIN, ROLES.USER],

  // Budgets
  '/budgets': [ROLES.OWNER, ROLES.ORG_ADMIN, ROLES.USER],
  '/budgets/new': [ROLES.OWNER, ROLES.ORG_ADMIN, ROLES.USER],

  // Customers
  '/customers': [ROLES.OWNER, ROLES.ORG_ADMIN, ROLES.USER],

  // Catalog
  '/catalog/filaments': [ROLES.OWNER, ROLES.ORG_ADMIN, ROLES.USER],
  '/catalog/materials': [ROLES.OWNER, ROLES.ORG_ADMIN, ROLES.USER],
  '/catalog/brands': [ROLES.OWNER, ROLES.ORG_ADMIN, ROLES.USER],

  // Presets
  '/presets': [ROLES.OWNER, ROLES.ORG_ADMIN, ROLES.USER],

  // Settings
  '/settings/company': [ROLES.OWNER, ROLES.ORG_ADMIN],
  '/settings/branding': [ROLES.OWNER, ROLES.ORG_ADMIN],
  '/settings/users': [ROLES.OWNER, ROLES.ORG_ADMIN],
  '/settings/subscription': [ROLES.OWNER], // Only Owner

  // Platform Admin
  '/admin': [ROLES.PLATFORM_ADMIN],
} as const

