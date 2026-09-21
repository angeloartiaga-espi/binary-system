import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  deletePermission,
  fetchPermissions,
} from "../../features/permissions/permissionsSlice";

import ConfirmDialog from "../../components/ConfirmDialog";
import PermissionFormModal from "./PermissionFormModal";

export default function PermissionsList() {
  const dispatch = useDispatch();

  const { list, status, error } = useSelector((state) => state.permissions);

  // undefined = modal closed
  // null = add permission
  // permission object = edit permission
  const [formModalPermission, setFormModalPermission] = useState(undefined);

  const [permissionToDelete, setPermissionToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  const handleConfirmDelete = async () => {
    if (!permissionToDelete) return;

    setDeleting(true);
    setDeleteError(null);

    const action = await dispatch(deletePermission(permissionToDelete.id));

    setDeleting(false);

    if (deletePermission.rejected.match(action)) {
      setDeleteError(action.payload || "Failed to delete permission");
      return;
    }

    setPermissionToDelete(null);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl text-brand-dark">Permission List</h1>

        <button
          onClick={() => setFormModalPermission(null)}
          className="bg-brand-gold text-brand-dark px-4 py-2 rounded-md font-semibold"
        >
          Add new permission
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b text-gray-500 text-sm">
            <tr>
              <th className="p-3">Permission</th>
              <th className="p-3">Assigned roles</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {status === "loading" && (
              <tr>
                <td className="p-3" colSpan={3}>
                  Loading...
                </td>
              </tr>
            )}

            {status !== "loading" && list.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={3}>
                  No permissions yet.
                </td>
              </tr>
            )}

            {list.map((permission) => (
              <tr
                key={permission.id}
                className="border-b last:border-0 align-top"
              >
                <td className="p-3">
                  <p className="font-medium flex items-center gap-2">
                    {permission.name}

                    {permission.isProtected && (
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 border border-gray-300 px-1.5 py-0.5 rounded">
                        system
                      </span>
                    )}
                  </p>

                  {permission.description && (
                    <p className="text-xs text-gray-500">
                      {permission.description}
                    </p>
                  )}
                </td>

                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {permission.roles.length === 0 && (
                      <span className="text-xs text-gray-400">Unassigned</span>
                    )}

                    {permission.roles.map((role) => (
                      <span
                        key={role.id}
                        className="bg-brand-cream text-brand-dark text-xs px-2 py-1 rounded-full"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="p-3 space-x-3">
                  <button
                    onClick={() => setFormModalPermission(permission)}
                    className="text-brand-dark font-medium"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      setPermissionToDelete(permission);
                      setDeleteError(null);
                    }}
                    className="text-red-600 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formModalPermission !== undefined && (
        <PermissionFormModal
          existingPermission={formModalPermission}
          onClose={() => setFormModalPermission(undefined)}
          onSaved={() => {
            setFormModalPermission(undefined);
            dispatch(fetchPermissions());
          }}
        />
      )}

      {permissionToDelete && (
        <ConfirmDialog
          title="Delete permission"
          message={
            deleteError ||
            `Are you sure you want to delete "${permissionToDelete.name}"? This can't be undone.`
          }
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setPermissionToDelete(null);
            setDeleteError(null);
          }}
          loading={deleting}
        />
      )}
    </div>
  );
}
