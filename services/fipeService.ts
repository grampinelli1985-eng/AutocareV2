
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

        // Improved matching logic with keyword normalization
        const normalize = (text: string) => {
            return text.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
                .replace(/[^a-z0-9\s]/g, ' ') // Remove special chars
                .replace(/\bthp\b/g, 'turbo') // Common alias
                .replace(/\bt\b/g, 'turbo')   // Common alias
                .replace(/\bat\b/g, 'aut')     // Common alias
                .replace(/\bmt\b/g, 'manual')  // Common alias
                .trim();
        };

        const normalizedSearchModel = normalize(model.replace(new RegExp(brand, 'gi'), ''));
        const searchKeywords = normalizedSearchModel.split(/\s+/).filter(k => k.length > 0);

        // Score based matching
        let bestMatch = null;
        let highestScore = 0;

        for (const m of models) {
            const modelName = normalize(m.nome);
            let score = 0;

            // 1. Keyword overlap check
            let keywordsFound = 0;
            for (const kw of searchKeywords) {
                if (modelName.includes(kw)) {
                    keywordsFound++;
                    // Higher weight for specific numbers (like 3008, 1.6)
                    if (/[0-9]/.test(kw)) {
                        score += 5;
                    } else {
                        score += 2;
                    }
                }
            }

            // 2. Bonus for exact string contains
            if (modelName.includes(normalizedSearchModel)) {
                score += 10;
            }

            // 3. Penalty for length difference (prefer closer matches)
            const lengthDiff = Math.abs(modelName.length - normalizedSearchModel.length);
            score -= lengthDiff * 0.1;

            if (score > highestScore) {
                highestScore = score;
                bestMatch = m;
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
