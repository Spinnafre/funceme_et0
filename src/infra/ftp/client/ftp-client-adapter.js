import Client from "ftp";
import { Logger } from "../../logger/logger.js";
import { ConnectionError } from "../../../errors/ConnectionError.js";
import { ftpConfig } from "../../../config/config.js";


export class FTPClientAdapter {
  connection;

  static instance = null;

  constructor() {
    this.connection = new Client();
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.connection.end();

      this.connection.once("close", (err) => {
        if (err) return reject(new ConnectionError(err.message));
        resolve();
      });
    });
  }

  async status() {
    return new Promise((resolve, reject) => {
      this.connection.status((err, status) => {
        if (err) return reject(err);

        resolve(status);
      });
    });
  }

  async getFolderContentDescription(folder) {
    return new Promise((resolve, reject) => {
      this.connection.cwd("/", (error) => {
        if (error) reject(error);
      });
      this.connection.list(folder, (err, files) => {
        if (err) return reject(err);

        resolve(files);
      });
    });
  }

  async connect({ host, user, password }) {
    Logger.info({
      msg: "Iniciando conexão com o servidor FTP da funceme",
    });
    return new Promise((resolve, reject) => {
      this.connection.connect(
        Object.assign(ftpConfig, {
          host,
          user,
          password,
        })
      );


      this.connection.once("error", (err) => {
        return reject(
          new Error(`Falha ao realizar conexão com ftp ::: ${err.message}`)
        );
      });


      this.connection.once("end", () =>
        Logger.info({
          msg: "Conexão FTP fechada...",
        })
      );

      this.connection.once("ready", () => {
        resolve(true);
      });
    });
  }

  async getFile(folder, file) {
    return new Promise((resolve, reject) => {
      this.connection.cwd("/", (error) => {
        if (error) reject(error);
      });

      this.connection.cwd(folder, (error, current) => {
        if (error) {
          Logger.error({
            msg: `Falha ao tentar mudar diretório de ${current} para ${folder}`,
            obj: error,
          });
          return reject(error);
        }
      });

      this.connection.status((error, status) => {
        if (error) {
          Logger.error({
            msg: "Falha ao conectar ao FTP da funceme, não é possível obter status da conexão.",
            obj: error,
          });
        }

        Logger.info({
          msg: `Status da conexão : ${status}`,
        });
      });


      this.connection.get(file, function (error, stream) {
        Logger.info({
          msg: `Baixando arquivo ${file} do diretório ${folder}`,
        });
        if (error) {
          Logger.error({
            msg: `Falha ao baixar arquivo ${file} do diretório ${folder}`,
            obj: error,
          });
          return reject(error);
        }
        Logger.info({
          msg: `Arquivo ${file} baixado com sucesso :)`,
        });
        resolve(stream);
      });
    });
  }
}
