// import { makeFuncemeService } from "./services/funceme-service.factory.js";
// import dotenv from "dotenv";

// dotenv.config();

// export const runFuncemeJob = async (req, res) => {
//     try {
//         await makeFuncemeService().execute();

//         return res.status(200).send("Job executado com sucesso!");
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send("Erro ao executar o job");
//     }
// };
// index.js (Versão CommonJS)

// Se o seu 'funceme-service.factory.js' ainda usa 'export', 
// você pode precisar importá-lo usando: 
// const { makeFuncemeService } = await import("./services/funceme-service.factory.js");
// OU, melhor, adapte 'funceme-service.factory.js' para CommonJS também.

const { makeFuncemeService } = require("./services/funceme-service.factory.js");
const dotenv = require("dotenv");

// Inicializa variáveis de ambiente
dotenv.config();

/**
 * Função HTTP do Google Cloud Function.
 * @param {import('express').Request} req Requisição HTTP.
 * @param {import('express').Response} res Resposta HTTP.
 */
exports.runFuncemeJob = async (req, res) => {
    try {
        await makeFuncemeService().execute();

        // O Cloud Functions espera que você finalize a resposta
        res.status(200).send("Job executado com sucesso!");
    } catch (error) {
        console.error(error);
        // Não envie o erro interno no corpo da resposta (segurança)
        res.status(500).send("Erro ao executar o job");
    }
};