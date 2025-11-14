import { BigQuery } from "@google-cloud/bigquery";

export class BigQueryRepository {
    constructor() {
        this.bigquery = new BigQuery();
        this.datasetName = "DadosMeteorologicos";
        this.tableName = "equipment_readings";
    }

    /**
     * Insere uma única linha no BigQuery
     * @param {Object} data - objeto a ser inserido
     */
    async insertOne(data) {
        try {
            const dataset = this.bigquery.dataset(this.datasetName);
            const table = dataset.table(this.tableName);

            await table.insert(data);

            return { success: true };
        } catch (err) {
            console.error("Erro ao inserir no BigQuery:", err);
            throw err;
        }
    }

    /**
     * Insere múltiplas linhas (batch insert)
     * @param {Array<Object>} rows - lista de objetos
     */
    async insertMany(rows) {
        try {
            const dataset = this.bigquery.dataset(this.datasetName);
            const table = dataset.table(this.tableName);

            await table.insert(rows);

            return { success: true, inserted: rows.length };
        } catch (err) {
            console.error("Erro ao inserir múltiplos registros no BigQuery:", err);
            throw err;
        }
    }
}
