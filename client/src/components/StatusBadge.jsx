const styles = {
    BRONZE: 'bg-amber-100 text-amber-800',
    SILVER: 'bg-gray-200 text-gray-700',
    GOLD: 'bg-yellow-100 text-yellow-800',
    PLATINUM: 'bg-indigo-100 text-indigo-800',
};

export default function StatusBadge({ status }) {
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
}
