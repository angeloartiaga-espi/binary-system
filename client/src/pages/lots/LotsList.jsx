import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";

import { fetchLots, deleteLot } from "../../features/lots/lotsSlice";

import { fetchProjectLocationById } from "../../features/projectLocations/projectLocationsSlice";

import ConfirmDialog from "../../components/ConfirmDialog";
import LotFormModal from "./LotFormModal";
import LotStatusBadge from "./LotStatusBadge";
import { PriceListDownload } from "./PriceListPDF";

const numberFmt = (value) =>
  value == null
    ? "—"
    : Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });

export default function LotsList() {
  const { projectLocationId } = useParams();
  const dispatch = useDispatch();

  const {
    list = [],
    page,
    totalPages,
    status,
  } = useSelector((state) => state.lots);

  const { selectedProject } = useSelector((state) => state.projectLocations);

  const [search, setSearch] = useState("");
  const [formModalLot, setFormModalLot] = useState(undefined);
  const [lotToDelete, setLotToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (projectLocationId) {
      dispatch(fetchProjectLocationById(projectLocationId));
    }
  }, [dispatch, projectLocationId]);

  useEffect(() => {
    if (projectLocationId) {
      dispatch(
        fetchLots({
          projectLocationId,
          page: 1,
          search,
        }),
      );
    }
  }, [dispatch, projectLocationId, search]);

  const refresh = () =>
    dispatch(
      fetchLots({
        projectLocationId,
        page: 1,
        search,
      }),
    );

  const handleConfirmDelete = async () => {
    if (!lotToDelete) return;

    setDeleting(true);

    try {
      await dispatch(deleteLot(lotToDelete.id)).unwrap();
      setLotToDelete(null);
      await refresh();
    } catch (error) {
      console.error("Failed to delete lot:", error);
    } finally {
      setDeleting(false);
    }
  };

  // Sort a copy to avoid modifying the Redux state array.
  const sortedLots = [...list].sort((a, b) =>
    String(a.lotNumber ?? "").localeCompare(
      String(b.lotNumber ?? ""),
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      },
    ),
  );

  return (
    <div className="p-8">
      <Link
        to="/properties"
        className="text-sm text-brand-dark/70 hover:underline"
      >
        ← Back to Project Locations
      </Link>

      <div className="mt-2 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-brand-dark">
            {selectedProject ? `${selectedProject.projectName} — Lots` : "Lots"}
          </h1>

          {selectedProject && (
            <p className="text-sm text-gray-500">{selectedProject.location}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Download the price list using the current lot data */}
          <PriceListDownload
            lots={sortedLots}
            projectName={
              selectedProject?.projectName ?? "HOUSE AND LOT PACKAGE"
            }
            location={selectedProject?.location ?? ""}
            asOfDate={new Date()}
          />

          <button
            type="button"
            onClick={() => setFormModalLot(null)}
            className="rounded-md bg-brand-gold px-4 py-2 font-semibold text-brand-dark"
          >
            Add new lot
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by lot number"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2"
      />

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b text-sm text-gray-500">
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

            {status !== "loading" && sortedLots.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={6}>
                  No lots yet for this project.
                </td>
              </tr>
            )}

            {status !== "loading" &&
              sortedLots.map((lot) => (
                <tr key={lot.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{lot.lotNumber}</td>

                  <td className="p-3">{numberFmt(lot.lotAreaSqm)}</td>

                  <td className="p-3">
                    <LotStatusBadge status={lot.status} />
                  </td>

                  <td className="p-3 text-gray-500">{lot.remarks || "—"}</td>

                  <td className="p-3">
                    {lot.quotationCount ?? lot.quotations?.length ?? 0}
                  </td>

                  <td className="space-x-3 whitespace-nowrap p-3">
                    <Link
                      to={`/lots/${lot.id}/quotations`}
                      className="font-medium text-brand-dark hover:underline"
                    >
                      View
                    </Link>

                    <button
                      type="button"
                      onClick={() => setFormModalLot(lot)}
                      className="font-medium text-brand-dark"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setLotToDelete(lot)}
                      className="font-medium text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-gray-500">
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
            (lotToDelete.quotationCount ??
              lotToDelete.quotations?.length ??
              0) > 0
              ? `"${lotToDelete.lotNumber}" has ${
                  lotToDelete.quotationCount ?? lotToDelete.quotations.length
                } quotation(s). Deleting it will also permanently delete those. This can't be undone.`
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
