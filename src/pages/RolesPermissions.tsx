import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import PermissionMatrix from '@/components/permissions/PermissionMatrix';
import { usePermissionsStore } from '@/stores/permissionsStore';
import type { Role, PermissionResource, PermissionAction } from '@/types/permissions';
import { Plus } from 'lucide-react';

export default function RolesPermissions() {
  const { roles } = usePermissionsStore();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handlePermissionChange = (
    resource: PermissionResource,
    action: PermissionAction,
    enabled: boolean
  ) => {
    if (!selectedRole) return;

    const updatedPermissions = enabled
      ? [
          ...selectedRole.permissions,
          { id: `${resource}-${action}`, resource, action },
        ]
      : selectedRole.permissions.filter(
          (p) => !(p.resource === resource && p.action === action)
        );

    setSelectedRole({
      ...selectedRole,
      permissions: updatedPermissions,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage user roles and their permissions across the system.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Role
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>System and custom roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                    selectedRole?.id === role.id
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div>
                    <div className="font-medium">{role.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {role.permissions.length} permissions
                    </div>
                  </div>
                  {role.isSystem && (
                    <Badge variant="secondary">System</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedRole ? (
            <PermissionMatrix
              role={selectedRole}
              onPermissionChange={handlePermissionChange}
            />
          ) : (
            <Card>
              <CardContent className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">
                  Select a role to configure permissions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
        }}
        title={isEditing ? 'Edit Role' : 'Create New Role'}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => {
              setIsModalOpen(false);
              setIsEditing(false);
            }}>
              {isEditing ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Role Name" placeholder="Enter role name" />
          <Textarea
            label="Description"
            placeholder="Enter role description"
          />
        </div>
      </Modal>
    </div>
  );
}

