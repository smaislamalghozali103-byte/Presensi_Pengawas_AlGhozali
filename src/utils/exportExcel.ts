import { RekapItem } from '../types';

/**
 * Clean and escape XML characters for Excel XML 2003 format
 */
function escapeXml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface ExportExcelOptions {
  fileName?: string;
  sheetName?: string;
  title?: string;
  subtitle?: string;
  generatedBy?: string;
}

/**
 * Generates and triggers download of a genuine styled Microsoft Excel file (.xls, XML Spreadsheet 2003).
 * Opens immediately in Microsoft Excel, Google Sheets, LibreOffice, and WPS Office without corrupted file warnings.
 */
export function exportRekapToExcel(data: RekapItem[], options: ExportExcelOptions = {}) {
  const {
    fileName = `Rekap_Presensi_Pengawas_${new Date().toISOString().slice(0, 10)}.xls`,
    sheetName = 'Rekap Kehadiran',
    title = 'REKAPITULASI PRESENSI PENGAWAS UJIAN',
    subtitle = 'YPI PONDOK MODERN AL-GHOZALI - ASTS GANJIL 2026/2027',
    generatedBy = 'Sistem Presensi Pengawas Al-Ghozali',
  } = options;

  const now = new Date();
  const printDate = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Jakarta',
  }).format(now);

  // Calculate totals
  let totalMengawas = 0;
  let totalHadir = 0;
  let totalIzin = 0;
  let totalSakit = 0;
  let totalAlpa = 0;
  let totalDigantikan = 0;

  data.forEach((row) => {
    totalMengawas += Number(row['JUMLAH MENGAWAS'] || 0);
    totalHadir += Number(row.HADIR || 0);
    totalIzin += Number(row.IZIN || 0);
    totalSakit += Number(row.SAKIT || 0);
    totalAlpa += Number(row.ALPA || 0);
    totalDigantikan += Number(row.DIGANTIKAN || 0);
  });

  const totalPersentaseHadir =
    totalMengawas > 0 ? Math.round((totalHadir / totalMengawas) * 100) : 0;

  // Build Excel XML Spreadsheet 2003
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>${escapeXml(generatedBy)}</Author>
  <Created>${now.toISOString()}</Created>
  <Company>YPI Al-Ghozali</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1F2937"/>
  </Style>
  <Style ss:ID="HeaderTitle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#047857"/>
  </Style>
  <Style ss:ID="HeaderSubtitle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#374151"/>
  </Style>
  <Style ss:ID="HeaderMeta">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Italic="1" ss:Color="#6B7280"/>
  </Style>
  <Style ss:ID="ColHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#047857" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ColHeaderHadir">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#059669" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ColHeaderIzin">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ColHeaderSakit">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#D97706" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ColHeaderAlpa">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#E11D48" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ColHeaderDigantikan">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#7C3AED" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="RowNo">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#6B7280"/>
  </Style>
  <Style ss:ID="RowNama">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#111827"/>
  </Style>
  <Style ss:ID="RowUnit">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#374151"/>
  </Style>
  <Style ss:ID="RowNumberCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#111827"/>
  </Style>
  <Style ss:ID="RowHadir">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="RowIzin">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#1D4ED8"/>
  </Style>
  <Style ss:ID="RowSakit">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#B45309"/>
  </Style>
  <Style ss:ID="RowAlpa">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#BE123C"/>
  </Style>
  <Style ss:ID="RowDigantikan">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#6D28D9"/>
  </Style>
  <Style ss:ID="RowTotalLabel">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="RowTotalVal">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#111827"/>
   <Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="RowTotalHadir">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table ss:ExpandedColumnCount="9" x:FullColumns="1" x:FullRows="1">
   <!-- Column Widths -->
   <Column ss:Index="1" ss:AutoFitWidth="0" ss:Width="40"/>
   <Column ss:Index="2" ss:AutoFitWidth="0" ss:Width="220"/>
   <Column ss:Index="3" ss:AutoFitWidth="0" ss:Width="65"/>
   <Column ss:Index="4" ss:AutoFitWidth="0" ss:Width="100"/>
   <Column ss:Index="5" ss:AutoFitWidth="0" ss:Width="70"/>
   <Column ss:Index="6" ss:AutoFitWidth="0" ss:Width="65"/>
   <Column ss:Index="7" ss:AutoFitWidth="0" ss:Width="65"/>
   <Column ss:Index="8" ss:AutoFitWidth="0" ss:Width="65"/>
   <Column ss:Index="9" ss:AutoFitWidth="0" ss:Width="85"/>

   <!-- Header Title -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="8" ss:StyleID="HeaderTitle">
     <Data ss:Type="String">${escapeXml(title)}</Data>
    </Cell>
   </Row>

   <!-- Header Subtitle -->
   <Row ss:Height="20">
    <Cell ss:MergeAcross="8" ss:StyleID="HeaderSubtitle">
     <Data ss:Type="String">${escapeXml(subtitle)}</Data>
    </Cell>
   </Row>

   <!-- Meta timestamp -->
   <Row ss:Height="16">
    <Cell ss:MergeAcross="8" ss:StyleID="HeaderMeta">
     <Data ss:Type="String">Dicetak pada: ${escapeXml(printDate)} | Sumber: ${escapeXml(generatedBy)}</Data>
    </Cell>
   </Row>

   <!-- Spacer -->
   <Row ss:Height="8"/>

   <!-- Table Headers -->
   <Row ss:Height="24">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">NO</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">NAMA PENGAWAS</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">UNIT</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">JML MENGAWAS</Data></Cell>
    <Cell ss:StyleID="ColHeaderHadir"><Data ss:Type="String">HADIR</Data></Cell>
    <Cell ss:StyleID="ColHeaderIzin"><Data ss:Type="String">IZIN</Data></Cell>
    <Cell ss:StyleID="ColHeaderSakit"><Data ss:Type="String">SAKIT</Data></Cell>
    <Cell ss:StyleID="ColHeaderAlpa"><Data ss:Type="String">ALPA</Data></Cell>
    <Cell ss:StyleID="ColHeaderDigantikan"><Data ss:Type="String">DIGANTIKAN</Data></Cell>
   </Row>
`;

  // Data Rows
  data.forEach((row, index) => {
    xml += `   <Row ss:Height="20">
    <Cell ss:StyleID="RowNo"><Data ss:Type="Number">${index + 1}</Data></Cell>
    <Cell ss:StyleID="RowNama"><Data ss:Type="String">${escapeXml(row['NAMA PENGAWAS'])}</Data></Cell>
    <Cell ss:StyleID="RowUnit"><Data ss:Type="String">${escapeXml(row.UNIT)}</Data></Cell>
    <Cell ss:StyleID="RowNumberCenter"><Data ss:Type="Number">${Number(row['JUMLAH MENGAWAS'] || 0)}</Data></Cell>
    <Cell ss:StyleID="RowHadir"><Data ss:Type="Number">${Number(row.HADIR || 0)}</Data></Cell>
    <Cell ss:StyleID="RowIzin"><Data ss:Type="Number">${Number(row.IZIN || 0)}</Data></Cell>
    <Cell ss:StyleID="RowSakit"><Data ss:Type="Number">${Number(row.SAKIT || 0)}</Data></Cell>
    <Cell ss:StyleID="RowAlpa"><Data ss:Type="Number">${Number(row.ALPA || 0)}</Data></Cell>
    <Cell ss:StyleID="RowDigantikan"><Data ss:Type="Number">${Number(row.DIGANTIKAN || 0)}</Data></Cell>
   </Row>
`;
  });

  // Summary Row (TOTAL)
  xml += `   <Row ss:Height="22">
    <Cell ss:MergeAcross="2" ss:StyleID="RowTotalLabel"><Data ss:Type="String">TOTAL KESELURUHAN</Data></Cell>
    <Cell ss:StyleID="RowTotalVal"><Data ss:Type="Number">${totalMengawas}</Data></Cell>
    <Cell ss:StyleID="RowTotalHadir"><Data ss:Type="Number">${totalHadir}</Data></Cell>
    <Cell ss:StyleID="RowTotalVal"><Data ss:Type="Number">${totalIzin}</Data></Cell>
    <Cell ss:StyleID="RowTotalVal"><Data ss:Type="Number">${totalSakit}</Data></Cell>
    <Cell ss:StyleID="RowTotalVal"><Data ss:Type="Number">${totalAlpa}</Data></Cell>
    <Cell ss:StyleID="RowTotalVal"><Data ss:Type="Number">${totalDigantikan}</Data></Cell>
   </Row>
   <!-- Summary percentage -->
   <Row ss:Height="18">
    <Cell ss:MergeAcross="8" ss:StyleID="HeaderMeta">
     <Data ss:Type="String">* Tingkat kehadiran kumulatif saat ini: ${totalPersentaseHadir}% (${totalHadir} hadir dari total ${totalMengawas} jadwal pengawasan).</Data>
    </Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  // Create downloadable blob
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.xls') ? fileName : `${fileName}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
