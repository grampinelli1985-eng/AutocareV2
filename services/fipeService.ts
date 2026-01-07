
const BASE_URL = 'https://parallelum.com.br/fipe/api/v1/carros';

export interface FipeData {
    Valor: string;
    Marca: string;
    Modelo: string;
    AnoModelo: number;
    Combustivel: string;
    CodigoFipe: string;
    MesReferencia: string;
    TipoVeiculo: number;
    SiglaCombustivel: string;
}

export async function getFipeValue(brand: string, model: string, year: number): Promise<FipeData | null> {
    try {
        // 1. Get Brands
        const brandsRes = await fetch(`${BASE_URL}/marcas`);
        if (!brandsRes.ok) return null;
        const brands = await brandsRes.json();
        const brandObj = brands.find((b: any) => b.nome.toLowerCase() === brand.toLowerCase());

        if (!brandObj) return null;
        const brandId = brandObj.codigo;

        // 2. Get Models
        const modelsRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos`);
        if (!modelsRes.ok) return null;
        const modelsData = await modelsRes.json();
        const models = modelsData.modelos;

        // Improved matching logic
        const normalizedSearchModel = model.toLowerCase()
            .replace(brand.toLowerCase(), '') // Remove brand if present in model name
            .trim();

        const searchKeywords = normalizedSearchModel.split(/\s+/).filter(k => k.length > 0);

        // Score based matching
        let bestMatch = null;
        let highestScore = 0;

        for (const m of models) {
            const modelName = m.nome.toLowerCase();
            let score = 0;

            // Direct includes check (highest priority if specific)
            if (modelName.includes(normalizedSearchModel) || normalizedSearchModel.includes(modelName)) {
                score += 10;
            }

            // Keyword overlap check
            let keywordsFound = 0;
            for (const kw of searchKeywords) {
                if (modelName.includes(kw)) {
                    keywordsFound++;
                }
            }

            // Percentage of keywords found
            if (searchKeywords.length > 0) {
                const keywordScore = (keywordsFound / searchKeywords.length) * 5;
                score += keywordScore;
            }

            // Tie-breaker: prefer shorter names if scores are equal (usually more generic)
            if (score > highestScore) {
                highestScore = score;
                bestMatch = m;
            } else if (score === highestScore && score > 0) {
                if (bestMatch && modelName.length < bestMatch.nome.length) {
                    bestMatch = m;
                }
            }
        }

        if (!bestMatch || highestScore < 1) return null;
        const modelId = bestMatch.codigo;

        // 3. Get Years
        const yearsRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos/${modelId}/anos`);
        if (!yearsRes.ok) return null;
        const years = await yearsRes.json();

        // Match year (format usually is "2023-1" for Gasolina, "2023-3" for Diesel, etc.)
        const yearObj = years.find((y: any) => y.nome.includes(year.toString()));

        if (!yearObj) return null;
        const yearId = yearObj.codigo;

        // 4. Get Final Data
        const finalRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos/${modelId}/anos/${yearId}`);
        if (!finalRes.ok) return null;
        const data = await finalRes.json();

        return data;
    } catch (error) {
        console.error('Error fetching FIPE data:', error);
        return null;
    }
}
