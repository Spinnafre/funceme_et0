
export class PluviometerWithMeasurementsMapper {
  static ToPersistency(pluviometerEqp) {
    const [time, pluviometry] = Object.values(pluviometerEqp.measurements);

    const value = parseFloat(pluviometry);

    return {
      time,
      fk_equipment: pluviometerEqp.id_equipment || null,
      fk_type: null,
      value: value >= 0 ? value : null,
    };
  }
}
