import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import SplitAuthLayout from '../components/SplitAuthLayout';
import FormInput from '../components/FormInput';
import { registerUser } from '../features/auth/authSlice';
import PrivacyNotice from '../components/PrivacyNotice';

export default function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error } = useSelector((state) => state.auth);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        referrerCode: '',
        password: '',
        confirmPassword: '',
    });
    const [idImage, setIdImage] = useState(null);
    const [agreed, setAgreed] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreed) return;

        // multipart/form-data because we're sending a file alongside text fields
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => data.append(key, value));
        data.append('privacyConsent', 'true');
        if (idImage) data.append('idImage', idImage);

        const result = await dispatch(registerUser(data));
        if (registerUser.fulfilled.match(result)) {
            navigate('/login');
        }
    };

    return (
        <SplitAuthLayout heading="Build your career with ESPI. Join the team shaping how families find home.">
            <h2 className="font-serif text-2xl mb-1">Create your account</h2>
            <p className="text-gray-600 mb-6">Set up access to manage listings, leads and clients.</p>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <FormInput label="First name" name="firstName" value={form.firstName} onChange={handleChange} required />
                    <FormInput label="Last name" name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>

                <FormInput label="Email address" type="email" name="email" value={form.email} onChange={handleChange} required />
                <FormInput label="Phone number" name="phone" value={form.phone} onChange={handleChange} />

                <FormInput
                    label="Referral code (optional)"
                    name="referrerCode"
                    value={form.referrerCode}
                    onChange={handleChange}
                    placeholder="e.g. JUA-4F9K2L"
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} required />
                    <FormInput
                        label="Confirm password"
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Upload ID image</label>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setIdImage(e.target.files[0])} />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Privacy Notice</label>
                    <PrivacyNotice />
                </div>

                <label className="flex items-start gap-2 mb-6 text-sm">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
                    <span>I agree to the Terms and Privacy Policy</span>
                </label>

                <button
                    type="submit"
                    disabled={!agreed || status === 'loading'}
                    className="w-full bg-gradient-to-r from-brand-gold to-yellow-600 text-brand-dark font-semibold py-2 rounded-md disabled:opacity-50"
                >
                    {status === 'loading' ? 'Creating account...' : 'Create account'}
                </button>

                <p className="text-center text-sm mt-4">
                    Already registered?{' '}
                    <Link to="/login" className="font-semibold text-brand-dark">
                        Sign in instead
                    </Link>
                </p>
            </form>
        </SplitAuthLayout>
    );
}
