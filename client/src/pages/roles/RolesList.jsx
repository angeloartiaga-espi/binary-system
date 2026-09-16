
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchRoles,
  deleteRole,
} from '../../features/roles/rolesSlice';

import ConfirmDialog from '../../components/ConfirmDialog';
import RoleFormModal from './RoleFormModal';

export default function RolesList() {
  const dispatch = useDispatch();

  const { list, status, error } = useSelector(
    (state) => state.roles
  );

  const [formModalRole, setFormModalRole] = useState(undefined);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    setDeleting(true);
    setDeleteError(null);

    const action = await dispatch(
      deleteRole(roleToDelete.id)
    );

    setDeleting(false);

    if (action.meta.requestStatus === 'rejected') {
      setDeleteError(
        action.payload || 'Failed to delete role'
      );
      return;
    }

    setRoleToDelete(null);
  };

  const handleOpenCreate = () => {
    setFormModalRole(null);
  };

  const handleOpenEdit = (role) => {
    setFormModalRole(role);
  };

  const handleSaved = () => {
    setFormModalRole(undefined);
    dispatch(fetchRoles());
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setDeleteError(null);
  };

  const isProtectedRole = (role) =>
    ['client', 'admin'].includes(role.name);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl text-brand-dark">
          Roles &amp; Permissions
        </h1>

        <button
          onClick={handleOpenCreate}
          className="bg-brand-gold text-brand-dark px-4 py-2 rounded-md font-semibold"
        >
          Add new role
        </button>
      </div>

      {/* Error */}
      {status === 'failed' && error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Roles table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b text-gray-500 text-sm">
            <tr>
              <th className="p-3">Role</th>
              <th className="p-3">Permissions</th>
              <th className="p-3">Users</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* Loading */}
            {status === 'loading' && (
              <tr>
                <td
                  className="p-3 text-gray-500"
                  colSpan={4}
                >
                  Loading...
                </td>
              </tr>
            )}

            {/* Empty */}
            {status === 'succeeded' && list.length === 0 && (
              <tr>
                <td
                  className="p-6 text-center text-gray-500"
                  colSpan={4}
                >
                  No roles found.
                </td>
              </tr>
            )}

            {/* Roles */}
            {status !== 'loading' &&
              list.map((role) => {
                const protectedRole =
                  isProtectedRole(role);

                return (
                  <tr
                    key={role.id}
                    className="border-b last:border-0 align-top"
                  >
                    {/* Role */}
                    <td className="p-3">
                      <p className="font-medium">
                        {role.name}
                      </p>

                      {role.description && (
                        <p className="text-xs text-gray-500">
                          {role.description}
                        </p>
                      )}
                    </td>

                    {/* Permissions */}
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions?.length === 0 && (
                          <span className="text-xs text-gray-400">
                            None
                          </span>
                        )}

                        {role.permissions?.map(
                          (permission) => (
                            <span
                              key={permission.id}
                              className="bg-brand-cream text-brand-dark text-xs px-2 py-1 rounded-full"
                            >
                              {permission.name}
                            </span>
                          )
                        )}
                      </div>
                    </td>

                    {/* Users */}
                    <td className="p-3">
                      {role.userCount}
                    </td>

                    {/* Actions */}
                    <td className="p-3 space-x-3">
                      <button
                        onClick={() =>
                          handleOpenEdit(role)
                        }
                        className="text-brand-dark font-medium"
                      >
                        Edit
                      </button>

                      {protectedRole ? (
                        <span className="text-gray-400 text-sm">
                          Delete
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            handleDeleteClick(role)
                          }
                          className="text-red-600 font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Create / Edit modal */}
      {formModalRole !== undefined && (
        <RoleFormModal
          existingRole={formModalRole}
          onClose={() =>
            setFormModalRole(undefined)
          }
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      {roleToDelete && (
        <ConfirmDialog
          title="Delete role"
          message={
            deleteError ||
            `Are you sure you want to delete the "${roleToDelete.name}" role? This can't be undone.`
          }
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setRoleToDelete(null);
            setDeleteError(null);
          }}
          loading={deleting}
        />
      )}
    </div>
  );
}
```

### One thing to check with your backend

This component expects every role returned by `/api/roles` to look approximately like:

```js
{
  id: "...",
  name: "admin",
  description: "...",
  permissions: [
    {
      id: "...",
      name: "manage_users"
    }
  ],
  userCount: 5
