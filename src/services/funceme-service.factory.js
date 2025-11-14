import { FetchFuncemeEquipments } from "./funceme.service.js";
import { FTPClientAdapter } from "../infra/ftp/client/ftp-client-adapter.js";
import { BigQueryRepository } from "../infra/repository/bigquery.repository.js";

const makeFuncemeService = () => new FetchFuncemeEquipments(
  new FTPClientAdapter(),
  new BigQueryRepository(),
);

export { makeFuncemeService };
