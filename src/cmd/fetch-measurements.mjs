(async function () {
    const { config } = await import("dotenv")
    config({
        path: '/usr/src/app/.env'
    })
    try {
        const { makeFuncemeService } = await import("../services/funceme-service.factory.js");

        await makeFuncemeService().execute()
        process.exit(0)
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
})()