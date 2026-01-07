
const BASE_URL = 'https://parallelum.com.br/fipe/api/v1/carros';

async function getFipeValue(brand, model, year, fuel) {
    try {
        const brandsRes = await fetch(`${BASE_URL}/marcas`);
        const brands = await brandsRes.json();
        const brandObj = brands.find((b) => b.nome.toLowerCase() === brand.toLowerCase());
        const brandId = brandObj.codigo;

        const modelsRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos`);
        const modelsData = await modelsRes.json();
        const models = modelsData.modelos;

        const normalize = (text) => {
            return text.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s]/g, ' ')
                .replace(/\bthp\b/g, 'turbo')
                .replace(/\bcvt\b/g, 'aut')
                .trim();
        };

        const normalizedSearchModel = normalize(model.replace(new RegExp(brand, 'gi'), ''));
        const searchKeywords = normalizedSearchModel.split(/\s+/).filter(k => k.length > 0);

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
            score -= Math.abs(modelName.length - normalizedSearchModel.length) * 0.01;
            if (score >= 5) candidates.push({ m, score });
        }

        candidates.sort((a, b) => b.score - a.score);

        const topCandidates = candidates.slice(0, 5);
        for (const candidate of topCandidates) {
            console.log(`Testing: ${candidate.m.nome} (Score: ${candidate.score.toFixed(2)})`);
            const yrsRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos/${candidate.m.codigo}/anos`);
            const years = await yrsRes.json();
            const yr = years.find(y => y.nome.includes(year.toString()));
            if (yr) {
                console.log(`  MATCH: ${candidate.m.nome} Year: ${yr.nome}`);
                const finalRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos/${candidate.m.codigo}/anos/${yr.codigo}`);
                const data = await finalRes.json();
                console.log(`  Value: ${data.Valor}`);
                return data;
            } else {
                console.log(`  Year ${year} not available.`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

getFipeValue("Peugeot", "3008 1.6 THP CVT", 2018, "Gasolina");
