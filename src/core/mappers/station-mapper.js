function parseMeasure(measure) {
  return parseFloat(measure) || null;
}

import { CalcEto } from "../et0.js";
export class StationWithMeasurementsMapper {
  static ToPersistency(station) {
    const [
      time,
      averageAtmosphericTemperature,
      maxAtmosphericTemperature,
      minAtmosphericTemperature,
      averageRelativeHumidity,
      maxRelativeHumidity,
      minRelativeHumidity,
      atmosphericPressure,
      windVelocity,
      totalRadiation,
    ] = Object.values(station.measurements);

    const Et0 = CalcEto({
      date: new Date(time),
      location: {
        altitude: station.altitude,
        latitude: station.latitude,
        longitude: station.longitude,
      },
      measures: {
        atmosphericPressure: parseMeasure(atmosphericPressure),
        averageAtmosphericTemperature:
          parseMeasure(averageAtmosphericTemperature),
        averageRelativeHumidity: parseMeasure(averageRelativeHumidity),
        maxAtmosphericTemperature: parseMeasure(maxAtmosphericTemperature),
        maxRelativeHumidity: parseMeasure(maxRelativeHumidity),
        minAtmosphericTemperature: parseMeasure(minAtmosphericTemperature),
        minRelativeHumidity: parseMeasure(minRelativeHumidity),
        totalRadiation: parseMeasure(totalRadiation),
        windVelocity: parseMeasure(windVelocity),
      },
    })

    return {
      time,
      fk_equipment: "",
      fk_type: "",
      name: station.name,
      value: Et0
    };
  }
}
