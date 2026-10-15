import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ProjectLocationsPDF from "./ProjectLocationPDF";
import { Link } from "react-router-dom";
import {
  fetchProjectLocations,
  deleteProjectLocation,
} from "../../features/projectLocations/projectLocationsSlice";
import ConfirmDialog from "../../components/ConfirmDialog";
import ProjectLocationFormModal from "./ProjectLocationFormModal";
import ProjectStatusBadge from "./ProjectStatusBadge";
import { LOCATIONS } from "../../constants/locations";

// key "" = no location filter. "All" also keeps any older project saved with
// some other location reachable.
const TABS = [
  { key: "", label: "All" },
  ...LOCATIONS.map((location) => ({ key: location, label: location })),
];

const numberFmt = (value) =>
  value == null
    ? "—"
    : Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function ProjectLocationsList() {
  const dispatch = useDispatch();
  const { list, page, totalPages, status } = useSelector(
    (state) => state.projectLocations,
  );
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(""); // "" | "Baguio" | "La Union"
  const [formModalProject, setFormModalProject] = useState(undefined);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectLocations({ page: 1, search, location: activeTab }));
  }, [dispatch, search, activeTab]);

  const refresh = () =>
    dispatch(fetchProjectLocations({ page: 1, search, location: activeTab }));

  // Exactly the projects in the selected tab. The server is asked to filter
  // too, but this guarantees it here, so the table AND the PDF are right even
  // if the server ignored the filter.
  const visibleProjects = activeTab
    ? list.filter((project) => project.location === activeTab)
    : list;

  // "project-locations-baguio.pdf", "project-locations-la-union.pdf", or the
  // original name on the All tab.
  const pdfFileName = activeTab
    ? `project-locations-${activeTab.toLowerCase().replace(/\s+/g, "-")}.pdf`
    : "project-locations-report.pdf";

  const handleConfirmDelete = async () => {
    setDeleting(true);
    await dispatch(deleteProjectLocation(projectToDelete.id));
    setDeleting(false);
    setProjectToDelete(null);
  };

  return (
    <div className="p-8">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="font-serif text-2xl text-brand-dark">
          Inventories/Location
        </h1>
        <div className="flex flex-wrap gap-2">
          <PDFDownloadLink
            key={activeTab || "all"} // rebuild the PDF whenever the tab changes
            document={<ProjectLocationsPDF projects={visibleProjects} />}
            fileName={pdfFileName}
            className="bg-[#004369] text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:opacity-90 transition"
          >
            {({ loading }) => (
              <>
                <i className="fa-solid fa-print"></i>
                <span>{loading ? "Preparing PDF..." : "PDF Report"}</span>
              </>
            )}
          </PDFDownloadLink>

          <button
            onClick={() => setFormModalProject(null)}
            className="bg-brand-gold text-brand-dark px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:opacity-90 transition"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add new project</span>
          </button>
        </div>
      </div>

      {/* Location tabs */}
      <div
        role="tablist"
        className="flex gap-1 border-b border-brand-dark/10 mb-4"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.key;
          return (
            <button
              key={tab.label}
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                selected
                  ? "border-brand-gold text-brand-dark"
                  : "border-transparent text-gray-500 hover:text-brand-dark"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <input
        placeholder="Search by project name or location"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2"
      />

      {/* Table */}
      <div className="bg-white rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b text-gray-500 text-sm">
            <tr>
              <th className="p-3">Inventory</th>
              <th className="p-3">Location</th>
              <th className="p-3">Total (sqm)</th>
              <th className="p-3 text-center">Cuts, Inc. Road</th>
              <th className="p-3 text-center">Available Cuts</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Loading */}
            {status === "loading" && (
              <tr>
                <td className="p-3" colSpan={7}>
                  Loading...
                </td>
              </tr>
            )}

            {/* Empty */}
            {status !== "loading" && list.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={7}>
                  {activeTab
                    ? `No projects in ${activeTab} yet.`
                    : "No project locations yet."}
                </td>
              </tr>
            )}

            {/* Projects */}
            {list.map((project) => (
              <tr key={project.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{project.projectName}</td>
                <td className="p-3">{project.location}</td>
                <td className="p-3">{numberFmt(project.totalLotAreaSqm)}</td>

                {/* Cuts, Inc. Road = lots that are Sold, Hold or Reserved */}
                <td className="p-3 text-center font-medium">
                  {project.incRoad}
                </td>

                {/* Available Cuts = lots that are Open, Re-open or RFO */}
                <td className="p-3 text-center text-green-700 font-medium">
                  {project.availableCuts}
                </td>

                <td className="p-3">
                  <ProjectStatusBadge status={project.status} />
                </td>

                {/* Actions */}
                <td className="p-3 space-x-3 whitespace-nowrap">
                  <Link
                    to={`/properties/${project.id}/lots`}
                    className="text-brand-dark font-medium"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => setFormModalProject(project)}
                    className="text-brand-dark font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setProjectToDelete(project)}
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

      {/* Pagination */}
      <p className="text-sm text-gray-500 mt-3">
        Page {page} of {totalPages}
      </p>

      {/* Add/Edit Modal */}
      {formModalProject !== undefined && (
        <ProjectLocationFormModal
          existingProject={formModalProject}
          defaultLocation={activeTab}
          onClose={() => setFormModalProject(undefined)}
          onSaved={() => {
            setFormModalProject(undefined);
            refresh();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {projectToDelete && (
        <ConfirmDialog
          title="Delete project location"
          message={
            projectToDelete.cuts > 0
              ? `"${projectToDelete.projectName}" has ${projectToDelete.cuts} lot(s). Deleting it will also permanently delete those lots and any of their quotations. This can't be undone.`
              : `Are you sure you want to delete "${projectToDelete.projectName}"? This can't be undone.`
          }
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setProjectToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
