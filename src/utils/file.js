export function extractEquipmentCode(filename) {
    const regex = /prec_(\d+)_2025-/;
    const match = filename.match(regex);

    if (!match) {
        throw new Error("Código não encontrado na string");
    }

    return match[1];
}