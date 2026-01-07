
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
        const brands = await brandsRes.json();
        const brandObj = brands.find((b: any) => b.nome.toLowerCase() === brand.toLowerCase());

        if (!brandObj) return null;
        const brandId = brandObj.codigo;

        // 2. Get Models
        const modelsRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos`);
        const modelsData = await modelsRes.json();
        const models = modelsData.modelos;

        // Fuzzy matching for model
        const modelObj = models.find((m: any) =>
            m.nome.toLowerCase().includes(model.toLowerCase()) ||
            model.toLowerCase().includes(m.nome.toLowerCase())
        );

        if (!modelObj) return null;
        const modelId = modelObj.codigo;

        // 3. Get Years
        const yearsRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos/${modelId}/anos`);
        const years = await yearsRes.json();

        // Match year (format usually is "2023-1" for Gasolina, "2023-3" for Diesel, etc.)
        const yearObj = years.find((y: any) => y.nome.includes(year.toString()));

        if (!yearObj) return null;
        const yearId = yearObj.codigo;

        // 4. Get Final Data
        const finalRes = await fetch(`${BASE_URL}/marcas/${brandId}/modelos/${modelId}/anos/${yearId}`);
        const data = await finalRes.json();

        return data;
    } catch (error) {
        console.error('Error fetching FIPE data:', error);
        return null;
    }
}
