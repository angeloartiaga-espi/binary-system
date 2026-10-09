import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

import espiLogo from "../../assets/espilogo-transparent.png";

const C = {
  titleBar: "#FFF0B8",
  headerCell: "#F4B79A",
  rowGreen: "#C9E0B5",
  cutsBlue: "#BFD6EA",
  total: "#F5B82E",
  border: "#526B7A",
  text: "#123A4A",
};

const s = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingHorizontal: 40,
    paddingBottom: 35,
    fontFamily: "Helvetica",
    color: C.text,
    fontSize: 9,
    borderWidth: 2,
    borderColor: "#004369",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.titleBar,
    padding: 8,
    minHeight: 65,
    borderWidth: 1.5,
    borderColor: "#004369",
  },

  logoBox: {
    width: 100,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },

  logoImg: {
    width: 95,
    height: 52,
    objectFit: "contain",
  },

  logoText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#3E7B2A",
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "bold",
  },

  asOf: {
    width: 130,
    textAlign: "right",
    fontSize: 8,
  },

  table: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#004369",
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: C.border,
    minHeight: 25,
  },

  cell: {
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderLeftWidth: 1,
    borderColor: C.border,
  },

  cellText: {
    fontSize: 8.5,
  },

  headerCell: {
    backgroundColor: C.headerCell,
    minHeight: 30,
    borderBottomWidth: 1.5,
    borderColor: "#004369",
  },

  headText: {
    fontSize: 8.5,
    fontWeight: "bold",
    textAlign: "center",
  },

  center: {
    textAlign: "center",
  },

  // Three columns only
  project: {
    width: "55%",
  },

  totalArea: {
    width: "22.5%",
  },

  available: {
    width: "22.5%",
  },

  totalRow: {
    flexDirection: "row",
    backgroundColor: C.total,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: "#004369",
  },

  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },

  emptyCell: {
    width: "100%",
    textAlign: "center",
    padding: 12,
    color: "#666666",
    fontSize: 9,
  },
});

const numberFmt = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString("en-PH", {
        maximumFractionDigits: 2,
      })
    : "—";
};

const getReportDate = () =>
  new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function ProjectLocationsPDF({
  projects = [],
  logo = espiLogo,
  title = "PRODUCT INVENTORY",
}) {
  // Sum available cuts across the supplied projects.
  const totalLotsAvailable = projects.reduce((sum, project) => {
    const value = Number(project.availableCuts);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  return (
    <Document title={title} author="Estate Site Properties Inc.">
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* HEADER */}
        <View style={s.topBar}>
          <View style={s.logoBox}>
            {logo ? (
              <Image src={logo} style={s.logoImg} />
            ) : (
              <Text style={s.logoText}>ESPI</Text>
            )}
          </View>

          <Text style={s.title}>{title}</Text>

          <Text style={s.asOf}>
            AS OF{"\n"}
            {getReportDate()}
          </Text>
        </View>

        {/* TABLE */}
        <View style={s.table}>
          {/* TABLE HEADER */}
          <View style={[s.row, s.headerCell]} wrap={false}>
            <View style={[s.cell, s.project, { borderLeftWidth: 0 }]}>
              <Text style={s.headText}>PROJECT</Text>
            </View>

            <View style={[s.cell, s.totalArea]}>
              <Text style={s.headText}>TOTAL AREA (SQM)</Text>
            </View>

            <View style={[s.cell, s.available]}>
              <Text style={s.headText}>AVAILABLE CUTS</Text>
            </View>
          </View>

          {/* PROJECT ROWS */}
          {projects.map((project, index) => (
            <View key={project.id || index} style={s.row} wrap={false}>
              <View
                style={[
                  s.cell,
                  s.project,
                  {
                    backgroundColor: C.rowGreen,
                    borderLeftWidth: 0,
                  },
                ]}
              >
                <Text style={s.cellText}>
                  {(project.projectName || "—").toUpperCase()}
                </Text>
              </View>

              <View style={[s.cell, s.totalArea]}>
                <Text style={[s.cellText, s.center]}>
                  {numberFmt(project.totalLotAreaSqm)}
                </Text>
              </View>

              <View
                style={[s.cell, s.available, { backgroundColor: C.cutsBlue }]}
              >
                <Text style={[s.cellText, s.center]}>
                  {numberFmt(project.availableCuts)}
                </Text>
              </View>
            </View>
          ))}

          {/* EMPTY STATE */}
          {projects.length === 0 && (
            <View style={s.row} wrap={false}>
              <Text style={s.emptyCell}>No project locations available.</Text>
            </View>
          )}
        </View>

        {/* TOTAL LOTS AVAILABLE ONLY */}
        <View style={s.totalRow} wrap={false}>
          <Text style={s.totalLabel}>
            TOTAL LOTS AVAILABLE: {numberFmt(totalLotsAvailable)} LOTS
          </Text>
        </View>
      </Page>
    </Document>
  );
}
