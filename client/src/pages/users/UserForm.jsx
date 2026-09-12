import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import FormInput from '../../components/FormInput';
import { fetchUserById, createUser, updateUser } from '../../features/users/usersSlice';

const MEMBERSHIP_OPTIONS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

export default function UserForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const selectedUser = useSelector((state) => state.users.selectedUser);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        membershipStatus: 'BRONZE',
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEdit) dispatch(fetchUserById(id));
    }, [dispatch, id, isEdit]);

    useEffect(() => {
        if (isEdit && selectedUser) {
            setForm({
                firstName: selectedUser.firstName,
                lastName: selectedUser.lastName,
                email: selectedUser.email,
                phone: selectedUser.phone || '',
                password: '',
                membershipStatus: selectedUser.membershipStatus,
            });
        }
    }, [isEdit, selectedUser]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const payload = { ...form };
        if (!payload.password) delete payload.password; // don't overwrite with a blank password

        const action = isEdit
            ? await dispatch(updateUser({ id, payload }))
            : await dispatch(createUser(payload));

        if (action.error) {
            setError(action.payload || 'Something went wrong');
        } else {
            navigate('/users');
        }
    };

    return (
        <div className="p-8 max-w-lg">
            <h1 className="font-serif text-2xl text-brand-dark mb-6">
                {isEdit ? 'Edit user' : 'Add new user'}
            </h1>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                    <FormInput label="First name" name="firstName" value={form.firstName} onChange={handleChange} required />
                    <FormInput label="Last name" name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>

                <FormInput label="Email address" type="email" name="email" value={form.email} onChange={handleChange} required />
                <FormInput label="Phone number" name="phone" value={form.phone} onChange={handleChange} />

                <FormInput
                    label={isEdit ? 'New password (leave blank to keep current)' : 'Password'}
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required={!isEdit}
                />

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Membership status</label>
                    <select
                        name="membershipStatus"
                        value={form.membershipStatus}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                        {MEMBERSHIP_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="w-full bg-brand-gold text-brand-dark font-semibold py-2 rounded-md">
                    {isEdit ? 'Save changes' : 'Create user'}
                </button>
            </form>
        </div>
    );
}
