import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import FormInput from "../../components/FormInput";
import Modal from "../../components/Modal";

import {
  createRole,
  updateRole,
  fetchPermissions,
} from "../../features/roles/rolesSlice";

const emptyForm = {
  name: "",
  description: "",
  permissionIds: [],
};

export default function RoleFormModal({ existingRole, onClose, onSaved }) {
  const dispatch = useDispatch();

  const { permissions } = useSelector((state) => state.roles);

  const isEdit = Boolean(existingRole);

  const isProtectedName =
    isEdit && ["member", "admin"].includes(existingRole.name);

  // Load available permissions
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  // Populate form when editing
  const [form, setForm] = useState(() => {
    if (existingRole) {
      return {
        name: existingRole.name || "",
        description: existingRole.description || "",
        permissionIds:
          existingRole.permissions?.map((permission) => permission.id) || [],
      };
    }

    return { ...emptyForm };
  });

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePermission = (permissionId) => {
    setForm((prev) => {
      const hasPermission = prev.permissionIds.includes(permissionId);

      return {
        ...prev,
        permissionIds: hasPermission
          ? prev.permissionIds.filter((id) => id !== permissionId)
          : [...prev.permissionIds, permissionId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSaving(true);

    try {
      const action = isEdit
        ? await dispatch(
            updateRole({
              id: existingRole.id,
              payload: form,
            }),
          )
        : await dispatch(createRole(form));

      if (action.meta.requestStatus === "rejected") {
        setError(action.payload || "Something went wrong");
        return;
      }

      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit role" : "Add new role"} onClose={onClose}>
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Role name */}
        <FormInput
          label="Role name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={isProtectedName}
        />

        {isProtectedName && (
          <p className="text-xs text-gray-500 -mt-3 mb-4">
            This role's name is used by the system and can't be changed.
          </p>
        )}

        {/* Description */}
        <FormInput
          label="Description (optional)"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        {/* Permissions */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Permissions</label>

          <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
            {permissions.length === 0 ? (
              <p className="text-sm text-gray-500">Loading permissions...</p>
            ) : (
              permissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.permissionIds.includes(permission.id)}
                    onChange={() => togglePermission(permission.id)}
                  />

                  <span>{permission.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-brand-gold text-brand-dark font-semibold py-2 rounded-md disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create role"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
