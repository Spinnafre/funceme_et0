import { makeFuncemeService } from "../services/funceme-service.factory.js";
import dotenv from "dotenv";

dotenv.config();

export const runFuncemeJob = async (req, res) => {
    try {
        await makeFuncemeService().execute();

        return res.status(200).send("Job executado com sucesso!");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Erro ao executar o job");
    }
};
