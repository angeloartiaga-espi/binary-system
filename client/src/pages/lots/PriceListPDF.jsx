import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// Colors
const GREEN = "#a9d18e";
const ORANGE = "#f4b942";
const DARK = "#1a1a1a";

// Column widths (% of table width)
const W = {
  lot: 8,
  lotArea: 8,
  floor: 8,
  tcp: 13,
  dp: 11,
  bal: 11,
  y10: 10.25,
  y15: 10.25,
  y20: 10.25,
  y25: 10.25,
};

const s = StyleSheet.create({
  page: {
    padding: 28,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  titleBar: {
    backgroundColor: ORANGE,
    paddingVertical: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  subBar: {
    backgroundColor: GREEN,
    paddingVertical: 5,
    alignItems: "center",
  },
  sub: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    textAlign: "center",
  },
  asOf: {
    fontSize: 8,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 6,
    fontFamily: "Helvetica-Oblique",
  },
  headRow: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
  },
  headCell: {
    borderWidth: 0.5,
    borderColor: "#555",
    paddingVertical: 4,
    paddingHorizontal: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  headText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  amortSpan: {
    flexDirection: "column",
    borderWidth: 0.5,
    borderColor: "#555",
  },
  amortTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderColor: "#555",
  },
  amortYears: {
    flexDirection: "row",
    flex: 1,
  },
  yearCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    borderRightWidth: 0.5,
    borderColor: "#555",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    borderWidth: 0.5,
    borderColor: "#555",
    paddingVertical: 5,
    paddingHorizontal: 3,
    justifyContent: "center",
  },
  cellText: {
    fontSize: 8.5,
    textAlign: "center",
    color: DARK,
  },
  lotText: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  footer: {
    marginTop: 8,
    fontSize: 7,
    color: "#555",
    textAlign: "center",
  },
});

const pct = (width) => ({ width: `${width}%` });

// Convert Prisma Decimal values (returned through the API)
// into safe numbers for display.
const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const fmt = (value, decimals = 0) => {
  const number = toNumber(value);

  if (number === null) return "—";

  return number.toLocaleString("en-PH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Map the actual Lot and LotQuotation data to the PDF rows.
export const mapLotsForPDF = (lots = []) => {
  return [...lots]
    .sort((a, b) =>
      String(a.lotNumber ?? "").localeCompare(
        String(b.lotNumber ?? ""),
        undefined,
        { numeric: true, sensitivity: "base" },
      ),
    )
    .map((lot) => {
      const quotations = [...(lot.quotations ?? [])].sort(
        (a, b) =>
          (toNumber(a.floorAreaSqm) ?? 0) - (toNumber(b.floorAreaSqm) ?? 0),
      );

      return {
        id: lot.id,
        lot: /^lot\b/i.test(String(lot.lotNumber))
          ? String(lot.lotNumber)
          : `LOT ${lot.lotNumber ?? ""}`,
        lotArea: toNumber(lot.lotAreaSqm),

        rows: quotations.map((quotation) => [
          toNumber(quotation.floorAreaSqm),
          toNumber(quotation.totalContractPrice),
          toNumber(quotation.downpayment),
          toNumber(quotation.balance),
          toNumber(quotation.monthlyAmortization10Years),
          toNumber(quotation.monthlyAmortization15Years),
          toNumber(quotation.monthlyAmortization20Years),
          toNumber(quotation.monthlyAmortization25Years),
        ]),
      };
    });
};

// Table header
const Header = () => (
  <View style={s.headRow} wrap={false}>
    <View style={[s.headCell, pct(W.lot)]}>
      <Text style={s.headText}>LOT NO.</Text>
    </View>

    <View style={[s.headCell, pct(W.lotArea)]}>
      <Text style={s.headText}>LOT AREA (sqm)</Text>
    </View>

    <View style={[s.headCell, pct(W.floor)]}>
      <Text style={s.headText}>FLOOR AREA (sqm)</Text>
    </View>

    <View style={[s.headCell, pct(W.tcp)]}>
      <Text style={s.headText}>TOTAL CONTRACT PRICE (PHP)</Text>
    </View>

    <View style={[s.headCell, pct(W.dp)]}>
      <Text style={s.headText}>DOWN PAYMENT</Text>
    </View>

    <View style={[s.headCell, pct(W.bal)]}>
      <Text style={s.headText}>BALANCE</Text>
    </View>

    <View style={[s.amortSpan, pct(W.y10 + W.y15 + W.y20 + W.y25)]}>
      <Text style={s.amortTitle}>
        Estimated Monthly Amortization computed at 6.5% annual interest
      </Text>

      <View style={s.amortYears}>
        {["10 years", "15 years", "20 years", "25 years"].map((year, index) => (
          <View
            key={year}
            style={[s.yearCell, index === 3 ? { borderRightWidth: 0 } : null]}
          >
            <Text style={s.headText}>{year}</Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);

// One lot block containing its quotation rows
const LotBlock = ({ data, color }) => {
  const rows =
    data.rows.length > 0
      ? data.rows
      : [[null, null, null, null, null, null, null, null]];

  return (
    <View style={[s.row, { backgroundColor: color }]} wrap={false}>
      <View style={[s.cell, pct(W.lot)]}>
        <Text style={s.lotText}>{data.lot}</Text>
      </View>

      <View style={[s.cell, pct(W.lotArea)]}>
        <Text style={s.lotText}>{fmt(data.lotArea, 2)}</Text>
      </View>

      <View
        style={{
          width: `${100 - W.lot - W.lotArea}%`,
        }}
      >
        {rows.map((row, index) => (
          <View key={index} style={s.row}>
            {[
              [row[0], (W.floor / (100 - W.lot - W.lotArea)) * 100, 2],
              [row[1], (W.tcp / (100 - W.lot - W.lotArea)) * 100, 2],
              [row[2], (W.dp / (100 - W.lot - W.lotArea)) * 100, 2],
              [row[3], (W.bal / (100 - W.lot - W.lotArea)) * 100, 2],
              [row[4], (W.y10 / (100 - W.lot - W.lotArea)) * 100, 2],
              [row[5], (W.y15 / (100 - W.lot - W.lotArea)) * 100, 2],
              [row[6], (W.y20 / (100 - W.lot - W.lotArea)) * 100, 2],
              [row[7], (W.y25 / (100 - W.lot - W.lotArea)) * 100, 2],
            ].map(([value, width, decimals], columnIndex) => (
              <View key={columnIndex} style={[s.cell, { width: `${width}%` }]}>
                <Text style={s.cellText}>{fmt(value, decimals)}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

// Main PDF document
export const PriceListDocument = ({
  lots = [],
  projectName = "HOUSE AND LOT PACKAGE",
  location = "GULF VIEW HORIZON SUBDIVISION SUELLO VILLAGE BAGUIO CITY",
  asOfDate = new Date(),
}) => {
  const pdfLots = mapLotsForPDF(lots);

  const dateText =
    asOfDate instanceof Date
      ? asOfDate.toLocaleDateString("en-PH", {
          month: "long",
          year: "numeric",
        })
      : asOfDate;

  return (
    <Document title={`${projectName} - Price List`}>
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.titleBar}>
          <Text style={s.title}>ESTATE SITE PROPERTIES INC.</Text>
        </View>

        <View style={s.subBar}>
          <Text style={s.sub}>{projectName}</Text>
          <Text style={s.sub}>{location}</Text>
        </View>

        <Text style={s.asOf}>AS OF {String(dateText).toUpperCase()}</Text>

        <Header />

        {pdfLots.map((lot, index) => (
          <LotBlock
            key={lot.id ?? `${lot.lot}-${index}`}
            data={lot}
            color={index % 2 === 0 ? GREEN : ORANGE}
          />
        ))}

        {pdfLots.length === 0 && (
          <View style={[s.row, s.cell]}>
            <Text style={s.cellText}>No lots were found for this project.</Text>
          </View>
        )}

        <Text style={s.footer}>
          Prices and amortization figures are estimates and subject to change
          without prior notice.
        </Text>
      </Page>
    </Document>
  );
};

// Browser preview
export const PriceListPreview = (props) => (
  <PDFViewer style={{ width: "100%", height: "100vh" }}>
    <PriceListDocument {...props} />
  </PDFViewer>
);

// PDF download button
export const PriceListDownload = ({
  lots = [],
  projectName,
  location,
  asOfDate = new Date(),
}) => (
  <PDFDownloadLink
    document={
      <PriceListDocument
        lots={lots}
        projectName={projectName}
        location={location}
        asOfDate={asOfDate}
      />
    }
    fileName="gulf-view-horizon-price-list.pdf"
  >
    {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
  </PDFDownloadLink>
);

export default PriceListPreview;
