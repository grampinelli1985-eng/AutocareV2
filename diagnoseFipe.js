
const BASE_URL = 'https://parallelum.com.br/fipe/api/v1/carros';

async function getFipeValue(brand, model, year, fuel) {
    try {
        console.log(`\n--- Starting FIPE Debug ---`);
        console.log(`Input Brand: ${brand}`);
        console.log(`Input Model/Engine/Trans: ${model}`);
        console.log(`Input Year: ${year}`);
        console.log(`Input Fuel: ${fuel}`);

        // 1. Get Brands
        const brandsRes = await fetch(`${BASE_URL}/marcas`);
        const brands = await brandsRes.json();

        const normalizedBrand = brand.toLowerCase().trim();
        const brandObj = brands.find((b) => {
            const name = b.nome.toLowerCase();
            return name === normalizedBrand || name.includes(normalizedBrand) || normalizedBrand.includes(name);
        });

        if (!brandObj) {
            console.log(`FAILED: Brand not found: ${brand}`);
            return null;
        }
        console.log(`Found Brand: ${brandObj.nome} (${brandObj.codigo})`);
        const brandId = brandObj.codigo;

        // 2. Get Models
        const modelsRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos`);
        const modelsData = await modelsRes.json();
        const models = modelsData.modelos;

        const normalize = (text) => {
            return text.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s]/g, ' ')
                .replace(/\bthp\b/g, 'turbo')
                .replace(/\btsi\b/g, 'turbo')
                .replace(/\bt\b/g, 'turbo')
                .replace(/\bat\b/g, 'aut')
                .replace(/\bautomatico\b/g, 'aut')
                .replace(/\bcvt\b/g, 'aut')
                .replace(/\bmt\b/g, 'manual')
                .trim();
        };

        const normalizedSearchModel = normalize(model.replace(new RegExp(brand, 'gi'), ''));
        const searchKeywords = normalizedSearchModel.split(/\s+/).filter(k => k.length > 0);
        console.log(`Search Keywords: [${searchKeywords.join(', ')}]`);

        // 3. Score and collect candidates
        const candidates = [];

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

        candidates.sort((a, b) => b.score - a.score);

        // 4. Validate top candidates against year availability
        let finalData = null;
        const topCandidates = candidates.slice(0, 5);

        for (const candidate of topCandidates) {
            const modelId = candidate.m.codigo;
            console.log(`Testing candidate: ${candidate.m.nome} (Score: ${candidate.score.toFixed(2)})`);

            const yearsRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos/${modelId}/anos`);
            if (!yearsRes.ok) continue;
            const years = await yearsRes.json();

            const yearObj = years.find((y) => {
                const nameMatches = y.nome.includes(year.toString());
                if (!fuel) return nameMatches;

                const normalizedFuel = fuel.toLowerCase();
                if (normalizedFuel.includes('diesel')) return nameMatches && y.nome.toLowerCase().includes('diesel');
                if (normalizedFuel.includes('etanol') || normalizedFuel.includes('alcool')) return nameMatches && y.nome.toLowerCase().includes('alcool');
                return nameMatches && (y.nome.toLowerCase().includes('gasolina') || !y.nome.toLowerCase().includes('diesel'));
            }) || years.find((y) => y.nome.includes(year.toString()));

            if (yearObj) {
                const yearId = yearObj.codigo;
                const finalRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos/${modelId}/anos/${yearId}`);
                if (finalRes.ok) {
                    finalData = await finalRes.json();
                    console.log(`  MATCH FOUND: ${candidate.m.nome} Year: ${yearObj.nome}`);
                    break;
                }
            } else {
                console.log(`  Year ${year} not available for this candidate.`);
            }
        }

        if (!finalData) {
            console.log(`FAILED: No valid model/year match found.`);
            return null;
        }

        console.log(`SUCCESS: Value = ${finalData.Valor}`);
        return finalData;
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        return null;
    }
}

// Test cases
(async () => {
    await getFipeValue("Peugeot", "3008 1.6 THP CVT", 2018, "Gasolina");
    await getFipeValue("Toyota", "Yaris 1.5 CVT", 2023, "Flex");
    await getFipeValue("Volkswagen", "Polo 1.0 TSI Automático", 2022, "Gasolina");
})();
