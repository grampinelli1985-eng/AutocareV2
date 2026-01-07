
const brand = "Peugeot";
const model = "3008 1.6 THP Griffe Pack";
const models = [
    { nome: "3008 Griffe Pack 1.6 Turbo 16V 5p Aut.", codigo: "8243" },
    { nome: "3008 Griffe 1.6 Turbo 16V 5p Aut.", codigo: "6000" }
];

const normalize = (text) => {
    return text.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\bthp\b/g, 'turbo')
        .replace(/\bt\b/g, 'turbo')
        .replace(/\bat\b/g, 'aut')
        .replace(/\bmt\b/g, 'manual')
        .trim();
};

const normalizedSearchModel = normalize(model.replace(new RegExp(brand, 'gi'), ''));
const searchKeywords = normalizedSearchModel.split(/\s+/).filter(k => k.length > 0);

console.log("Search Keywords:", searchKeywords);

let bestMatch = null;
let highestScore = 0;

for (const m of models) {
    const modelName = normalize(m.nome);
    let score = 0;

    let keywordsFound = 0;
    for (const kw of searchKeywords) {
        if (modelName.includes(kw)) {
            keywordsFound++;
            if (/[0-9]/.test(kw)) {
                score += 5;
            } else {
                score += 2;
            }
        }
    }

    if (modelName.includes(normalizedSearchModel)) {
        score += 10;
    }

    const lengthDiff = Math.abs(modelName.length - normalizedSearchModel.length);
    score -= lengthDiff * 0.1;

    console.log(`Model: ${m.nome}, Score: ${score}`);

    if (score > highestScore) {
        highestScore = score;
        bestMatch = m;
    }
}

console.log("Best Match:", bestMatch ? bestMatch.nome : "NONE");
