import { ftpConfig, funcemeFtpDirectories } from "../config/config.js";
import { DateFormatter } from "../core/date-formatter.js";
import {
  PluviometerWithMeasurementsMapper,
  StationWithMeasurementsMapper,
} from "../core/mappers/index.js";

import { PluviometerParser, StationParser } from "../core/parser/index.js"
import { convertCompressedFileStream } from "../infra/unzip/untar-adapter.js";
import { extractEquipmentCode } from "../utils/file.js";

export class FetchFuncemeEquipments {
  #ftpClient;
  #repository;

  constructor(ftpClientAdapter, repository) {
    this.#ftpClient = ftpClientAdapter;
    this.#repository = repository;
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
          )
        ),
        await PluviometerParser.parse(
          pluviometerList,
          getLastPluviometerMeasurements(
            yesterDayDate,
          ),
        ),
      ];

      // QUESTION: If throw error but connection still alive?
      await this.#ftpClient.close();

      const eqp_codes = [...parsedStations, ...parsedPluviometers]
        .map((measurement) => measurement.code)

      const registeredEquipmentsMap = await this.#repository.findByExternalIds(eqp_codes)

      const stationMeasurements = parsedStations.map((measurements) => {
        const registeredEquipment = registeredEquipmentsMap.get(measurements.code)
        if (registeredEquipment) {
          measurements.id_equipment = registeredEquipment.id_equipment
        }
        return StationWithMeasurementsMapper.ToPersistency(measurements)
      })

      const pluviometerMeasurements = parsedPluviometers.map((measurements) => {
        const registeredEquipment = registeredEquipmentsMap.get(measurements.code)
        if (registeredEquipment) {
          measurements.id_equipment = registeredEquipment.id_equipment
        }
        return PluviometerWithMeasurementsMapper.ToPersistency(measurements)
      })

      const measurements = [...stationMeasurements, ...pluviometerMeasurements]


      await this.#repository.insertMany(measurements)


    } catch (error) {

      // TODO: detect when has a connection error
      await this.#ftpClient.close();

      throw error
    }
  }
}

// Maybe should be a Util
function getLastStationMeasurements(date) {
  return function (list) {
    const eqps = [];

    // TO-DO: add mapper
    list.forEach((data) => {
      const measure = data.measurements.find((measure) => measure.data == date);
      if (measure) {
        // TO-DO: Add mapper to tomain
        eqps.push({
          code: data.code,
          name: data.name,
          latitude: data.latitude,
          altitude: data.altitude,
          longitude: data.longitude,
          measurements: measure,
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
      const measure = data.measurements.find((measure) => measure.data == date);
      if (measure) {
        // TO-DO: Add mapper to tomain
        eqps.push({
          code: extractEquipmentCode(data.file),
          name: data.name,
          latitude: data.latitude,
          altitude: data.altitude,
          longitude: data.longitude,
          measurements: measure,
        });
      }
    });

    return eqps;
  };
}


