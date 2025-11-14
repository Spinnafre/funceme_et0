import { BigQuery } from "@google-cloud/bigquery";

export class EquipmentsRepository {
    constructor() {
        this.bigquery = new BigQuery();
        this.dataset = this.bigquery.dataset("DadosMeteorologicos");
    }

    /**
     * Insere múltiplas linhas (batch insert)
     * @param {Array<Object>} rows - lista de objetos
     */
    async insertMany(rows) {
        try {
            const table = this.dataset.table("equipment_readings");

            await table.insert(rows);

            console.log(`Inseridos ${rows.length} registros no BigQuery`);
        } catch (err) {
            console.error("Erro ao inserir múltiplos registros no BigQuery:", err);
            throw err;
        }
    }
}
