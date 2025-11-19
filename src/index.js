const { makeFuncemeService } = await import("./services/funceme-service.factory.js");
import dotenv from "dotenv";
import { Logger } from "./infra/logger/logger.js";
dotenv.config();

export const runFuncemeJob = async (req, res) => {
    try {
        await makeFuncemeService().execute();

        return res.status(200).send("Job executado com sucesso!");
    } catch (error) {
        console.error(error);

        if (error.name === 'PartialFailureError') {
            error.errors.forEach((errorDetail) => {
                errorDetail.errors.forEach(e => {
                    Logger.error({
                        msg: `reason: ${e.reason}`
                    });
                    Logger.error({
                        msg: `message: ${e.message}`
                    });
                });
            });
        }

        return res.status(500).send("Erro ao executar o job");
    }
};

