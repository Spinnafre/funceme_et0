import { ftpConfig, funcemeFtpDirectories } from "../config/config.js";
import { DateFormatter } from "../core/date-formatter.js";
import { CalcEto } from "../core/et0.js";
import {
  MeasurementsMapper,
  PluviometerWithMeasurementsMapper,
  StationWithMeasurementsMapper,
} from "../core/mappers/index.js";

import { PluviometerParser, StationParser } from "../core/parser/index.js"
import { convertCompressedFileStream } from "../infra/unzip/untar-adapter.js";
import { extractEquipmentCode } from "../utils/file.js";

export class FetchFuncemeEquipments {
  #ftpClient;

  constructor(ftpClientAdapter) {
    this.#ftpClient = ftpClientAdapter;

  }

  async getLastUpdatedFileName(folder) {
    // Make sure that it finds the most recent folder
    const currentYear = new Date().getFullYear();

    const filesDescriptionsFromFolder =
      await this.#ftpClient.getFolderContentDescription(folder);

    if (filesDescriptionsFromFolder.length === 0) {
      return null;
    }

    // Get the folder that contain the current date
    const fileDescription = filesDescriptionsFromFolder.filter((file) => {
      return file.name.includes(currentYear);
    });

    if (fileDescription.length === 0) {
      return null;
    }

    const { name } = fileDescription[0];

    return name;
  }

  async getFiles(folder) {
    const fileName = await this.getLastUpdatedFileName(folder);

    if (!fileName) {
      return null;
    }

    const compressedStreamOfFiles = await this.#ftpClient.getFile(
      folder,
      fileName
    );

    const files = await convertCompressedFileStream(compressedStreamOfFiles);

    if (files.length) {
      return files;
    }

    console.error(`Não foi possível encontrar arquivos no diretório ${folder}`);

    return null;
  }

  async execute() {
    try {

      await this.#ftpClient.connect({
        host: ftpConfig.host,
        user: ftpConfig.user,
        password: ftpConfig.password,
      });

      // IDEA: Add timeout?
      const [stationLists, pluviometerList] = await Promise.all([
        this.getFiles(funcemeFtpDirectories.directories.station.folder),
        this.getFiles(funcemeFtpDirectories.directories.pluviometer.folder),
      ]);

      const yesterDayDate = DateFormatter.formatByDateSeparator(DateFormatter.getPreviousDate(new Date(), 1), {
        separator: "-",
      })

      const [parsedStations, parsedPluviometers] = [
        await StationParser.parse(
          stationLists,
          getLastStationMeasurements(
            yesterDayDate,
          ),
          StationWithMeasurementsMapper.toDomain
        ),
        await PluviometerParser.parse(
          pluviometerList,
          getLastPluviometerMeasurements(
            yesterDayDate,
          ),
          PluviometerWithMeasurementsMapper.toDomain
        ),
      ];

      // QUESTION: If throw error but connection still alive?
      await this.#ftpClient.close();

      parsedStations.forEach((item) => {
        item.Et0 = CalcEto({
          date: new Date(item.Measurements.Time),
          location: {
            altitude: item.Altitude,
            latitude: item.Location.Latitude,
            longitude: item.Location.Longitude,
          },
          measures: {
            atmosphericPressure: item.Measurements.AtmosphericPressure,
            averageAtmosphericTemperature:
              item.Measurements.AverageAtmosphericTemperature,
            averageRelativeHumidity: item.Measurements.AverageRelativeHumidity,
            maxAtmosphericTemperature: item.Measurements.MaxAtmosphericTemperature,
            maxRelativeHumidity: item.Measurements.MaxRelativeHumidity,
            minAtmosphericTemperature: item.Measurements.MinAtmosphericTemperature,
            minRelativeHumidity: item.Measurements.MinRelativeHumidity,
            totalRadiation: item.Measurements.TotalRadiation,
            windVelocity: item.Measurements.WindVelocity,
          },
        });
      });

      const stationsMeasurements = MeasurementsMapper.ToPersistency(
        parsedStations
      );

      const pluviometersMeasurements = MeasurementsMapper.ToPersistency(
        parsedPluviometers
      );


    } catch (error) {
      console.error(error);

      // TODO: detect when has a connection error
      if (error) {
        await this.#ftpClient.close();
      }

      throw new Error(error.message)
    }
  }
}

// Maybe should be a Util
function getLastStationMeasurements(date) {
  return function (list) {
    const eqps = [];

    // TO-DO: add mapper
    list.forEach((data) => {
      const measure = data.Measurements.find((measure) => measure.data == date);
      if (measure) {
        // TO-DO: Add mapper to tomain
        eqps.push({
          Code: data.Code,
          Name: data.Name,
          Latitude: data.Latitude,
          Altitude: data.Altitude,
          Longitude: data.Longitude,
          Measurements: measure,
        });
      }
    });

    return eqps;
  };
}
function getLastPluviometerMeasurements(date) {
  return function (list) {
    const eqps = [];

    // TO-DO: add mapper
    list.forEach((data) => {
      const measure = data.Measurements.find((measure) => measure.data == date);
      if (measure) {
        // TO-DO: Add mapper to tomain
        eqps.push({
          Code: extractEquipmentCode(data.File),
          Name: data.Name,
          Latitude: data.Latitude,
          Altitude: data.Altitude,
          Longitude: data.Longitude,
          Measurements: measure,
        });
      }
    });

    return eqps;
  };
}


