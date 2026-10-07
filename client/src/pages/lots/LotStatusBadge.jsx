const styles = {
  OPEN: "bg-green-100 text-green-800",
  SOLD: "bg-red-100 text-red-800",
  RE_OPEN: "bg-amber-100 text-amber-800",
  HOLD: "bg-gray-200 text-gray-700",
  RESERVED: "bg-blue-100 text-blue-800",
};

const labels = {
  OPEN: "Open",
  SOLD: "Sold",
  RE_OPEN: "Re-opened",
  HOLD: "On hold",
  RESERVED: "Reserved",
};

export default function LotStatusBadge({ status }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"}`}
    >
      {labels[status] || status}
    </span>
  );
}
