import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchLots, deleteLot } from "../../features/lots/lotsSlice";
import { fetchProjectLocationById } from "../../features/projectLocations/projectLocationsSlice";
import ConfirmDialog from "../../components/ConfirmDialog";
import LotFormModal from "./LotFormModal";
import LotStatusBadge from "./LotStatusBadge";

const numberFmt = (value) =>
  value == null
    ? "—"
    : Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function LotsList() {
  const { projectLocationId } = useParams();
  const dispatch = useDispatch();
  const { list, page, totalPages, status } = useSelector((state) => state.lots);
  const { selectedProject } = useSelector((state) => state.projectLocations);
  const [search, setSearch] = useState("");

  const [formModalLot, setFormModalLot] = useState(undefined); // undefined = closed, null = add
  const [lotToDelete, setLotToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectLocationById(projectLocationId));
  }, [dispatch, projectLocationId]);

  useEffect(() => {
    dispatch(fetchLots({ projectLocationId, page: 1, search }));
  }, [dispatch, projectLocationId, search]);

  const refresh = () =>
    dispatch(fetchLots({ projectLocationId, page: 1, search }));

  const handleConfirmDelete = async () => {
    setDeleting(true);
    await dispatch(deleteLot(lotToDelete.id));
    setDeleting(false);
    setLotToDelete(null);
  };

  return (
    <div className="p-8">
      <Link
        to="/properties"
        className="text-sm text-brand-dark/70 hover:underline"
      >
        ← Back to Project Locations
      </Link>

      <div className="flex justify-between items-center mt-2 mb-6">
        <div>
          <h1 className="font-serif text-2xl text-brand-dark">
            {selectedProject ? `${selectedProject.projectName} — Lots` : "Lots"}
          </h1>
          {selectedProject && (
            <p className="text-sm text-gray-500">{selectedProject.location}</p>
          )}
        </div>
        <button
          onClick={() => setFormModalLot(null)}
          className="bg-brand-gold text-brand-dark px-4 py-2 rounded-md font-semibold"
        >
          Add new lot
        </button>
      </div>

      <input
        placeholder="Search by lot number"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2"
      />

      <div className="bg-white rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b text-gray-500 text-sm">
            <tr>
              <th className="p-3">Lot number</th>
              <th className="p-3">Area (sqm)</th>
              <th className="p-3">Status</th>
              <th className="p-3">Remarks</th>
              <th className="p-3">Quotations</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {status === "loading" && (
              <tr>
                <td className="p-3" colSpan={6}>
                  Loading...
                </td>
              </tr>
            )}
            {status !== "loading" && list.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={6}>
                  No lots yet for this project.
                </td>
              </tr>
            )}
            {list.map((lot) => (
              <tr key={lot.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{lot.lotNumber}</td>
                <td className="p-3">{numberFmt(lot.lotAreaSqm)}</td>
                <td className="p-3">
                  <LotStatusBadge status={lot.status} />
                </td>
                <td className="p-3 text-gray-500">{lot.remarks || "—"}</td>
                <td className="p-3">{lot.quotationCount ?? 0}</td>
                <td className="p-3 space-x-3 whitespace-nowrap">
                  <button
                    onClick={() => setFormModalLot(lot)}
                    className="text-brand-dark font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setLotToDelete(lot)}
                    className="text-red-600 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-3">
        Page {page} of {totalPages}
      </p>

      {formModalLot !== undefined && (
        <LotFormModal
          projectLocationId={projectLocationId}
          existingLot={formModalLot}
          onClose={() => setFormModalLot(undefined)}
          onSaved={() => {
            setFormModalLot(undefined);
            refresh();
          }}
        />
      )}

      {lotToDelete && (
        <ConfirmDialog
          title="Delete lot"
          message={
            lotToDelete.quotationCount > 0
              ? `"${lotToDelete.lotNumber}" has ${lotToDelete.quotationCount} quotation(s). Deleting it will also permanently delete those. This can't be undone.`
              : `Are you sure you want to delete "${lotToDelete.lotNumber}"? This can't be undone.`
          }
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setLotToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
