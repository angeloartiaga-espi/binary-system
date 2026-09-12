import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../app/axios';

export default function VerifyEmail() {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying'); // verifying | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        api
            .get(`/auth/verify-email/${token}`)
            .then(() => setStatus('success'))
            .catch((err) => {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed');
            });
    }, [token]);

    return (
        <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center text-center px-6">
            {status === 'verifying' && <p className="text-gray-600">Verifying your email...</p>}

            {status === 'success' && (
                <>
                    <h1 className="font-serif text-2xl text-brand-dark mb-2">Email confirmed!</h1>
                    <p className="text-gray-600 mb-6">Your account is now verified.</p>
                    <Link to="/login" className="bg-brand-gold text-brand-dark font-semibold px-6 py-2 rounded-md">
                        Sign in
                    </Link>
                </>
            )}

            {status === 'error' && (
                <>
                    <h1 className="font-serif text-2xl text-brand-dark mb-2">Verification failed</h1>
                    <p className="text-gray-600">{message}</p>
                </>
            )}
        </div>
    );
}