
import { GoogleGenAI } from "@google/genai";
import { Vehicle, ChatMessage, FuelLog } from "../types";

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export async function getSmartMaintenanceAdvice(vehicle: Vehicle, limit: number = 3) {
  try {
    const prompt = `
      Aja como um especialista em mecânica automotiva. 
      Analise o veículo: ${vehicle.brand} ${vehicle.model} ${vehicle.year}, com ${vehicle.currentMileage}km atuais.
      
      Forneça ${limit} ${limit === 1 ? 'dica' : 'dicas'} de manutenção preventiva específicas para este momento do carro.
      
      DIRETRIZ DE RIGOR TÉCNICO:
      1. Verifique se este modelo e ano utiliza CORREIA DENTADA ou CORRENTE DE COMANDO.
      2. Se for TOYOTA (Etios, Yaris, Corolla, Hilux) ou HONDA (Civic, Fit, City, HR-V), seja ASSERTIVO: eles usam CORRENTE DE COMANDO metálica que NÃO exige troca periódica. NÃO sugira troca de correia dentada para estes casos.
      3. Se for motor FIAT FIREFLY (Argo, Cronos, Strada 1.3) ou JEEP T270 (Renegade, Compass), eles também usam CORRENTE.
      4. Para motores VW TSI, diferencie: 1.0 TSI (correia) vs 2.0 TSI (corrente).
      5. Nunca use "pode ser que tenha", seja direto: "Seu veículo utiliza corrente de comando..." ou "Seu veículo exige a troca da correia a cada...".
      
      A resposta DEVE ser estritamente um objeto JSON válido, sem qualquer texto explicativo antes ou depois.
      
      Estrutura esperada:
      {
        "score": 85,
        "advices": [
          { "title": "Título Curto", "content": "Descrição breve e útil", "urgency": "low" }
        ]
      }
      Urgências permitidas: "low", "medium", "high".
      O score deve ser um número inteiro de 0 a 100 representando a saúde geral baseada na km.
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const rawText = response.text || "";

    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("JSON não encontrado na resposta");
    }

    const cleanJson = rawText.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.group("Gemini Error Analysis");
    console.error("Type:", error?.name || "Unknown Error");
    console.error("Message:", error?.message);
    if (error?.message?.includes('API_KEY_INVALID')) {
      console.error("DICA: Sua chave de API do Gemini parece ser inválida. Verifique o arquivo .env.local");
    }
    console.groupEnd();

    return {
      score: 75,
      advices: [
        { title: "Verificação de Fluidos", content: "Sempre verifique o nível do óleo e líquido de arrefecimento semanalmente.", urgency: "low" },
        { title: "Calibragem", content: "Mantenha os pneus calibrados para evitar desgaste prematuro e reduzir consumo.", urgency: "low" },
        { title: "Sistema Elétrico", content: "Verifique o estado da bateria e o funcionamento de todas as luzes externas.", urgency: "low" }
      ]
    };
  }
}

export async function chatWithGemini(messages: ChatMessage[], vehicle: Vehicle | null) {
  try {
    const systemInstruction = `
      Você é o Assistente Especialista da AutoCare, um especialista em manutenção automotiva brasileira.
      Seu objetivo é ajudar proprietários de veículos a cuidarem melhor de seus carros, especialmente após o período de garantia.
      ${vehicle ? `O usuário está falando sobre um ${vehicle.brand} ${vehicle.model} ${vehicle.year} con ${vehicle.currentMileage} KM.` : 'O usuário ainda não selecionou um veículo.'}
      
      Regras de resposta:
      1. Seja técnico, mas use linguagem acessível.
      2. Cite componentes específicos e intervalos de manutenção comuns no Brasil.
      3. Se o usuário relatar um sintoma (ex: barulho, trepidação), sugira possíveis causas e recomende uma visita ao mecânico se for algo grave.
      4. Nunca incentive o usuário a fazer reparos perigosos sozinho.
      5. Seja assertivo sobre a tecnologia do motor: Diferencie CORRENTE DE COMANDO de CORREIA DENTADA. Se o carro usa corrente (comum em Toyota, Honda, Jeep novos), explique que ela é feita para durar a vida útil do motor.
      6. Use termos brasileiros (ex: "correia dentada", "pastilha de freio", "fluido de arrefecimento").
    `;

    const lastMessage = messages[messages.length - 1].text;
    const history = messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { role: 'user', parts: [{ text: `INSTRUÇÃO DE SISTEMA: ${systemInstruction}` }] },
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: lastMessage }] }
      ],
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "Desculpe, não consegui processar sua pergunta agora.";
  } catch (error: any) {
    console.group("Gemini Chat Error Analysis");
    console.error("Type:", error?.name || "Unknown Error");
    console.error("Message:", error?.message);
    if (error?.message?.includes('API_KEY_INVALID')) {
      console.error("DICA: Sua chave de API do Gemini parece ser inválida. Verifique o arquivo .env.local");
    }
    console.groupEnd();

    return "Ocorreu um erro na conexão com meu cérebro mecânico. Pode tentar novamente? Dica: Verifique se sua chave API está correta no console do navegador.";
  }
}

export async function getFuelEconomyAdvice(vehicle: Vehicle, averageKmL: string | null) {
  try {
    const prompt = `
      Aja como um engenheiro automotivo especialista em consumo de combustível.
      Analise o veículo: ${vehicle.brand} ${vehicle.model} ${vehicle.year} ${vehicle.engine}.
      Consumo real médio registrado pelo usuário: ${averageKmL ? averageKmL + ' km/L' : 'Não registrado ainda'}.

      Forneça 3 dicas EXTREMAMENTE CURTAS E DIRETAS (máximo 80 caracteres cada) para melhorar a eficiência deste modelo específico.
      Se o consumo estiver alto para o padrão do carro, mencione possíveis causas (velas, sensores, pneus).
      Se não houver consumo registrado, foque em como este modelo costuma se comportar e dicas genéricas de condução econômica.

      A resposta DEVE ser um objeto JSON válido.
      Exemplo:
      {
        "status": "bom",
        "tips": [
          "Dica 1 curta",
          "Dica 2 curta",
          "Dica 3 curta"
        ]
      }
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const rawText = response.text || "{}";
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return null;

    return JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));
  } catch (error) {
    console.error("Error fetching fuel advice:", error);
    return null;
  }
}
export const analyzeInvoice = async (base64Image: string, mimeType: string = "image/jpeg") => {
  try {
    const prompt = `Você é um assistente especialista em manutenção automotiva. 
    Analise esta imagem de uma nota fiscal ou recibo de oficina e extraia as seguintes informações em formato JSON:
    {
      "cost": número (valor total),
      "date": "YYYY-MM-DD",
      "notes": "texto descrevendo as peças e serviços detalhadamente"
    }
    Se não encontrar alguma informação, preencha com o que for possível.
    DIRETRIZ IMPORTANTE: Retorne APENAS o objeto JSON puro, sem blocos de código markdown ou texto explicativo.`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType
              }
            }
          ]
        }
      ]
    });

    const text = result.text || "";

    // Improved JSON extraction
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("No JSON found in response:", text);
      throw new Error("Resposta da IA não contém dados válidos.");
    }

    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
  } catch (error: any) {
    console.group('Gemini Analysis Error');
    console.error('Error Description:', error?.message || 'Unknown');
    console.groupEnd();
    throw error;
  }
};
