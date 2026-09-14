
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser } from '../../features/users/usersSlice';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import UserFormModal from './UserFormModal';

export default function UsersList() {
  const dispatch = useDispatch();

  const { list, page, totalPages, status } = useSelector(
    (state) => state.users
  );

  const [search, setSearch] = useState('');

  // undefined = closed
  // null = add mode
  // user object = edit mode
  const [formModalUser, setFormModalUser] = useState(undefined);

  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchUsers({ page: 1, search }));
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, search]);

  const refresh = () => {
    dispatch(fetchUsers({ page: 1, search }));
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);

    await dispatch(deleteUser(userToDelete.id));

    setDeleting(false);
    setUserToDelete(null);

    // Refresh the list after deactivation
    refresh();
  };

  const isLoading = status === 'loading';

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl text-brand-dark">
          Users
        </h1>

        <button
          onClick={() => setFormModalUser(null)}
          className="bg-brand-gold text-brand-dark px-4 py-2 rounded-md font-semibold"
        >
          Add new user
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 w-full max-w-sm">
        <input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-dark" />
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b text-gray-500 text-sm">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Membership</th>
              <th className="p-3">Account Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* Initial loading */}
            {isLoading && list.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-dark" />
                    <span>Loading users...</span>
                  </div>
                </td>
              </tr>
            )}

            {/* No users */}
            {!isLoading && list.length === 0 && (
              <tr>
                <td
                  className="p-6 text-center text-gray-500"
                  colSpan={5}
                >
                  No users found.
                </td>
              </tr>
            )}

            {/* Users */}
            {list.map((user) => (
              <tr
                key={user.id}
                className={`border-b last:border-0 ${
                  isLoading ? 'opacity-60' : ''
                }`}
              >
                <td className="p-3">
                  {user.firstName} {user.lastName}
                </td>

                <td className="p-3">
                  {user.email}
                </td>

                <td className="p-3">
                  <StatusBadge status={user.membershipStatus} />
                </td>

                {/* Account Status */}
                <td className="p-3">
                  {user.isActive ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                      Inactive
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="p-3 space-x-3">
                  <button
                    onClick={() => setFormModalUser(user)}
                    className="text-brand-dark font-medium"
                  >
                    Edit
                  </button>

                  {user.isActive && (
                    <button
                      onClick={() => setUserToDelete(user)}
                      className="text-red-600 font-medium"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <p className="text-sm text-gray-500 mt-3">
        Page {page} of {totalPages}
      </p>

      {/* User Form */}
      {formModalUser !== undefined && (
        <UserFormModal
          existingUser={formModalUser}
          onClose={() => setFormModalUser(undefined)}
          onSaved={() => {
            setFormModalUser(undefined);
            refresh();
          }}
        />
      )}

      {/* Deactivate Confirmation */}
      {userToDelete && (
        <ConfirmDialog
          title="Deactivate user"
          message={`Are you sure you want to deactivate ${userToDelete.firstName} ${userToDelete.lastName}? This can be undone later by an admin.`}
          confirmLabel="Deactivate"
          onConfirm={handleConfirmDelete}
          onCancel={() => setUserToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
