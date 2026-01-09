
import { MaintenancePriority, MaintenanceTask } from './types';

export const BRANDS = [
  'VW - VolksWagen', 'Fiat', 'GM - Chevrolet', 'Toyota', 'Honda', 'Peugeot', 'Renault', 'Ford', 'Hyundai', 'Jeep',
  'Citroën', 'Nissan', 'Mitsubishi', 'Audi', 'BMW', 'Mercedes-Benz', 'Volvo', 'Caoa Chery', 'Kia Motors', 'BYD', 'GWM'
];

export const MODELS_BY_BRAND: Record<string, string[]> = {
  'VW - VolksWagen': ['Gol', 'Polo', 'Golf', 'T-Cross', 'Nivus', 'Jetta', 'Saveiro', 'Virtus', 'Amarok', 'Voyage', 'Fox', 'Fusca', 'Taos', 'UP!'],
  'Fiat': ['Uno', 'Palio', 'Argo', 'Cronos', 'Mobi', 'Toro', 'Strada', 'Pulse', 'Fastback', 'Siena', '500', 'Ducato', 'Fiorino', 'Idea', 'Marea', 'Punto'],
  'GM - Chevrolet': ['Onix', 'Prisma', 'Tracker', 'Cruze', 'S10', 'Spin', 'Montana', 'Equinox', 'Celta', 'Astra', 'Vectra', 'Zafira', 'Cobalt', 'Classic', 'Trailblazer'],
  'Toyota': ['Corolla', 'Etios', 'Yaris', 'Hilux', 'SW4', 'Corolla Cross', 'Rav4', 'Camry', 'Prius'],
  'Honda': ['Civic', 'City', 'Fit', 'HR-V', 'WR-V', 'CR-V', 'Accord'],
  'Peugeot': ['208', '2008', '3008', '408', '5008', 'Partner', 'Expert', '206', '207', '307', '308'],
  'Renault': ['Sandero', 'Logan', 'Duster', 'Kwid', 'Captur', 'Oroch', 'Master', 'Stepway', 'Clio', 'Fluence', 'Koleos'],
  'Ford': ['Ka', 'Fiesta', 'EcoSport', 'Ranger', 'Focus', 'Fusion', 'Territory', 'Maverick', 'Edge', 'Mustang'],
  'Hyundai': ['HB20', 'HB20S', 'Creta', 'Tucson', 'Santa Fe', 'IX35', 'Azera', 'Elantra', 'HR', 'Veloster'],
  'Jeep': ['Renegade', 'Compass', 'Commander', 'Wrangler', 'Cherokee', 'Grand Cherokee'],
  'Citroën': ['C3', 'C4 Cactus', 'C4 Lounge', 'C4 Pallas', 'C5', 'Aircross', 'Jumpy', 'Berlingo'],
  'Nissan': ['Kicks', 'March', 'Versa', 'Frontier', 'Sentra', 'Tiida', 'Livina'],
  'Mitsubishi': ['L200', 'ASX', 'Eclipse Cross', 'Pajero', 'Outlander', 'Lancer'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'Q3', 'Q5', 'TT'],
  'BMW': ['Série 3', 'Série 1', 'X1', 'X3', 'X5', 'Z4'],
  'Mercedes-Benz': ['Classe A', 'Classe C', 'Classe E', 'GLA', 'GLC', 'GLE'],
  'Volvo': ['XC40', 'XC60', 'XC90', 'V40', 'S60'],
  'Caoa Chery': ['Tiggo 2', 'Tiggo 3X', 'Tiggo 5X', 'Tiggo 7', 'Tiggo 8', 'Arrizo 5', 'Arrizo 6'],
  'Kia Motors': ['Sportage', 'Sorento', 'Cerato', 'Picanto', 'Bongo', 'Soul'],
  'BYD': ['Dolphin', 'Seal', 'Song Plus', 'Tan', 'Han', 'Yuan Plus'],
  'GWM': ['Haval H6', 'Ora 03', 'Poer']
};

export const COMMON_ENGINES = [
  '1.0 MPI', '1.0 Turbo', '1.0 Firefly', '1.2 PureTech', '1.3 Firefly', '1.3 Turbo', '1.4 Turbo', '1.5 Turbo', '1.6 8V', '1.6 16V', '1.6 MSI', '1.6 THP', '1.8 E.torQ', '2.0 Flex', '2.0 Turbo Diesel', '2.0 Hybrid', '2.4 Flex', '2.5 Flex', '2.8 Turbo Diesel', '3.0 V6'
];

export const FUEL_TYPES = ['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Híbrido', 'Elétrico'];

export const TRANSMISSIONS = ['Manual', 'Automático', 'CVT', 'Dualogic', 'i-Motion', 'DCT'];

export const DEFAULT_MAINTENANCE_PLAN: Omit<MaintenanceTask, 'id'>[] = [
  {
    title: 'Troca de Óleo e Filtro',
    description: 'IMPORTANTE: Use apenas lubrificante que atenda às normas e homologações específicas da fabricante (ex: PSA B71 2290, GM Dexos, VW 508.88). O uso de óleo incorreto pode causar danos graves ao motor e perda de garantia.',
    intervalKm: 10000,
    intervalMonths: 12,
    priority: MaintenancePriority.CRITICAL,
  },
  {
    title: 'Filtro de Combustível',
    description: 'Troca essencial para proteger o sistema de injeção contra impurezas do combustível.',
    intervalKm: 10000,
    intervalMonths: 12,
    priority: MaintenancePriority.HIGH,
  },
  {
    title: 'Filtro de Ar de Cabine (Pólen)',
    description: 'Substituição para garantir a pureza do ar no interior do veículo e eficiência do AC.',
    intervalKm: 10000,
    intervalMonths: 12,
    priority: MaintenancePriority.MEDIUM,
  },
  {
    title: 'Verificar Alinhamento e Balanceamento',
    description: 'Verificação da geometria da suspensão e balanceamento para evitar vibrações e desgaste irregular.',
    intervalKm: 20000,
    intervalMonths: 12,
    priority: MaintenancePriority.MEDIUM,
  },
  {
    title: 'Inspeção de Freios e Suspensão',
    description: 'Checagem de pastilhas, discos, amortecedores e buchas para garantir segurança ativa.',
    intervalKm: 20000,
    intervalMonths: 12,
    priority: MaintenancePriority.HIGH,
  },
  {
    title: 'Filtro de Ar do Motor',
    description: 'Substituição do elemento filtrante para otimizar a queima de combustível e performance.',
    intervalKm: 20000,
    intervalMonths: 24,
    priority: MaintenancePriority.MEDIUM,
  },
  {
    title: 'Velas de Ignição',
    description: 'Substituição das velas para evitar falhas de ignição, perda de potência e aumento no consumo.',
    intervalKm: 40000,
    intervalMonths: 48,
    priority: MaintenancePriority.MEDIUM,
  },
  {
    title: 'Troca de Pneus',
    description: 'Substituição dos pneus por novos para garantir aderência, frenagem e segurança em pista molhada.',
    intervalKm: 40000,
    intervalMonths: 48,
    priority: MaintenancePriority.HIGH,
  },
  {
    title: 'Fluido de Freio',
    description: 'Troca completa do fluido (sangria) devido à contaminação por umidade ao longo do tempo.',
    intervalKm: 40000,
    intervalMonths: 24,
    priority: MaintenancePriority.HIGH,
  },
  {
    title: 'Líquido de Arrefecimento',
    description: 'Substituição do aditivo do radiador para evitar oxidação e superaquecimento do motor.',
    intervalKm: 50000,
    intervalMonths: 36,
    priority: MaintenancePriority.HIGH,
  },
  {
    title: 'Sistema de Distribuição (Correia ou Corrente)',
    description: 'IMPORTANTE: Verifique se seu veículo utiliza correia dentada (exige troca periódica a cada 60-100k) ou corrente de comando (alta durabilidade, sem troca programada). Modelos Toyota, Honda e motores Fiat Firefly/Jeep T270 costumam usar corrente.',
    intervalKm: 60000,
    intervalMonths: 60,
    priority: MaintenancePriority.CRITICAL,
  },
  {
    title: 'Óleo da Transmissão (Automáticos)',
    description: 'Inspeção e troca preventiva para evitar travamentos e desgaste excessivo do câmbio.',
    intervalKm: 80000,
    intervalMonths: 72,
    priority: MaintenancePriority.HIGH,
  }
];
