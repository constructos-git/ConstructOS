import { usePermissionsStore } from '@/stores/permissionsStore';

export type EstimatingPermission =
  | 'estimating.read'
  | 'estimating.write'
  | 'estimating.delete'
  | 'estimating.send'
  | 'estimating.approve_internal'
  | 'estimating.convert'
  | 'estimating.configure_rates'
  | 'estimating.configure_templates'
  | 'estimating.configure_pdf';

type Role = 'superadmin' | 'admin' | 'manager' | 'user';

const permissionMap: Record<Role, EstimatingPermission[]> = {
  superadmin: [
    'estimating.read',
    'estimating.write',
    'estimating.delete',
    'estimating.send',
    'estimating.approve_internal',
    'estimating.convert',
    'estimating.configure_rates',
    'estimating.configure_templates',
    'estimating.configure_pdf',
  ],
  admin: [
    'estimating.read',
    'estimating.write',
    'estimating.delete',
    'estimating.send',
    'estimating.approve_internal',
    'estimating.convert',
    'estimating.configure_rates',
    'estimating.configure_templates',
    'estimating.configure_pdf',
  ],
  manager: [
    'estimating.read',
    'estimating.write',
    'estimating.send',
    'estimating.approve_internal',
    'estimating.convert',
  ],
  user: [
    'estimating.read',
    'estimating.write',
  ],
};

function getUserRole(): Role {
  // Try to get from permissions store
  const store = usePermissionsStore.getState();
  const role = (store.currentUser as any)?.role || (store.currentUser as any)?.user_metadata?.role;
  
  if (role && ['superadmin', 'admin', 'manager', 'user'].includes(role)) {
    return role as Role;
  }
  
  // Default to user if no role found
  return 'user';
}

export function hasEstimatingPermission(permission: EstimatingPermission): boolean {
  const role = getUserRole();
  const allowed = permissionMap[role] || [];
  return allowed.includes(permission);
}

export function useEstimatingPermission(permission: EstimatingPermission): boolean {
  return hasEstimatingPermission(permission);
}

