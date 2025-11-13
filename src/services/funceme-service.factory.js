import { FetchFuncemeEquipments } from "./funceme.service.js";
import { FTPClientAdapter } from "../infra/ftp/client/ftp-client-adapter.js";

const makeFuncemeService = () => new FetchFuncemeEquipments(
  new FTPClientAdapter()
);

export { makeFuncemeService };
