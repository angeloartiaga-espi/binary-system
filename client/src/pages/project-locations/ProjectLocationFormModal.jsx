import { useState } from "react";
import { useDispatch } from "react-redux";

import FormInput from "../../components/FormInput";
import FormSelect from "../../components/FormSelect";
import Modal from "../../components/Modal";

import {
  createProjectLocation,
  updateProjectLocation,
} from "../../features/projectLocations/projectLocationsSlice";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "COMPLETED"].map((v) => ({
  value: v,
  label: v,
}));

const createFormFromProject = (project) => {
  if (!project) {
    return {
      projectName: "",
      location: "",
      totalLotAreaSqm: "",
      description: "",
      status: "ACTIVE",
    };
  }

  return {
    projectName: project.projectName || "",
    location: project.location || "",
    totalLotAreaSqm: String(project.totalLotAreaSqm ?? ""),
    description: project.description || "",
    status: project.status || "ACTIVE",
  };
};

// existingProject is null when adding,
// or a project object when editing.
export default function ProjectLocationFormModal({
  existingProject,
  onClose,
  onSaved,
}) {
  const dispatch = useDispatch();

  const isEdit = Boolean(existingProject);

  const [form, setForm] = useState(() =>
    createFormFromProject(existingProject),
  );

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError(null);

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSaving(true);

    try {
      // --------------------------------------
      // PROJECT NAME
      // --------------------------------------

      if (!form.projectName.trim()) {
        setError("Project name is required.");
        return;
      }

      // --------------------------------------
      // LOCATION
      // --------------------------------------

      if (!form.location.trim()) {
        setError("Location is required.");
        return;
      }

      // --------------------------------------
      // TOTAL LOT AREA
      // --------------------------------------

      if (!form.totalLotAreaSqm) {
        setError("Total lot area is required.");
        return;
      }

      const totalLotArea = Number(form.totalLotAreaSqm);

      if (!Number.isFinite(totalLotArea) || totalLotArea <= 0) {
        setError("Total lot area must be greater than 0.");
        return;
      }

      // --------------------------------------
      // PAYLOAD
      // --------------------------------------

      const payload = {
        projectName: form.projectName.trim(),
        location: form.location.trim(),
        totalLotAreaSqm: form.totalLotAreaSqm,
        description: form.description.trim() || undefined,
        status: form.status,
      };

      // --------------------------------------
      // CREATE / UPDATE
      // --------------------------------------

      let action;

      if (isEdit) {
        action = await dispatch(
          updateProjectLocation({
            id: existingProject.id,
            payload,
          }),
        );
      } else {
        action = await dispatch(createProjectLocation(payload));
      }

      // --------------------------------------
      // ERROR
      // --------------------------------------

      if (action.error) {
        setError(
          action.payload ||
            action.error?.message ||
            "Something went wrong while saving the project.",
        );

        return;
      }

      // --------------------------------------
      // SUCCESS
      // --------------------------------------

      onSaved();
    } catch (err) {
      setError(
        err?.message || "Something went wrong while saving the project.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Modal
      title={isEdit ? "Edit project location" : "Add new project location"}
      onClose={onClose}
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PROJECT NAME + LOCATION */}

        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
          <FormInput
            label="Project name"
            name="projectName"
            value={form.projectName}
            onChange={handleChange}
            placeholder="Enter project name"
            required
          />

          <FormInput
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Enter project location"
            required
          />
        </div>

        {/* TOTAL AREA + STATUS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
          <FormInput
            label="Total lot area (sqm)"
            type="number"
            step="0.01"
            min="0"
            name="totalLotAreaSqm"
            value={form.totalLotAreaSqm}
            onChange={handleChange}
            placeholder="Enter total lot area"
            required
          />

          <FormSelect
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
            placeholder={null}
          />
        </div>

        {/* DESCRIPTION */}

        <FormInput
          label="Description (optional)"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Enter project description"
        />

        {/* INFORMATION */}

        <p className="text-xs text-gray-500">
          Cuts, Inc. Road and Available Cuts are counted automatically from this
          project's lots.
        </p>

        {/* BUTTONS */}

        <div className="flex gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-md bg-[#004369] px-4 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
