import { Button } from "@mantine/core";
import {
  Document,
  Header,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  Table,
  TableCell,
  TableRow,
  TextRun,
} from "docx";
import { type RouterOutputs, api } from "~/utils/api";

export default function Export() {
  const { data: appointments } = api.appointment.byPlan.useQuery({
    planId: "clgxjn6wa0001vq7ojeahqcfd",
  });

  const createTableRow = (
    appointment: RouterOutputs["appointment"]["byPlan"][number]
  ) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              text: `${appointment.start
                .getDate()
                .toString()
                .padStart(2, "0")}.${(appointment.start.getMonth() + 1)
                .toString()
                .padStart(2, "0")}.`,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text:
                appointment.type === "lesson"
                  ? appointment.data.topic.name ?? ""
                  : appointment.data.name,
              heading: HeadingLevel.HEADING_4,
            }),
            new Paragraph({
              text:
                appointment.type === "lesson"
                  ? ""
                  : appointment.data.description,
            }),
          ],
        }),
      ],
    });
  };

  const twoSplitParagraphs = (left: string, right: string) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: left + "\t" + right,
          font: "Arial",
        }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    });
  };

  const newLine = () => {
    return new Paragraph({
      children: [], // Just newline without text
    });
  };

  const paragraphWithText = (text: string) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          font: "Arial",
        }),
      ],
    });
  };

  const generateHeader = (subject: string) => {
    return new Header({
      children: [
        twoSplitParagraphs("Klasse: BM1.2019.I2B", "BMS gibb"),
        twoSplitParagraphs("Fach: " + subject, "Zimmer: LH 102"),
        twoSplitParagraphs("Zeit: Di, 8:15 - 9:45", "Lehrperson: Nadja Burri"),
        newLine(),
      ],
    });
  };

  const handleDownload = async () => {
    const subject = ((appointments?.find((x) => x.type === "lesson") as any)
      ?.data.subject.name ?? "Unknown") as string;

    const doc = new Document({
      sections: [
        {
          headers: {
            default: generateHeader(subject),
          },
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Herbstsemester 2022 ",
                  bold: true,
                  size: 28,
                  font: "Arial",
                }),
                new TextRun({
                  text: "(Änderungen vorbehalten)",
                  size: 16,
                  bold: true,
                  font: "Arial",
                }),
              ],
            }),
            new Table({
              rows: appointments?.map(createTableRow) ?? [],
            }),
          ],
        },
      ],
    });
    await Packer.toBlob(doc).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  return <Button onClick={() => void handleDownload()}>Download</Button>;
}
