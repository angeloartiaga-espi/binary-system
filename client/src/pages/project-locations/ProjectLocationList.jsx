import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Link } from "react-router-dom";

import ProjectLocationsPDF from "./ProjectLocationPDF";
import {
  fetchProjectLocations,
  fetchAllProjectLocationsForPdf,
  deleteProjectLocation,
} from "../../features/projectLocations/projectLocationsSlice";

import ConfirmDialog from "../../components/ConfirmDialog";
import ProjectLocationFormModal from "./ProjectLocationFormModal";
import ProjectStatusBadge from "./ProjectStatusBadge";
import { LOCATIONS } from "../../constants/locations";

const TABS = [
  { key: "", label: "All" },
  ...LOCATIONS.map((location) => ({
    key: location,
    label: location,
  })),
];

const ITEMS_PER_PAGE = 9;

const numberFmt = (value) =>
  value == null
    ? "—"
    : Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });

export default function ProjectLocationsList() {
  const dispatch = useDispatch();

  const {
    list = [],
    totalPages: serverTotalPages = 1,
    status,
  } = useSelector((state) => state.projectLocations);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [formModalProject, setFormModalProject] = useState(undefined);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // PDF data is independent of the paginated table.
  const [pdfProjects, setPdfProjects] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH TABLE DATA
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    dispatch(
      fetchProjectLocations({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search,
        location: activeTab,
      }),
    );
  }, [dispatch, currentPage, search, activeTab]);

  /*
  |--------------------------------------------------------------------------
  | FILTER VISIBLE PROJECTS
  |--------------------------------------------------------------------------
  */
  const visibleProjects = activeTab
    ? list.filter(
        (project) =>
          project.location?.trim().toLowerCase() ===
          activeTab.trim().toLowerCase(),
      )
    : list;

  const totalPages = Math.max(1, Number(serverTotalPages) || 1);

  /*
  |--------------------------------------------------------------------------
  | REFRESH TABLE
  |--------------------------------------------------------------------------
  */
  const refresh = () => {
    setPdfProjects(null);
    setPdfError("");

    dispatch(
      fetchProjectLocations({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search,
        location: activeTab,
      }),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER HANDLERS
  |--------------------------------------------------------------------------
  */
  const handleTabChange = (location) => {
    setActiveTab(location);
    setCurrentPage(1);
    setPdfProjects(null);
    setPdfError("");
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
    setPdfProjects(null);
    setPdfError("");
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  /*
  |--------------------------------------------------------------------------
  | PDF FILE NAME
  |--------------------------------------------------------------------------
  */
  const pdfFileName = activeTab
    ? `project-locations-${activeTab
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")}.pdf`
    : "project-locations-report.pdf";

  /*
  |--------------------------------------------------------------------------
  | PREPARE PDF WITH ALL MATCHING PROJECTS
  |--------------------------------------------------------------------------
  */
  const handlePreparePdf = async () => {
    setPdfLoading(true);
    setPdfProjects(null);
    setPdfError("");

    try {
      const projects = await dispatch(
        fetchAllProjectLocationsForPdf({
          search,
          location: activeTab,
        }),
      ).unwrap();

      // Apply an additional client-side location check.
      const filteredProjects = activeTab
        ? projects.filter(
            (project) =>
              project.location?.trim().toLowerCase() ===
              activeTab.trim().toLowerCase(),
          )
        : projects;

      setPdfProjects(filteredProjects);
    } catch (error) {
      console.error("Failed to prepare project locations PDF:", error);

      setPdfError(
        typeof error === "string"
          ? error
          : "Unable to prepare the PDF report. Please try again.",
      );
    } finally {
      setPdfLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE PROJECT
  |--------------------------------------------------------------------------
  */
  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setDeleting(true);

    try {
      await dispatch(deleteProjectLocation(projectToDelete.id)).unwrap();

      setProjectToDelete(null);
      setPdfProjects(null);
      setPdfError("");

      // If the deleted project was the only row on this page,
      // go back one page when possible.
      if (visibleProjects.length === 1 && currentPage > 1) {
        setCurrentPage((previous) => previous - 1);
      } else {
        refresh();
      }
    } catch (error) {
      console.error("Failed to delete project location:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="font-serif text-2xl text-brand-dark">
          Inventories/Location
        </h1>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePreparePdf}
            disabled={pdfLoading}
            className="bg-[#004369] text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-print"></i>
            <span>
              {pdfLoading ? "Loading all projects..." : "Prepare PDF Report"}
            </span>
          </button>

          {pdfProjects !== null && (
            <PDFDownloadLink
              key={`${activeTab}-${search}-${pdfProjects.length}`}
              document={<ProjectLocationsPDF projects={pdfProjects} />}
              fileName={pdfFileName}
              className="bg-brand-gold text-brand-dark px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:opacity-90 transition"
            >
              {({ loading }) => (
                <>
                  <i className="fa-solid fa-download"></i>
                  <span>{loading ? "Generating PDF..." : "Download PDF"}</span>
                </>
              )}
            </PDFDownloadLink>
          )}

          <button
            type="button"
            onClick={() => setFormModalProject(null)}
            className="bg-brand-gold text-brand-dark px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:opacity-90 transition"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add new project</span>
          </button>
        </div>
      </div>

      {/* PDF status */}
      {pdfError && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {pdfError}
        </p>
      )}

      {pdfProjects !== null && (
        <p className="mb-4 text-sm text-gray-600">
          PDF data ready: {pdfProjects.length} project(s)
          {activeTab ? ` in ${activeTab}` : ""}. Select Download PDF to export.
        </p>
      )}

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
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => handleTabChange(tab.key)}
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
        onChange={(event) => handleSearchChange(event.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2"
      />

      {/* Projects table */}
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
            {status === "loading" && (
              <tr>
                <td className="p-3" colSpan={7}>
                  Loading projects...
                </td>
              </tr>
            )}

            {status !== "loading" && visibleProjects.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500 text-center" colSpan={7}>
                  {search
                    ? "No projects match your search."
                    : activeTab
                      ? `No projects in ${activeTab} yet.`
                      : "No project locations yet."}
                </td>
              </tr>
            )}

            {status !== "loading" &&
              [...visibleProjects]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map((project) => (
                  <tr key={project.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{project.projectName}</td>

                    <td className="p-3">{project.location}</td>

                    <td className="p-3">
                      {numberFmt(project.totalLotAreaSqm)}
                    </td>

                    <td className="p-3 text-center font-medium">
                      {project.incRoad ?? 0}
                    </td>

                    <td className="p-3 text-center text-green-700 font-medium">
                      {project.availableCuts ?? 0}
                    </td>

                    <td className="p-3">
                      <ProjectStatusBadge status={project.status} />
                    </td>

                    <td className="p-3 space-x-3 whitespace-nowrap">
                      <Link
                        to={`/properties/${project.id}/lots`}
                        className="text-brand-dark font-medium"
                      >
                        View
                      </Link>

                      <button
                        type="button"
                        onClick={() => setFormModalProject(project)}
                        className="text-brand-dark font-medium"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
        <p className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1 || status === "loading"}
            className="px-3 py-2 border rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            First
          </button>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || status === "loading"}
            className="px-3 py-2 border rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="px-2 text-sm font-medium">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || status === "loading"}
            className="px-3 py-2 border rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>

          <button
            type="button"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages || status === "loading"}
            className="px-3 py-2 border rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {formModalProject !== undefined && (
        <ProjectLocationFormModal
          existingProject={formModalProject}
          defaultLocation={activeTab}
          onClose={() => setFormModalProject(undefined)}
          onSaved={() => {
            setFormModalProject(undefined);
            setPdfProjects(null);
            setPdfError("");
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
