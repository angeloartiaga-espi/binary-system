import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 45,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  /* ========================= HEADER ========================= */ header: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#004369",
    marginBottom: 4,
  },
  reportTitle: { fontSize: 13, fontWeight: "bold", marginBottom: 4 },
  reportDate: { fontSize: 8, color: "#666666" },
  /* ========================= TABLE ========================= */ table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  tableHeader: { flexDirection: "row", backgroundColor: "#004369" },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#DDDDDD",
    minHeight: 28,
    alignItems: "center",
  },
  tableRowAlt: { backgroundColor: "#F7F9FA" },
  /* ========================= CELLS ========================= */ cell: {
    paddingVertical: 6,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderRightColor: "#DDDDDD",
  },
  headerCell: {
    paddingVertical: 7,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderRightColor: "#FFFFFF",
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  /* ========================= COLUMN WIDTHS TOTAL = 100% ========================= */ project:
    { width: "18%" },
  location: { width: "22%" },
  totalArea: { width: "15%", textAlign: "right" },
  cuts: { width: "14%", textAlign: "center" },
  available: { width: "14%", textAlign: "center" },
  lots: { width: "8%", textAlign: "center" },
  status: { width: "9%", textAlign: "center", borderRightWidth: 0 },
  /* ========================= EMPTY STATE ========================= */ emptyCell:
    {
      width: "100%",
      textAlign: "center",
      padding: 12,
      color: "#666666",
      borderRightWidth: 0,
    },
  /* ========================= FOOTER ========================= */ footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#777777",
  },
});
/* ========================= NUMBER FORMAT ========================= */ const numberFmt =
  (value) =>
    value == null
      ? "—"
      : Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
/* ========================= REPORT DATE ========================= */ const getReportDate =
  () => {
    return new Date().toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
/* ========================= STATUS ========================= */ const formatStatus =
  (status) => {
    if (!status) return "—";
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };
/* ========================= PDF COMPONENT ========================= */ export default function ProjectLocationsPDF({
  projects = [],
}) {
  return (
    <Document>
      {" "}
      <Page size="A4" orientation="landscape" style={styles.page}>
        {" "}
        {/* ========================= HEADER ========================= */}{" "}
        <View style={styles.header}>
          {" "}
          <Text style={styles.companyName}>
            {" "}
            Estate Site Properties Inc.{" "}
          </Text>{" "}
          <Text style={styles.reportTitle}>
            {" "}
            Project Locations Report{" "}
          </Text>{" "}
          <Text style={styles.reportDate}>
            {" "}
            Generated on: {getReportDate()}{" "}
          </Text>{" "}
        </View>{" "}
        {/* ========================= TABLE ========================= */}{" "}
        <View style={styles.table}>
          {" "}
          {/* TABLE HEADER */}{" "}
          <View style={styles.tableHeader}>
            {" "}
            <Text style={[styles.cell, styles.headerCell, styles.project]}>
              {" "}
              PROJECT{" "}
            </Text>{" "}
            <Text style={[styles.cell, styles.headerCell, styles.location]}>
              {" "}
              LOCATION{" "}
            </Text>{" "}
            <Text style={[styles.cell, styles.headerCell, styles.totalArea]}>
              {" "}
              TOTAL AREA (SQM){" "}
            </Text>{" "}
            <Text style={[styles.cell, styles.headerCell, styles.cuts]}>
              {" "}
              CUTS, INC. ROAD{" "}
            </Text>{" "}
            <Text style={[styles.cell, styles.headerCell, styles.available]}>
              {" "}
              AVAILABLE CUTS{" "}
            </Text>{" "}
            <Text style={[styles.cell, styles.headerCell, styles.lots]}>
              {" "}
              LOTS{" "}
            </Text>{" "}
            <Text style={[styles.cell, styles.headerCell, styles.status]}>
              {" "}
              STATUS{" "}
            </Text>{" "}
          </View>{" "}
          {/* TABLE ROWS */}{" "}
          {projects.map((project, index) => (
            <View
              key={project.id || index}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              {" "}
              {/* PROJECT */}{" "}
              <Text style={[styles.cell, styles.project]}>
                {" "}
                {project.projectName || "—"}{" "}
              </Text>{" "}
              {/* LOCATION */}{" "}
              <Text style={[styles.cell, styles.location]}>
                {" "}
                {project.location || "—"}{" "}
              </Text>{" "}
              {/* TOTAL AREA */}{" "}
              <Text style={[styles.cell, styles.totalArea]}>
                {" "}
                {numberFmt(project.totalLotAreaSqm)}{" "}
              </Text>{" "}
              {/* CUTS, INCLUDING ROAD */}{" "}
              <Text style={[styles.cell, styles.cuts]}>
                {" "}
                {project.cutsIncRoad ?? 0}{" "}
              </Text>{" "}
              {/* AVAILABLE CUTS */}{" "}
              <Text style={[styles.cell, styles.available]}>
                {" "}
                {project.availableCuts ?? 0}{" "}
              </Text>{" "}
              {/* LOTS */}{" "}
              <Text style={[styles.cell, styles.lots]}>
                {" "}
                {project.lotCount ?? 0}{" "}
              </Text>{" "}
              {/* STATUS */}{" "}
              <Text style={[styles.cell, styles.status]}>
                {" "}
                {formatStatus(project.status)}{" "}
              </Text>{" "}
            </View>
          ))}{" "}
          {/* EMPTY STATE */}{" "}
          {projects.length === 0 && (
            <View style={styles.tableRow}>
              {" "}
              <Text style={styles.emptyCell}>
                {" "}
                No project locations available.{" "}
              </Text>{" "}
            </View>
          )}{" "}
        </View>{" "}
        {/* ========================= FOOTER ========================= */}{" "}
        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `ESPI PORTAL • Project Locations • Page ${pageNumber} of ${totalPages}`
          }
        />{" "}
      </Page>{" "}
    </Document>
  );
}
