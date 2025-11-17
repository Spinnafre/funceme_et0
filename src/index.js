const { makeFuncemeService } = await import("./services/funceme-service.factory.js");

export const runFuncemeJob = async (req, res) => {
    try {
        await makeFuncemeService().execute();

        return res.status(200).send("Job executado com sucesso!");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Erro ao executar o job");
    }
};

