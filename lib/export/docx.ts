import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx"
import { AssignmentWithRelations, FormCategory, StudentWithVulns } from "../types"
import { SCHOOL_INFO } from "../store"

export async function generateDocxForAssignment(
  assignment: AssignmentWithRelations,
  categories: FormCategory[],
  students: StudentWithVulns[]
): Promise<Blob> {
  const visibleCategories = categories.filter((c) => c.visible).sort((a, b) => a.position - b.position)

  // Header paragraphs
  const titleHeader = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "CENTRUL JUDEŢEAN DE RESURSE ŞI ASISTENŢĂ EDUCAŢIONALĂ",
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Bistriţa-Năsăud",
          bold: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Municipiul Bistrița | Telefon: 0757996394 | e-mail: cjraebn@cjraebistrita.ro | http://www.cjraebistrita.ro/",
          size: 16,
          italics: true,
        }),
      ],
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [
        new TextRun({ text: "UNITATEA DE ÎNVĂŢĂMÂNT: ", bold: true, size: 20 }),
        new TextRun({ text: SCHOOL_INFO.unitate.toUpperCase(), size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "CABINET ȘCOLAR DE ASISTENȚĂ PSIHOPEDAGOGICĂ: ", bold: true, size: 20 }),
        new TextRun({ text: SCHOOL_INFO.cabinet.toUpperCase(), size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "PROFESOR CONSILIER ȘCOLAR: ", bold: true, size: 20 }),
        new TextRun({ text: SCHOOL_INFO.consilier, size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "DIRIGINTE/ÎNVĂȚĂTOR/EDUCATOR: ", bold: true, size: 20 }),
        new TextRun({ text: assignment.teacher.full_name, size: 20 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "CLASA/GRUPA: ", bold: true, size: 20 }),
        new TextRun({ text: `${assignment.class.name}    `, size: 20 }),
        new TextRun({ text: "NR. TOTAL ELEVI: ", bold: true, size: 20 }),
        new TextRun({ text: `${assignment.class.total_students}`, size: 20 }),
      ],
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `FIȘĂ DE IDENTIFICARE A ELEVILOR DIN CATEGORII VULNERABILE\nAn școlar ${SCHOOL_INFO.anScolar}`,
          bold: true,
          size: 24,
        }),
      ],
    }),
    new Paragraph({ text: "" }),
  ]

  // Table Headers
  const tableHeaderCells = [
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: "Nr.", bold: true, size: 16 })] })],
      width: { size: 5, type: WidthType.PERCENTAGE },
    }),
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: "Numele și prenumele elevului", bold: true, size: 16 })] })],
      width: { size: 25, type: WidthType.PERCENTAGE },
    }),
    ...visibleCategories.map(
      (cat) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: cat.label, bold: true, size: 14 })] })],
          width: { size: 55 / visibleCategories.length, type: WidthType.PERCENTAGE },
        })
    ),
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: "Observații / Detalii", bold: true, size: 14 })] })],
      width: { size: 15, type: WidthType.PERCENTAGE },
    }),
  ]

  const tableRows: TableRow[] = [
    new TableRow({
      children: tableHeaderCells,
      tableHeader: true,
    }),
  ]

  // Add rows for students or blank rows if empty
  const displayStudents = students.length > 0 ? students : Array.from({ length: 5 }, (_, i) => ({
    id: `empty-${i}`,
    assignment_id: assignment.id,
    position: i + 1,
    full_name: "",
    general_notes: "",
    created_at: new Date().toISOString(),
    vulnerabilities: [],
  }))

  displayStudents.forEach((student, index) => {
    const rowCells = [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: `${index + 1}`, size: 16 })] })],
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: student.full_name || "", size: 16 })] })],
      }),
      ...visibleCategories.map((cat) => {
        const vuln = student.vulnerabilities.find((v) => v.category_id === cat.id)
        let cellText = ""
        if (vuln && vuln.checked) {
          cellText = "✓" + (vuln.notes ? ` (${vuln.notes})` : "")
        }
        return new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: cellText, size: 14 })] })],
        })
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: student.general_notes || "", size: 14 })] })],
      }),
    ]
    tableRows.push(new TableRow({ children: rowCells }))
  })

  const mainTable = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    },
  })

  // Footer / Signatures
  const footerParagraphs = [
    new Paragraph({ text: "" }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [
        new TextRun({ text: "Numele și prenumele cadrului didactic: ", bold: true, size: 18 }),
        new TextRun({ text: assignment.teacher.full_name, size: 18 }),
        new TextRun({ text: "             Semnătura: ....................................", size: 18 }),
      ],
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [
        new TextRun({ text: "Profesor consilier școlar: ", bold: true, size: 18 }),
        new TextRun({ text: SCHOOL_INFO.consilier, size: 18 }),
        new TextRun({ text: "                          Semnătura: ....................................", size: 18 }),
      ],
    }),
  ]

  const doc = new Document({
    sections: [
      {
        children: [...titleHeader, mainTable, ...footerParagraphs],
      },
    ],
  })

  return await Packer.toBlob(doc)
}
