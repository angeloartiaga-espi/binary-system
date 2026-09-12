import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUsers, deleteUser } from '../../features/users/usersSlice';
import StatusBadge from '../../components/StatusBadge';

export default function UsersList() {
    const dispatch = useDispatch();
    const { list, page, totalPages, status } = useSelector((state) => state.users);
    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(fetchUsers({ page: 1, search }));
    }, [dispatch, search]);

    const handleDelete = (id) => {
        if (window.confirm('Remove this user?')) {
            dispatch(deleteUser(id));
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-serif text-2xl text-brand-dark">Users</h1>
                <Link to="/users/new" className="bg-brand-gold text-brand-dark px-4 py-2 rounded-md font-semibold">
                    Add new user
                </Link>
            </div>

            <input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2"
            />

            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="border-b text-gray-500 text-sm">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Membership</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {status === 'loading' && (
                            <tr>
                                <td className="p-3" colSpan={4}>Loading...</td>
                            </tr>
                        )}
                        {list.map((user) => (
                            <tr key={user.id} className="border-b last:border-0">
                                <td className="p-3">{user.firstName} {user.lastName}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3"><StatusBadge status={user.membershipStatus} /></td>
                                <td className="p-3 space-x-3">
                                    <Link to={`/users/${user.id}/edit`} className="text-brand-dark font-medium">Edit</Link>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 font-medium">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="text-sm text-gray-500 mt-3">Page {page} of {totalPages}</p>
        </div>
    );
}
