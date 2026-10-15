import { describe, expect, it } from "vitest";
import * as xlsx from "xlsx";
import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { createFactoringConsolidadoXlsx, consolidadoColumns } from "#src/utils/factoringConsolidadoXlsx.js";

describe("Consolidado XLSX de factoring", () => {
  it("conserva 51 columnas, duplicados, fechas civiles y tipos sin ejecutar fórmulas", () => {
    const result = createFactoringConsolidadoXlsx(
      [
        {
          c0: "IT-1",
          c1: "2026-10-14",
          c4: "00123456789",
          c5: "=HYPERLINK(1)",
          c10: "000239",
          c11: new Prisma.Decimal("55484.49"),
          c13: "2026-10-30",
          c15: new Prisma.Decimal("1.90000"),
          c18: 0,
          c27: null,
          c29: new Prisma.Decimal("55484.49"),
          c31: 0,
        },
      ],
      new Date("2026-10-15T04:59:00Z"),
    );
    expect(result.nameFile).toBe("Consolidado de Operaciones de Factoring (20261014_2359).xlsx");
    const workbook = xlsx.read(result.file, { type: "buffer", cellNF: true });
    const sheet = workbook.Sheets.Hoja1;
    const data = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null });
    expect(data[0]).toEqual(consolidadoColumns.map((c) => c.header));
    expect(data[0]).toHaveLength(51);
    expect(data[0][11]).toBe(data[0][29]);
    expect(data[0][18]).toBe(data[0][31]);
    expect(sheet.E2).toMatchObject({ t: "s", v: "00123456789" });
    expect(sheet.K2).toMatchObject({ t: "s", v: "000239" });
    expect(sheet.F2.f).toBeUndefined();
    expect(sheet.L2).toMatchObject({ t: "n", v: 55484.49 });
    expect(sheet.S2).toMatchObject({ t: "n", v: 0 });
    expect(sheet.B2).toMatchObject({ t: "n", z: "dd/mm/yyyy" });
    expect(xlsx.SSF.format("yyyy-mm-dd", sheet.B2.v)).toBe("2026-10-14");
    expect(data[1][27]).toBeNull();
    expect(sheet["!autofilter"]?.ref).toBe("A1:AY2");
  });
  it("genera encabezados sin registros y cambia de día a medianoche Lima", () => {
    const { file, nameFile } = createFactoringConsolidadoXlsx([], new Date("2026-10-15T05:00:00Z"));
    expect(nameFile).toContain("(20261015_0000)");
    const sheet = xlsx.read(file).Sheets.Hoja1;
    expect(sheet["!ref"]).toBe("A1:AY1");
  });
  it("rechaza fechas e importes inválidos en vez de emitir celdas incorrectas", () => {
    expect(() => createFactoringConsolidadoXlsx([{ c1: "incorrecta" }])).toThrow("Fecha inválida");
    expect(() => createFactoringConsolidadoXlsx([{ c11: "NaN" }])).toThrow("Importe inválido");
  });
});
