function parseMeasure(measure) {
  return parseFloat(measure) || null;
}

import { truncateDecimal } from "../../utils/number_formatter.js";
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

    let value = Et0 != null ? truncateDecimal(Et0, 5) : null

    return {
      time,
      fk_equipment: station.id_equipment || null,
      fk_type: null,
      value
    };
  }
}
