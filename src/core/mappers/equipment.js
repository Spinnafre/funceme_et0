export class EquipmentMapper {
  static toDomain(equipment) {
    return {
      Code: equipment.Code,
      Name: equipment.Name,
      Altitude: equipment.Altitude,
      Location: {
        Latitude: equipment.Latitude,
        Longitude: equipment.Longitude,
      },
    };
  }
  static toPersistency(equipment) {
    return {
      IdEquipmentExternal: equipment.Code,
      Name: equipment.Name,
      Altitude: equipment.Altitude,
      Location: equipment.Location,
    };
  }
}
