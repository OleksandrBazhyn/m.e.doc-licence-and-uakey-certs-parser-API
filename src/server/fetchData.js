import UakeyParser from "../UakeyParser.js";
import MedocParser from "../MedocParser.js";

export async function getUakeyData(usreou) {
    const uakeyParser = new UakeyParser();
    await uakeyParser.init();
    const data = await uakeyParser.getFullInfo([usreou]);
    await uakeyParser.dispose();
    return data;
}

export async function getMedocData(usreou) {
    const medocParser = new MedocParser();
    await medocParser.init();
    const data = await medocParser.getFullInfo([usreou]);
    await medocParser.dispose();
    return data;
}
