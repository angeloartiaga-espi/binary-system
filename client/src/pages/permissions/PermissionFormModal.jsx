import { useState } from "react";
import { useDispatch } from "react-redux";

import FormInput from "../../components/FormInput";
import Modal from "../../components/Modal";
import {
  createPermission,
  updatePermission,
} from "../../features/permissions/permissionsSlice";

export default function PermissionFormModal({
  existingPermission,
  onClose,
  onSaved,
}) {
  const dispatch = useDispatch();

  const isEdit = Boolean(existingPermission);
  const isProtected = isEdit && existingPermission.isProtected;

  const [form, setForm] = useState(() => ({
    name: existingPermission?.name || "",
    description: existingPermission?.description || "",
  }));

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSaving(true);

    const action = isEdit
      ? await dispatch(
          updatePermission({
            id: existingPermission.id,
            payload: form,
          }),
        )
      : await dispatch(createPermission(form));

    setSaving(false);

    if (action.error) {
      setError(action.payload || "Something went wrong");
      return;
    }

    onSaved();
  };

  return (
    <Modal
      title={isEdit ? "Edit permission" : "Add new permission"}
      onClose={onClose}
    >
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Permission name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={isProtected}
          placeholder="e.g. manage_reports"
        />

        {isProtected ? (
          <p className="text-xs text-gray-500 -mt-3 mb-4">
            This permission&apos;s name is used by the system and can&apos;t be
            changed.
          </p>
        ) : (
          <p className="text-xs text-gray-500 -mt-3 mb-4">
            Lowercase letters, numbers and underscores only.
          </p>
        )}

        <FormInput
          label="Description (optional)"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="What this permission allows"
        />

        <p className="text-xs text-gray-500 mb-4">
          Assign this permission to roles from the Assign Permission screen.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-md"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-brand-gold text-brand-dark font-semibold py-2 rounded-md disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : isEdit
                ? "Save changes"
                : "Create permission"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
