import { BigQuery } from "@google-cloud/bigquery";
import { Logger } from "../logger/logger";

export class EquipmentsRepository {
    constructor() {
        this.bigquery = new BigQuery();
        this.projectId = "teste-carga-bigquery";
        this.datasetId = "DadosMeteorologicos";
        this.dataset = this.bigquery.dataset(this.datasetId);
    }

    /**
      * Busca equipamentos filtrando por vários códigos externos
      * @param {string[]} externalIds - lista de códigos id_equipment_external
      */
    async findByExternalIds(externalIds = []) {
        const tableId = "metereological_equipment";

        const idsFormatted = externalIds.map(id => `'${id}'`).join(',');

        const query = `
                    SELECT 
                        id_equipment,
                        id_equipment_external,
                        name
                    FROM \`${this.projectId}.${this.datasetId}.${tableId}\`
                    WHERE id_equipment_external IN (${idsFormatted})
                `;

        const [rows] = await this.bigquery.query({
            query: query,
            location: 'US',
        });

        const map = new Map();

        rows.forEach(row => {
            map.set(row.id_equipment_external, {
                id_equipment: row.id_equipment,
                id_equipment_external: row.id_equipment_external,
                name: row.name,
            });
        });

        return map;
    }

    /**
     * Insere múltiplas linhas (batch insert)
     * @param {Array<Object>} rows - lista de objetos
     */
    async insertMany(rows) {
        const table = this.dataset.table("equipment_readings");

        await table.insert(rows);

        Logger.info({
            msg: `Inserted ${rows.length} rows`
        })
    }
}
