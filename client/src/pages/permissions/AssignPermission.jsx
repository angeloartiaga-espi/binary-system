import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchPermissions,
  fetchAssignableRoles,
  assignPermissions,
} from "../../features/permissions/permissionsSlice";

export default function AssignPermission() {
  const dispatch = useDispatch();

  const { list: permissions, assignableRoles } = useSelector(
    (state) => state.permissions,
  );

  const [roleId, setRoleId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchPermissions());
    dispatch(fetchAssignableRoles());
  }, [dispatch]);

  const selectedRole = assignableRoles.find((role) => role.id === roleId);

  const handleRoleChange = (e) => {
    const newRoleId = e.target.value;

    setRoleId(newRoleId);
    setSuccess(null);
    setError(null);

    const role = assignableRoles.find((item) => item.id === newRoleId);

    setSelectedIds(role ? role.permissionIds : []);
  };

  const toggle = (permissionId) => {
    setSelectedIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);
    setSaving(true);

    const action = await dispatch(
      assignPermissions({
        roleId,
        permissionIds: selectedIds,
      }),
    );

    setSaving(false);

    if (action.error) {
      setError(action.payload || "Failed to assign permissions");
      return;
    }

    setSuccess(`Permissions updated for the "${selectedRole.name}" role.`);

    dispatch(fetchAssignableRoles());
    dispatch(fetchPermissions());
  };

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-brand-dark mb-6">
        Assign Permission
      </h1>

      <div className="bg-white rounded-lg shadow-sm p-6 max-w-lg">
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

        {success && <p className="text-green-700 mb-4 text-sm">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Role</label>

            <select
              value={roleId}
              onChange={handleRoleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
            >
              <option value="">
                {assignableRoles.length === 0
                  ? "Loading roles..."
                  : "Select a role"}
              </option>

              {assignableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            {selectedRole?.description && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedRole.description}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Permissions{" "}
              {roleId && (
                <span className="text-gray-500 font-normal">
                  ({selectedIds.length} selected)
                </span>
              )}
            </label>

            <div className="border border-gray-300 rounded-md p-3 max-h-64 overflow-y-auto space-y-2">
              {!roleId && (
                <p className="text-sm text-gray-500">Select a role first.</p>
              )}

              {roleId &&
                permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-start gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(perm.id)}
                      onChange={() => toggle(perm.id)}
                      className="mt-1"
                    />

                    <span>
                      {perm.name}

                      {perm.description && (
                        <span className="block text-xs text-gray-500">
                          {perm.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!roleId || saving}
            className="w-full bg-brand-gold text-brand-dark font-semibold py-2 rounded-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save permissions"}
          </button>
        </form>
      </div>
    </div>
  );
}
