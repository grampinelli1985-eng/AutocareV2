
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

export async function getFipeValue(brand: string, model: string, year: number, fuel?: string): Promise<FipeData | null> {
    try {
        // 1. Get Brands
        const brandsRes = await fetch(`${BASE_URL}/marcas`);
        if (!brandsRes.ok) return null;
        const brands = await brandsRes.json();

        // Flexible brand matching (matches "Chevrolet" to "GM - Chevrolet", "Volkswagen" to "VW - VolksWagen")
        const normalizedBrand = brand.toLowerCase().trim();
        const brandObj = brands.find((b: any) => {
            const name = b.nome.toLowerCase();
            return name === normalizedBrand || name.includes(normalizedBrand) || normalizedBrand.includes(name);
        });

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
                .replace(/\btsi\b/g, 'turbo') // Common alias
                .replace(/\bt\b/g, 'turbo')   // Common alias
                .replace(/\bat\b/g, 'aut')     // Common alias
                .replace(/\bautomatico\b/g, 'aut') // Common alias
                .replace(/\bcvt\b/g, 'aut')    // Common alias
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
                        score += 10; // Increased weight for numbers
                    } else {
                        score += 3; // Increased weight for keywords
                    }
                }
            }

            // 2. Bonus for exact string contains (very strong indicator)
            if (modelName.includes(normalizedSearchModel)) {
                score += 20;
            }

            // 3. Percentage of keywords found bonus
            if (searchKeywords.length > 0) {
                score += (keywordsFound / searchKeywords.length) * 10;
            }

            // 4. Minor Penalty for length difference (tie-breaker only)
            const lengthDiff = Math.abs(modelName.length - normalizedSearchModel.length);
            score -= lengthDiff * 0.01; // Reduced penalty

            if (score > highestScore) {
                highestScore = score;
                bestMatch = m;
            }
        }

        if (!bestMatch || highestScore < 5) return null; // Increased threshold

        const modelId = bestMatch.codigo;

        // 3. Get Years
        const yearsRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos/${modelId}/anos`);
        if (!yearsRes.ok) return null;
        const years = await yearsRes.json();

        // Match year (format usually is "2018-1" for Gasolina, "2018-3" for Diesel, etc.)
        const yearObj = years.find((y: any) => {
            const nameMatches = y.nome.includes(year.toString());
            if (!fuel) return nameMatches;

            // FIPE uses "Gasolina", "Diesel", "Álcool"
            const normalizedFuel = fuel.toLowerCase();
            if (normalizedFuel.includes('diesel')) return nameMatches && y.nome.toLowerCase().includes('diesel');
            if (normalizedFuel.includes('etanol') || normalizedFuel.includes('alcool')) return nameMatches && y.nome.toLowerCase().includes('alcool');
            // Default to Gasolina/Flex
            return nameMatches && (y.nome.toLowerCase().includes('gasolina') || !y.nome.toLowerCase().includes('diesel'));
        }) || years.find((y: any) => y.nome.includes(year.toString())); // Fallback to year only if fuel match fails

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
