import { useAuthStore } from '@/stores/auth-store'
import { ROLES } from '@/lib/constants/roles'

/** Only Owner/OrgAdmin may change the default preset/profile (and delete them). */
export function useCanManageDefaults(): boolean {
  return useAuthStore((state) => state.hasRole([ROLES.OWNER, ROLES.ORG_ADMIN]))
}
