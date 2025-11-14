import { CsvParser } from "./contracts/csv-parser.js";

export class StationParser extends CsvParser {
  constructor() {
    super();
  }
  getMetadata(string) {
    const [code, name, longitude, latitude, altitude] = string
      .slice(0, 5)
      .map((data) => data.split(":")[1]);

    const Altitude = altitude?.trim();
    const Longitude = longitude?.trim();
    const Latitude = latitude?.trim();

    return {
      code: code?.trim(),
      name: name?.trim(),
      latitude: Latitude === "nan" ? null : Latitude,
      altitude: Altitude === "nan" ? null : Altitude,
      longitude: Longitude === "nan" ? null : Longitude,
    };
  }

  splitMeasures(string) {
    return string.slice(5).join("\n");
  }

  static async parse(rawData = [], filter, mapper) {
    const parser = new StationParser();

    if (rawData && rawData.length) {
      const raw = await parser.parse(rawData);
      return filter(raw).map(mapper);
    }

    return [];
  }
}
export class PluviometerParser extends CsvParser {
  constructor() {
    super();
  }
  getMetadata(string) {
    const [name, longitude, latitude, altitude] = string
      .slice(0, 4)
      .map((data) => data.split(":")[1]);

    const Altitude = altitude?.trim();
    const Longitude = longitude?.trim();
    const Latitude = latitude?.trim();

    return {
      name: name?.trim(),
      latitude: Latitude === "nan" ? null : Latitude,
      altitude: Altitude === "nan" ? null : Altitude,
      longitude: Longitude === "nan" ? null : Longitude,
    };
  }

  splitMeasures(string) {
    return string.slice(4).join("\n");
  }

  static async parse(rawData = [], filter, mapper) {
    const parser = new PluviometerParser();

    if (rawData && rawData.length) {
      const raw = await parser.parse(rawData);
      return filter(raw).map(mapper);
    }

    return [];
  }
}
