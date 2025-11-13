import { ftpConfig, funcemeFtpDirectories } from "../config/config.js";
import { DateFormatter } from "../core/date-formatter.js";
import { CalcEto } from "../core/et0.js";
import {
  MeasurementsMapper,
  PluviometerWithMeasurementsMapper,
  StationWithMeasurementsMapper,
} from "../core/mappers/index.js";

import { EquipmentParser } from "../core/parser/index.js"
import { convertCompressedFileStream } from "../infra/unzip/untar-adapter.js";

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
        await EquipmentParser.parse(
          stationLists,
          getLastMeasurements(
            yesterDayDate,
          ),
          StationWithMeasurementsMapper.toDomain
        ),
        await EquipmentParser.parse(
          pluviometerList,
          getLastMeasurements(
            yesterDayDate,
          ),
          PluviometerWithMeasurementsMapper.toDomain
        ),
      ];

      // QUESTION: If throw error but connection still alive?
      await this.#ftpClient.close();

      parsedStations.forEach((item) => {
        item.Et0 = CalcEto({
          date: new Date(item.Time),
          location: {
            altitude: item.Altitude,
            latitude: item.Latitude,
            longitude: item.Longitude,
          },
          measures: {
            atmosphericPressure: item.AtmosphericPressure,
            averageAtmosphericTemperature:
              item.AverageAtmosphericTemperature,
            averageRelativeHumidity: item.AverageRelativeHumidity,
            maxAtmosphericTemperature: item.MaxAtmosphericTemperature,
            maxRelativeHumidity: item.MaxRelativeHumidity,
            minAtmosphericTemperature: item.MinAtmosphericTemperature,
            minRelativeHumidity: item.MinRelativeHumidity,
            totalRadiation: item.TotalRadiation,
            windVelocity: item.WindVelocity,
          },
        });
        console.log(item.Et0);
      });

      const stationsMeasurements = MeasurementsMapper.ToPersistency(
        parsedStations
      );

      // console.log(stationsMeasurements);

      const pluviometersMeasurements = MeasurementsMapper.ToPersistency(
        parsedPluviometers
      );

      console.log(pluviometersMeasurements);


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
function getLastMeasurements(date) {
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
