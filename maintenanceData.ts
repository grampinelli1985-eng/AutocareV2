
import { VehicleModelSpecs, MaintenancePriority } from './types';

export const OFFICIAL_MANUALS: VehicleModelSpecs[] = [
  {
    brand: 'Chevrolet',
    model: 'Onix',
    yearStart: 2020,
    yearEnd: null,
    engine: '1.0 Turbo / 1.0 Aspirado',
    fuel: ['Flex'],
    transmission: ['Manual', 'Automático'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Lubrificante SAE 5W30 Dexos1 Gen3 (API SP). Obrigatório para proteção da correia banhada a óleo.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca preventiva para resguardar sistema de injeção direta.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Filtro de Ar de Cabine',
        description: 'Substituição do elemento filtrante do ar-condicionado.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Líquido de Arrefecimento',
        description: 'Verificação e complemento (se necessário) com aditivo alaranjado ACDelco.',
        intervalKm: 30000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Velas de Ignição',
        description: 'Troca das velas (específicas para motor Turbo).',
        intervalKm: 60000,
        intervalMonths: 48,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Fluido de Freio',
        description: 'Substituição total do fluido DOT 4.',
        intervalKm: 30000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      }
    ]
  },
  {
    brand: 'Hyundai',
    model: 'HB20',
    yearStart: 2019,
    yearEnd: null,
    engine: '1.0 TGDI / 1.0 Kappa',
    fuel: ['Flex'],
    transmission: ['Manual', 'Automático'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo Sintético 5W30 (API SP / ACEA A5/B5). Essencial para lubrificação do turbo.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Ar do Motor',
        description: 'Troca do elemento filtrante de admissão.',
        intervalKm: 20000,
        intervalMonths: 24,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Filtro de Combustível',
        description: 'Substituição preventiva (item externo).',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Fluido de Freio',
        description: 'Troca preventiva do fluido DOT 4.',
        intervalKm: 20000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Velas de Ignição',
        description: 'Troca das velas originais Hyundai.',
        intervalKm: 60000,
        intervalMonths: 48,
        priority: MaintenancePriority.MEDIUM
      }
    ]
  },
  {
    brand: 'Fiat',
    model: 'Strada',
    yearStart: 2020,
    yearEnd: null,
    engine: '1.3 Firefly / 1.0 Turbo T200',
    fuel: ['Flex'],
    transmission: ['Manual', 'CVT'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo 0W20 (Norma Fiat 9.55535-GSX) para 1.3 ou 0W30 (DSX) para Turbo.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca do filtro de linha.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Filtro de Ar de Cabine',
        description: 'Limpeza e troca do filtro de pólen.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Velas de Ignição',
        description: 'Substituição (motores Firefly exigem atenção regular).',
        intervalKm: 40000,
        intervalMonths: 36,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Fluido de Freio',
        description: 'Troca total DOT 4.',
        intervalKm: 40000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      }
    ]
  },
  {
    brand: 'Toyota',
    model: 'Corolla',
    yearStart: 2020,
    yearEnd: null,
    engine: '2.0 Dynamic Force / Hybrid',
    fuel: ['Flex', 'Híbrido'],
    transmission: ['Direct Shift CVT'],
    warrantyKm: 150000,
    warrantyYears: 5,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo 0W20 Sintético (Genuíno Toyota). Máxima eficiência e proteção.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Ar Condicionado',
        description: 'Troca do filtro de cabine.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.LOW
      },
      {
        title: 'Filtro de Ar do Motor',
        description: 'Substituição do elemento filtrante.',
        intervalKm: 20000,
        intervalMonths: 24,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Fluido de Freio',
        description: 'Troca total conforme manual Toyota.',
        intervalKm: 40000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Velas de Ignição (Iridium)',
        description: 'Troca de alta durabilidade.',
        intervalKm: 100000,
        intervalMonths: 72,
        priority: MaintenancePriority.MEDIUM
      }
    ]
  },
  {
    brand: 'Toyota',
    model: 'Etios',
    yearStart: 2012,
    yearEnd: 2021,
    engine: '1.3 / 1.5 Dual VVT-i',
    fuel: ['Flex'],
    transmission: ['Manual', 'Automático'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo 10W30 ou 5W30 Genuíno Toyota. Essencial para o sistema VVT-i.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca preventiva para proteger bicos e bomba.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Filtro de Ar de Cabine',
        description: 'Troca do filtro de polén.',
        intervalKm: 20000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Fluido de Freio',
        description: 'Substituição total DOT 4.',
        intervalKm: 40000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Velas de Ignição',
        description: 'Substituição para manter economia de combustível.',
        intervalKm: 40000,
        intervalMonths: 48,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Corrente de Comando',
        description: 'Possui corrente de comando metálica de alta durabilidade. Não exige troca periódica, apenas inspeção auditiva se houver ruído metálico excessivo.',
        intervalKm: 100000,
        intervalMonths: 120,
        priority: MaintenancePriority.LOW
      }
    ]
  },
  {
    brand: 'Toyota',
    model: 'Yaris',
    yearStart: 2018,
    yearEnd: null,
    engine: '1.3 / 1.5 Dual VVT-i',
    fuel: ['Flex'],
    transmission: ['CVT', 'Manual'],
    warrantyKm: 150000,
    warrantyYears: 5,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo 10W30 ou 5W30 Genuíno Toyota. Proteção para motores VVT-i.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Ar Condicionado',
        description: 'Substituição para garantir ar limpo.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca preventiva.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Fluido de Freio',
        description: 'Troca preventiva conforme manual.',
        intervalKm: 40000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Filtro de Ar do Motor',
        description: 'Substituição do elemento filtrante.',
        intervalKm: 40000,
        intervalMonths: 48,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Corrente de Comando',
        description: 'Utiliza corrente de comando metálica. Projetada para durar toda a vida útil do motor sem trocas programadas.',
        intervalKm: 150000,
        intervalMonths: 120,
        priority: MaintenancePriority.LOW
      }
    ]
  },
  {
    brand: 'Jeep',
    model: 'Compass',
    yearStart: 2022,
    yearEnd: null,
    engine: '1.3 Turbo T270',
    fuel: ['Flex'],
    transmission: ['Automático 6 marchas'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Lubrificante 0W30 ACEA C2 (Mopar MaxPro Synthetic). Norma FCA 9.55535-GS1.',
        intervalKm: 12000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Ar do Motor',
        description: 'Troca do elemento de ar.',
        intervalKm: 12000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca preventiva.',
        intervalKm: 12000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Fluido de Freio',
        description: 'Substituição total DOT 4.',
        intervalKm: 24000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Velas de Ignição',
        description: 'Troca preventiva para motor Turbo.',
        intervalKm: 48000,
        intervalMonths: 48,
        priority: MaintenancePriority.MEDIUM
      }
    ]
  },
  {
    brand: 'Volkswagen',
    model: 'Gol G7',
    yearStart: 2016,
    yearEnd: 2022,
    engine: '1.0 MPI / 1.6 MSI',
    fuel: ['Flex'],
    transmission: ['Manual', 'Automático'],
    warrantyKm: 60000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Substituição do óleo (VW 508 88) e filtro original.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca para proteção do sistema de bicos injetores.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Filtro de Ar de Cabine',
        description: 'Substituição para garantir ar limpo no interior.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Verificar Alinhamento e Balanceamento',
        description: 'Correção geométrica e balanceamento das rodas.',
        intervalKm: 20000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Inspeção de Freios',
        description: 'Checagem de desgaste das pastilhas e discos dianteiros.',
        intervalKm: 20000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Filtro de Ar do Motor',
        description: 'Substituição do elemento filtrante de admissão.',
        intervalKm: 30000,
        intervalMonths: 24,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Velas de Ignição',
        description: 'Troca das velas para manter eficiência de queima.',
        intervalKm: 40000,
        intervalMonths: 48,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Troca de Pneus',
        description: 'Substituição preventiva baseada em desgaste e segurança.',
        intervalKm: 40000,
        intervalMonths: 48,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Fluido de Freio',
        description: 'Troca total do fluido DOT 4.',
        intervalKm: 40000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Aditivo de Arrefecimento',
        description: 'Troca do líquido para evitar corrosão no bloco.',
        intervalKm: 60000,
        intervalMonths: 36,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Correia de Acessórios',
        description: 'Inspeção e troca da correia poly-v.',
        intervalKm: 60000,
        intervalMonths: 48,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Correia Dentada e Tensores',
        description: 'Troca preventiva mandatória (item crítico VW).',
        intervalKm: 120000,
        intervalMonths: 54,
        priority: MaintenancePriority.CRITICAL
      }
    ]
  },
  {
    brand: 'Peugeot',
    model: '208',
    yearStart: 2020,
    yearEnd: null,
    engine: '1.6 16V EC5 / 1.0 Firefly',
    fuel: ['Flex'],
    transmission: ['Manual', 'Automático'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Revisão Sistemática (Óleo + Filtros)',
        description: 'Troca de óleo sintético 5W30 (ACEA A5/B5), filtro de óleo e filtro de pólen.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca externa ou inspeção de linha.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Verificar Alinhamento e Balanceamento',
        description: 'Prevenção de desgaste irregular de pneus.',
        intervalKm: 20000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Fluido de Freio',
        description: 'Substituição do fluido DOT 4.',
        intervalKm: 20000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Filtro de Ar do Motor',
        description: 'Troca do elemento de admissão.',
        intervalKm: 40000,
        intervalMonths: 24,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Líquido de Arrefecimento',
        description: 'Drenagem e nova carga de aditivo Peugeot/Citroën.',
        intervalKm: 40000,
        intervalMonths: 36,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Velas de Ignição',
        description: 'Troca para manter desempenho.',
        intervalKm: 40000,
        intervalMonths: 48,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Kit Correia de Acessórios',
        description: 'Troca da correia e polias.',
        intervalKm: 60000,
        intervalMonths: 72,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Correia Dentada',
        description: 'Substituição vital para motores EC5 e Firefly.',
        intervalKm: 80000,
        intervalMonths: 48,
        priority: MaintenancePriority.CRITICAL
      }
    ]
  },
  {
    brand: 'Renault',
    model: 'Kwid',
    yearStart: 2017,
    yearEnd: null,
    engine: '1.0 SCe',
    fuel: ['Flex'],
    transmission: ['Manual'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo 5W30 (Norma Renault RN0700/0710) API SN/ACEA A5/B5. Essencial para o motor 3 cilindros.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca do filtro de linha para proteger bicos injetores.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Filtro de Ar de Cabine',
        description: 'Troca do filtro de polén do ar-condicionado.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Velas de Ignição',
        description: 'Substituição das velas para manter partida eficiente.',
        intervalKm: 40000,
        intervalMonths: 48,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Fluido de Freio',
        description: 'Troca total DOT 4.',
        intervalKm: 40000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      }
    ]
  },
  {
    brand: 'Honda',
    model: 'Civic',
    yearStart: 2017,
    yearEnd: null,
    engine: '2.0 i-VTEC / 1.5 Turbo',
    fuel: ['Flex', 'Gasolina'],
    transmission: ['CVT', 'Manual'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo 0W20 100% Sintético (API SP ou SN). Genuíno Honda garante longevidade.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Arruela de Dreno do Óleo',
        description: 'Troca obrigatória para evitar vazamentos (Standard Honda).',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Filtro de Ar do Motor',
        description: 'Substituição do elemento filtrante.',
        intervalKm: 20000,
        intervalMonths: 24,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Fluido de Freio',
        description: 'Troca total conforme padrão Honda.',
        intervalKm: 40000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Fluido de Transmissão CVT',
        description: 'Troca preventiva para manter suavidade e torque.',
        intervalKm: 40000,
        intervalMonths: 48,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Velas de Irídio',
        description: 'Substituição para evitar falhas de ignição em alta carga.',
        intervalKm: 100000,
        intervalMonths: 120,
        priority: MaintenancePriority.MEDIUM
      }
    ]
  },
  {
    brand: 'Honda',
    model: 'Fit',
    yearStart: 2015,
    yearEnd: 2021,
    engine: '1.5 i-VTEC',
    fuel: ['Flex'],
    transmission: ['CVT', 'Manual'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo 0W20 Sintético Genuíno Honda. Proteção vital para o sistema VTEC.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca preventiva.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Fluido de Freio',
        description: 'Substituição conforme padrão Honda.',
        intervalKm: 40000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Fluido CVT',
        description: 'Troca preventiva para evitar trepidações e desgaste precoce.',
        intervalKm: 40000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Corrente de Comando',
        description: 'Utiliza corrente de comando de longa duração. Requer apenas inspeção visual/auditiva.',
        intervalKm: 100000,
        intervalMonths: 120,
        priority: MaintenancePriority.LOW
      }
    ]
  },
  {
    brand: 'Ford',
    model: 'Ka / EcoSport',
    yearStart: 2015,
    yearEnd: 2021,
    engine: '1.0 Ti-VCT / 1.5 Dragon',
    fuel: ['Flex'],
    transmission: ['Manual', 'Automático'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo SAE 5W20 (Norma Ford WSS-M2C948-B). Opcional 5W30 (WSS-M2C913-D) conforme manual.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca preventiva para proteger injeção.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Filtro de Ar de Cabine',
        description: 'Substituição do elemento filtrante para renovação do ar.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Líquido de Arrefecimento',
        description: 'Troca do aditivo Motorcraft (alaranjado).',
        intervalKm: 30000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      }
    ]
  },
  {
    brand: 'Ford',
    model: 'Ranger',
    yearStart: 2013,
    yearEnd: null,
    engine: '2.2 / 3.2 Diesel / 2.0 EcoBlue',
    fuel: ['Diesel'],
    transmission: ['Manual', 'Automático'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo 5W30 (Norma WSS-M2C913-D) ou 0W30 (WSS-M2C950-A) para 2.0. Capacidade elevada (~10L).',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível (Diesel)',
        description: 'Troca crítica para evitar danos na bomba de alta pressão.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Ar do Motor',
        description: 'Substituição para evitar perda de potência em regimes de carga.',
        intervalKm: 20000,
        intervalMonths: 24,
        priority: MaintenancePriority.MEDIUM
      }
    ]
  },
  {
    brand: 'Volkswagen',
    model: 'Polo / Virtus / T-Cross / Nivus',
    yearStart: 2018,
    yearEnd: null,
    engine: '1.0 TSI (200 TSI / 170 TSI)',
    fuel: ['Flex'],
    transmission: ['Automático', 'Manual'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo SAE 0W20 (Norma VW 508 00 / 509 00) para modelos novos ou 5W40 (VW 508 88).',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível',
        description: 'Substituição para proteger sistema de injeção direta.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Fluido de Freio',
        description: 'Troca preventiva DOT 4.',
        intervalKm: 20000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Velas de Ignição',
        description: 'Troca das velas originais (exigência maior em motores turbo).',
        intervalKm: 40000,
        intervalMonths: 48,
        priority: MaintenancePriority.HIGH
      }
    ]
  },
  {
    brand: 'Chevrolet',
    model: 'Tracker / Cruze',
    yearStart: 2017,
    yearEnd: null,
    engine: '1.0 / 1.2 / 1.4 Turbo',
    fuel: ['Flex'],
    transmission: ['Automático'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo SAE 0W20 ou 5W30 (Norma GM Dexos1 Gen 3). Indispensável para o Turbo.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca para prevenir falhas de injeção direta.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Líquido de Arrefecimento',
        description: 'Verificação com aditivo Dex-Cool.',
        intervalKm: 30000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      }
    ]
  },
  {
    brand: 'Chevrolet',
    model: 'S10 / Trailblazer',
    yearStart: 2013,
    yearEnd: null,
    engine: '2.8 Turbo Diesel',
    fuel: ['Diesel'],
    transmission: ['Manual', 'Automático'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo SAE 5W30 (Norma Dexos2). Específico para motores diesel GM.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível (Duplo)',
        description: 'Troca dos dois refis para proteção total do sistema common rail.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Correia de Acessórios',
        description: 'Inspeção e troca preventiva.',
        intervalKm: 60000,
        intervalMonths: 48,
        priority: MaintenancePriority.MEDIUM
      }
    ]
  },
  {
    brand: 'Toyota',
    model: 'Hilux / SW4',
    yearStart: 2016,
    yearEnd: null,
    engine: '2.8 Turbo Diesel',
    fuel: ['Diesel'],
    transmission: ['Manual', 'Automático'],
    warrantyKm: 150000,
    warrantyYears: 5,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: 'Óleo SAE 5W30 Sintético Genuíno Toyota. Durabilidade padrão 100%.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca crítica para o motor D-4D.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Graxeiras do Cardã',
        description: 'Lubrificação externa recomendada Toyota para 4x4.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      }
    ]
  },
  {
    brand: 'Jeep',
    model: 'Renegade',
    yearStart: 2015,
    yearEnd: null,
    engine: '1.8 E.torQ / 1.3 Turbo T270',
    fuel: ['Flex'],
    transmission: ['Manual', 'Automático'],
    warrantyKm: 100000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Óleo do Motor e Filtro',
        description: '5W30 (API SN / Fiat 9.55535-S2) para 1.8 ou 0W30 (API SP / FCA GS1) para Turbo.',
        intervalKm: 12000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Ar do Motor',
        description: 'Troca do elemento filtrante.',
        intervalKm: 12000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Fluido de Freio',
        description: 'Troca preventiva DOT 4.',
        intervalKm: 24000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      }
    ]
  },
  {
    brand: 'Peugeot',
    model: '3008',
    yearStart: 2017,
    yearEnd: null,
    engine: '1.6 THP',
    fuel: ['Gasolina'],
    transmission: ['Automático'],
    warrantyKm: 30000,
    warrantyYears: 3,
    maintenancePlan: [
      {
        title: 'Troca de Óleo e Filtro',
        description: 'ESSENCIAL: Use óleo sintético 5W30 (PSA B71 2290 - ex: Total Quartz INEO ECS) ou 0W30 (PSA B71 2312 - ex: Total Quartz INEO FIRST). O motor THP é extremamente sensível à homologação PSA.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.CRITICAL
      },
      {
        title: 'Filtro de Combustível',
        description: 'Troca preventiva para proteger o sistema de injeção direta.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Filtro de Ar de Cabine',
        description: 'Substituição do elemento filtrante para garantir ar limpo.',
        intervalKm: 10000,
        intervalMonths: 12,
        priority: MaintenancePriority.MEDIUM
      },
      {
        title: 'Velas de Ignição',
        description: 'Troca preventiva (essencial no THP para evitar falhas e carbonização).',
        intervalKm: 40000,
        intervalMonths: 48,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Fluido de Freio',
        description: 'Substituição total DOT 4.',
        intervalKm: 20000,
        intervalMonths: 24,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Kit de Arrefecimento',
        description: 'Verificação e troca do aditivo original PSA (especificação azul/verde).',
        intervalKm: 40000,
        intervalMonths: 36,
        priority: MaintenancePriority.HIGH
      },
      {
        title: 'Correia de Acessórios',
        description: 'Inspeção e troca da correia e tensores.',
        intervalKm: 60000,
        intervalMonths: 72,
        priority: MaintenancePriority.MEDIUM
      }
    ]
  }
];

export function findManualForVehicle(brand: string, model: string, year: number) {
  return OFFICIAL_MANUALS.find(m =>
    m.brand.toLowerCase() === brand.toLowerCase() &&
    (m.model.toLowerCase().includes(model.toLowerCase()) || model.toLowerCase().includes(m.model.toLowerCase().split(' ')[0])) &&
    year >= m.yearStart &&
    (m.yearEnd === null || year <= m.yearEnd)
  );
}
