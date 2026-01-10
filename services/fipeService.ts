
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

        // Create a regex to remove any brand-related words from the model string
        const brandWords = [normalizedBrand, ...Object.values(brandAliases).flat(), brandObj.nome.toLowerCase()];
        let cleanModel = model.toLowerCase();
        brandWords.forEach(word => {
            if (word.length > 2) {
                cleanModel = cleanModel.replace(new RegExp(word, 'gi'), '');
            }
        });

        const normalizedSearchModel = normalize(cleanModel);
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
                    // Higher weight for version - specific numbers (like 1.6, 2.0, 16V)
                    if (/[0-9]/.test(kw)) score += 15;
                    else score += 5;
                }
            }

            // Bonus for substring match (e.g. "Versa" in "Nissan Versa SL")
            if (modelName.includes(normalizedSearchModel) || normalizedSearchModel.includes(modelName)) {
                score += 10;
            }

            // Calculate percentage of keywords found
            if (searchKeywords.length > 0) {
                const ratio = keywordsFound / searchKeywords.length;
                score += ratio * 20;
            }

            // Length difference penalty (small)
            const lengthDiff = Math.abs(modelName.length - normalizedSearchModel.length);
            score -= lengthDiff * 0.1;

            if (score >= 5 || keywordsFound >= 1) {
                candidates.push({ m, score });
            }
        }

        // Sort candidates by score descending
        candidates.sort((a, b) => b.score - a.score);

        // 4. Validate top candidates against year availability
        let finalModelId = null;
        let finalYearId = null;
        let finalData = null;

        // Take top 10 candidates to avoid excessive API calls but ensure coverage
        const topCandidates = candidates.slice(0, 10);

        if (topCandidates.length === 0) {
            console.warn(`[FIPE] No candidates found for ${brand} ${model}`);
        }

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
                    break;
                }
            }
        }

        if (!finalData) {
            console.warn(`[FIPE] Match failed for: Brand=${brand}, Model=${model}, Year=${year}, Fuel=${fuel}. Evaluated ${topCandidates.length} candidates.`);
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
