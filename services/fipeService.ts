
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
        const brandAliases: Record<string, string[]> = {
            'chevrolet': ['gm', 'chevrolet'],
            'volkswagen': ['vw', 'volkswagen'],
            'mercedes': ['mercedes', 'benz'],
            'land rover': ['land', 'rover'],
            'fiat': ['fiat'],
            'ford': ['ford'],
            'renault': ['renault'],
            'citroen': ['citroen'],
            'peugeot': ['peugeot'],
            'mitsubishi': ['mitsubishi'],
            'honda': ['honda'],
            'toyota': ['toyota'],
            'hyundai': ['hyundai']
        };

        const brandObj = brands.find((b: any) => {
            const name = b.nome.toLowerCase();
            if (name === normalizedBrand || name.includes(normalizedBrand) || normalizedBrand.includes(name)) return true;

            // Check aliases
            for (const [key, aliases] of Object.entries(brandAliases)) {
                if (normalizedBrand.includes(key)) {
                    return aliases.some(alias => name.includes(alias));
                }
            }
            return false;
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
                .replace(/\ballure\b/g, '')     // Trim fluff
                .replace(/\bgriffe\b/g, '')    // Trim fluff
                .trim();
        };

        const normalizedSearchModel = normalize(model.replace(new RegExp(brand, 'gi'), ''));
        const searchKeywords = normalizedSearchModel.split(/\s+/).filter(k => k.length > 0);

        // 3. Score and collect candidates
        const candidates: { m: any, score: number }[] = [];

        for (const m of models) {
            const modelName = normalize(m.nome);
            let score = 0;

            let keywordsFound = 0;
            for (const kw of searchKeywords) {
                if (modelName.includes(kw)) {
                    keywordsFound++;
                    if (/[0-9]/.test(kw)) score += 10;
                    else score += 3;
                }
            }

            if (modelName.includes(normalizedSearchModel)) score += 20;
            if (searchKeywords.length > 0) score += (keywordsFound / searchKeywords.length) * 10;

            const lengthDiff = Math.abs(modelName.length - normalizedSearchModel.length);
            score -= lengthDiff * 0.01;

            if (score >= 5) {
                candidates.push({ m, score });
            }
        }

        // Sort candidates by score descending
        candidates.sort((a, b) => b.score - a.score);

        // 4. Validate top candidates against year availability
        let finalModelId = null;
        let finalYearId = null;
        let finalData = null;

        // Take top 5 candidates to avoid excessive API calls
        const topCandidates = candidates.slice(0, 5);

        for (const candidate of topCandidates) {
            const modelId = candidate.m.codigo;

            // Get Years for this candidate
            const yearsRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos/${modelId}/anos`);
            if (!yearsRes.ok) continue;
            const years = await yearsRes.json();

            // Match year and fuel
            const yearObj = years.find((y: any) => {
                const nameMatches = y.nome.includes(year.toString());
                if (!fuel) return nameMatches;

                const normalizedFuel = fuel.toLowerCase();
                if (normalizedFuel.includes('diesel')) return nameMatches && y.nome.toLowerCase().includes('diesel');
                if (normalizedFuel.includes('etanol') || normalizedFuel.includes('alcool')) return nameMatches && y.nome.toLowerCase().includes('alcool');
                return nameMatches && (y.nome.toLowerCase().includes('gasolina') || !y.nome.toLowerCase().includes('diesel'));
            }) || years.find((y: any) => y.nome.includes(year.toString()));

            if (yearObj) {
                const yearId = yearObj.codigo;
                // Fetch final data to confirm validity
                const finalRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos/${modelId}/anos/${yearId}`);
                if (finalRes.ok) {
                    finalData = await finalRes.json();
                    finalModelId = modelId;
                    finalYearId = yearId;
                    break; // Found the best valid candidate
                }
            }
        }

        return finalData;
    } catch (error) {
        console.error('Error fetching FIPE data:', error);
        return null;
    }
}

export async function getFipeBrands(): Promise<{ codigo: string; nome: string }[]> {
    try {
        const res = await fetch(`${BASE_URL}/marcas`);
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error('Error fetching FIPE brands:', error);
        return [];
    }
}

export async function getFipeModels(brandId: string): Promise<{ codigo: string; nome: string }[]> {
    try {
        const res = await fetch(`${BASE_URL}/marcas/${brandId}/modelos`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.modelos || [];
    } catch (error) {
        console.error('Error fetching FIPE models:', error);
        return [];
    }
}

export async function getFipeYears(brandId: string, modelId: string): Promise<{ codigo: string; nome: string }[]> {
    try {
        const res = await fetch(`${BASE_URL}/marcas/${brandId}/modelos/${modelId}/anos`);
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error('Error fetching FIPE years:', error);
        return [];
    }
}
