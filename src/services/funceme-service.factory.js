import { FetchFuncemeEquipments } from "./funceme.service.js";
import { FTPClientAdapter } from "../infra/ftp/client/ftp-client-adapter.js";
import { EquipmentsRepository } from "../infra/repository/equipments-repository.js";

const makeFuncemeService = () => new FetchFuncemeEquipments(
  new FTPClientAdapter(),
  new EquipmentsRepository(),
);

export { makeFuncemeService };
