import { parseCsvStringToJson } from "../../../infra/csvparser/csv-parser-adapter.js"

export class CsvParser {
  splitMeasures(string) {
    throw new Error("Not implemented");
  }

  getMetadata(string) {
    throw new Error("Not implemented");
  }

  async parse(rawData = []) {
    const parsed = [];

    for (const { fileName, string } of rawData) {
      const data = string.trim().split("\n");

      const metadata = this.getMetadata(data);

      const measuresRaw = this.splitMeasures(data);

      const measures = await parseCsvStringToJson(",", measuresRaw);

      parsed.push({
        ...metadata,
        file: fileName,
        measurements: measures,
      });
    }

    return parsed;
  }
}
