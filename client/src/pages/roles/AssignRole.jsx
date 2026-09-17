import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRoles,
  fetchAssignableUsers,
  assignRole,
} from "../../features/roles/rolesSlice";

export default function AssignRole() {
  const dispatch = useDispatch();

  const {
    list: roles,
    assignableUsers,
    status: rolesStatus,
  } = useSelector((state) => state.roles);

  const [userId, setUserId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load users and roles when the page opens.
  useEffect(() => {
    dispatch(fetchAssignableUsers());
    dispatch(fetchRoles());
  }, [dispatch]);

  const selectedUser = assignableUsers.find((user) => user.id === userId);

  const currentRoleName = selectedUser?.currentRole || "";

  // Handle user selection.
  // The user's current role is selected automatically.
  const handleUserChange = (e) => {
    const selectedId = e.target.value;

    setUserId(selectedId);
    setSuccess(null);
    setError(null);

    const user = assignableUsers.find((item) => item.id === selectedId);

    setRoleName(user?.currentRole || "");
  };

  // Assign the selected role.
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!userId) {
      setError("Please select a user.");
      return;
    }

    if (!roleName) {
      setError("Please select a role.");
      return;
    }

    if (roleName === currentRoleName) {
      setError("The user already has this role.");
      return;
    }

    setSaving(true);

    try {
      const action = await dispatch(
        assignRole({
          userId,
          role: roleName,
        }),
      );

      if (assignRole.rejected.match(action)) {
        throw new Error(action.payload || "Failed to assign role");
      }

      setSuccess(
        `${selectedUser.firstName} ${selectedUser.lastName} is now assigned the "${roleName}" role.`,
      );

      // Refresh the assignable users so the current role is updated.
      await dispatch(fetchAssignableUsers());
    } catch (err) {
      setError(err.message || "Failed to assign role");
    } finally {
      setSaving(false);
    }
  };

  const loading = rolesStatus === "loading" || assignableUsers.length === 0;

  const unchanged = roleName === currentRoleName;

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-brand-dark mb-6">Assign Role</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 max-w-lg">
        {/* Error */}
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

        {/* Success */}
        {success && <p className="text-green-700 mb-4 text-sm">{success}</p>}

        <form onSubmit={handleSubmit}>
          {/* User */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">User</label>

            <select
              value={userId}
              onChange={handleUserChange}
              required
              disabled={loading || saving}
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white disabled:bg-gray-100"
            >
              <option value="">
                {loading ? "Loading users..." : "Select a user"}
              </option>

              {assignableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>

            {/* Current user information */}
            {selectedUser && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedUser.email} — current role: {currentRoleName || "none"}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Role</label>

            <select
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value);
                setSuccess(null);
                setError(null);
              }}
              required
              disabled={!userId || saving || rolesStatus === "loading"}
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white disabled:bg-gray-100"
            >
              <option value="">
                {userId
                  ? rolesStatus === "loading"
                    ? "Loading roles..."
                    : "Select a role"
                  : "Select a user first"}
              </option>

              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!userId || !roleName || unchanged || saving}
            className="w-full bg-brand-gold text-brand-dark font-semibold py-2 rounded-md disabled:opacity-50"
          >
            {saving
              ? "Assigning..."
              : unchanged && userId
                ? "Already has this role"
                : "Assign role"}
          </button>
        </form>
      </div>
    </div>
  );
}
