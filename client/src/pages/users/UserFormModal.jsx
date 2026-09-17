import { useState } from "react";
import { useDispatch } from "react-redux";
import FormInput from "../../components/FormInput";
import Modal from "../../components/Modal";
import { createUser, updateUser } from "../../features/users/usersSlice";

const MEMBERSHIP_OPTIONS = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  membershipStatus: "BRONZE",
};

// existingUser is null when adding, or a user object when editing.
export default function UserFormModal({ existingUser, onClose, onSaved }) {
  const dispatch = useDispatch();
  const isEdit = Boolean(existingUser);

  const [form, setForm] = useState(() => {
    if (existingUser) {
      return {
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        phone: existingUser.phone || "",
        password: "",
        membershipStatus: existingUser.membershipStatus,
      };
    }

    return { ...emptyForm };
  });

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = { ...form };
    if (!payload.password) delete payload.password; // don't overwrite with a blank password

    const action = isEdit
      ? await dispatch(updateUser({ id: existingUser.id, payload }))
      : await dispatch(createUser(payload));

    setSaving(false);

    if (action.error) {
      setError(action.payload || "Something went wrong");
    } else {
      onSaved();
    }
  };

  return (
    <Modal title={isEdit ? "Edit user" : "Add new user"} onClose={onClose}>
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <FormInput
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Phone number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />

        <FormInput
          label={
            isEdit ? "New password (leave blank to keep current)" : "Password"
          }
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required={!isEdit}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Membership status
          </label>
          <select
            name="membershipStatus"
            value={form.membershipStatus}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {MEMBERSHIP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

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
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create user"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
