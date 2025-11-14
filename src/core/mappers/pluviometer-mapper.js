
export class PluviometerWithMeasurementsMapper {
  static ToPersistency(pluviometerEqp) {
    const [time, pluviometry] = Object.values(pluviometerEqp.measurements);

    const value = parseFloat(pluviometry);

    return {
      time,
      fk_equipment: "",
      fk_type: "",
      name: pluviometerEqp.name,
      value: value >= 0 ? value : null,
    };
  }
}
