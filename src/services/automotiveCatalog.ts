import type { FuelType } from '../types/autosense';

export interface CatalogModelEntry {
  model: string;
  defaultFuel: FuelType;
}

export const AUTOMOTIVE_CATALOG: Record<string, CatalogModelEntry[]> = {
  'Maruti Suzuki': [
    { model: 'Swift', defaultFuel: 'Petrol' },
    { model: 'Baleno', defaultFuel: 'Petrol' },
    { model: 'Brezza', defaultFuel: 'Petrol' },
    { model: 'Grand Vitara Smart Hybrid', defaultFuel: 'Hybrid' },
    { model: 'Fronx', defaultFuel: 'Petrol' },
    { model: 'Ertiga', defaultFuel: 'CNG' },
    { model: 'Dzire', defaultFuel: 'Petrol' },
    { model: 'WagonR', defaultFuel: 'CNG' },
    { model: 'Jimny', defaultFuel: 'Petrol' },
    { model: 'Invicto', defaultFuel: 'Hybrid' },
  ],
  Hyundai: [
    { model: 'Creta', defaultFuel: 'Petrol' },
    { model: 'Venue', defaultFuel: 'Petrol' },
    { model: 'i20', defaultFuel: 'Petrol' },
    { model: 'Verna', defaultFuel: 'Petrol' },
    { model: 'Grand i10 Nios', defaultFuel: 'Petrol' },
    { model: 'Exter', defaultFuel: 'Petrol' },
    { model: 'Alcazar', defaultFuel: 'Diesel' },
    { model: 'Tucson', defaultFuel: 'Diesel' },
    { model: 'Ioniq 5', defaultFuel: 'Electric' },
    { model: 'Ioniq Hybrid', defaultFuel: 'Hybrid' },
  ],
  Tata: [
    { model: 'Nexon', defaultFuel: 'Petrol' },
    { model: 'Nexon EV', defaultFuel: 'Electric' },
    { model: 'Punch', defaultFuel: 'Petrol' },
    { model: 'Punch EV', defaultFuel: 'Electric' },
    { model: 'Harrier', defaultFuel: 'Diesel' },
    { model: 'Safari', defaultFuel: 'Diesel' },
    { model: 'Altroz', defaultFuel: 'Petrol' },
    { model: 'Tiago', defaultFuel: 'Petrol' },
    { model: 'Tiago EV', defaultFuel: 'Electric' },
    { model: 'Curvv', defaultFuel: 'Petrol' },
  ],
  Mahindra: [
    { model: 'XUV700', defaultFuel: 'Diesel' },
    { model: 'Scorpio-N', defaultFuel: 'Diesel' },
    { model: 'Thar', defaultFuel: 'Diesel' },
    { model: 'Thar Roxx', defaultFuel: 'Diesel' },
    { model: 'XUV 3XO', defaultFuel: 'Petrol' },
    { model: 'XUV400 EV', defaultFuel: 'Electric' },
    { model: 'BE 6', defaultFuel: 'Electric' },
    { model: 'Bolero Neo', defaultFuel: 'Diesel' },
  ],
  Honda: [
    { model: 'City', defaultFuel: 'Petrol' },
    { model: 'City e:HEV', defaultFuel: 'Hybrid' },
    { model: 'Elevate', defaultFuel: 'Petrol' },
    { model: 'Amaze', defaultFuel: 'Petrol' },
    { model: 'Civic Touring', defaultFuel: 'Petrol' },
    { model: 'Accord Hybrid', defaultFuel: 'Hybrid' },
    { model: 'CR-V', defaultFuel: 'Petrol' },
  ],
  Toyota: [
    { model: 'Innova Hycross', defaultFuel: 'Hybrid' },
    { model: 'Innova Crysta', defaultFuel: 'Diesel' },
    { model: 'Fortuner', defaultFuel: 'Diesel' },
    { model: 'Urban Cruiser Hyryder', defaultFuel: 'Hybrid' },
    { model: 'Glanza', defaultFuel: 'Petrol' },
    { model: 'Camry', defaultFuel: 'Hybrid' },
    { model: 'Corolla', defaultFuel: 'Petrol' },
    { model: 'RAV4 Hybrid', defaultFuel: 'Hybrid' },
  ],
  Kia: [
    { model: 'Seltos', defaultFuel: 'Petrol' },
    { model: 'Sonet', defaultFuel: 'Petrol' },
    { model: 'Carens', defaultFuel: 'Diesel' },
    { model: 'Syros', defaultFuel: 'Petrol' },
    { model: 'EV6', defaultFuel: 'Electric' },
    { model: 'Sportage', defaultFuel: 'Hybrid' },
  ],
  Volkswagen: [
    { model: 'Virtus', defaultFuel: 'Petrol' },
    { model: 'Taigun', defaultFuel: 'Petrol' },
    { model: 'Polo', defaultFuel: 'Petrol' },
    { model: 'Golf', defaultFuel: 'Petrol' },
    { model: 'Tiguan', defaultFuel: 'Petrol' },
  ],
  Skoda: [
    { model: 'Slavia', defaultFuel: 'Petrol' },
    { model: 'Kushaq', defaultFuel: 'Petrol' },
    { model: 'Kylaq', defaultFuel: 'Petrol' },
    { model: 'Kodiaq', defaultFuel: 'Petrol' },
    { model: 'Octavia', defaultFuel: 'Petrol' },
  ],
  MG: [
    { model: 'Hector', defaultFuel: 'Petrol' },
    { model: 'Astor', defaultFuel: 'Petrol' },
    { model: 'ZS EV', defaultFuel: 'Electric' },
    { model: 'Windsor EV', defaultFuel: 'Electric' },
    { model: 'Comet EV', defaultFuel: 'Electric' },
  ],
  Renault: [
    { model: 'Kiger', defaultFuel: 'Petrol' },
    { model: 'Triber', defaultFuel: 'Petrol' },
    { model: 'Kwid', defaultFuel: 'Petrol' },
    { model: 'Clio', defaultFuel: 'Hybrid' },
  ],
  Nissan: [
    { model: 'Magnite', defaultFuel: 'Petrol' },
    { model: 'Qashqai', defaultFuel: 'Hybrid' },
    { model: 'Altima', defaultFuel: 'Petrol' },
    { model: 'Leaf', defaultFuel: 'Electric' },
  ],
  Ford: [
    { model: 'F-150', defaultFuel: 'Petrol' },
    { model: 'EcoSport', defaultFuel: 'Petrol' },
    { model: 'Endeavour', defaultFuel: 'Diesel' },
    { model: 'Mustang', defaultFuel: 'Petrol' },
    { model: 'Escape', defaultFuel: 'Hybrid' },
  ],
  Chevrolet: [
    { model: 'Cruze', defaultFuel: 'Petrol' },
    { model: 'Equinox', defaultFuel: 'Petrol' },
    { model: 'Malibu', defaultFuel: 'Petrol' },
    { model: 'Bolt EV', defaultFuel: 'Electric' },
  ],
  BMW: [
    { model: '320i / 330i', defaultFuel: 'Petrol' },
    { model: 'X1', defaultFuel: 'Petrol' },
    { model: 'X3', defaultFuel: 'Diesel' },
    { model: 'X5', defaultFuel: 'Diesel' },
    { model: 'i4 / iX1', defaultFuel: 'Electric' },
  ],
  'Mercedes-Benz': [
    { model: 'A-Class', defaultFuel: 'Petrol' },
    { model: 'C-Class', defaultFuel: 'Petrol' },
    { model: 'E-Class', defaultFuel: 'Diesel' },
    { model: 'GLA', defaultFuel: 'Petrol' },
    { model: 'GLC', defaultFuel: 'Diesel' },
  ],
  Audi: [
    { model: 'A4', defaultFuel: 'Petrol' },
    { model: 'A6', defaultFuel: 'Petrol' },
    { model: 'Q3', defaultFuel: 'Petrol' },
    { model: 'Q5', defaultFuel: 'Petrol' },
    { model: 'e-tron', defaultFuel: 'Electric' },
  ],
  Tesla: [
    { model: 'Model 3', defaultFuel: 'Electric' },
    { model: 'Model Y', defaultFuel: 'Electric' },
    { model: 'Model S', defaultFuel: 'Electric' },
    { model: 'Model X', defaultFuel: 'Electric' },
  ],
  Jeep: [
    { model: 'Compass', defaultFuel: 'Diesel' },
    { model: 'Meridian', defaultFuel: 'Diesel' },
    { model: 'Wrangler', defaultFuel: 'Petrol' },
  ],
  Volvo: [
    { model: 'XC40 Recharge', defaultFuel: 'Electric' },
    { model: 'XC60', defaultFuel: 'Hybrid' },
    { model: 'XC90', defaultFuel: 'Hybrid' },
  ],
};

export const CATALOG_MANUFACTURERS = Object.keys(AUTOMOTIVE_CATALOG);

export function getModelsForManufacturer(makeInput: string): CatalogModelEntry[] {
  const clean = makeInput.trim().toLowerCase();
  if (!clean) return [];
  const exactKey = CATALOG_MANUFACTURERS.find((k) => k.toLowerCase() === clean);
  if (exactKey) return AUTOMOTIVE_CATALOG[exactKey];
  const partialKey = CATALOG_MANUFACTURERS.find(
    (k) => k.toLowerCase().includes(clean) || clean.includes(k.toLowerCase())
  );
  return partialKey ? AUTOMOTIVE_CATALOG[partialKey] : [];
}

export function inferDefaultFuelForModel(makeInput: string, modelInput: string): FuelType | null {
  const models = getModelsForManufacturer(makeInput);
  const cleanModel = modelInput.trim().toLowerCase();
  if (!cleanModel) return null;
  const exact = models.find((m) => m.model.toLowerCase() === cleanModel);
  if (exact) return exact.defaultFuel;
  if (cleanModel.includes(' ev') || cleanModel.endsWith('ev') || cleanModel.includes('electric')) {
    return 'Electric';
  }
  if (cleanModel.includes('hybrid') || cleanModel.includes('e:hev') || cleanModel.includes('phev')) {
    return 'Hybrid';
  }
  return null;
}

export interface VinDecodeResult {
  vin: string;
  source: 'nhtsa_vpic' | 'iso3779_wmi';
  verifiedModel: boolean;
  manufacturer: string;
  model: string;
  year?: number;
  fuelType: FuelType;
  bodyClass?: string;
  plantCountry?: string;
  note: string;
}

export async function decodeVinViaApi(rawVin: string): Promise<VinDecodeResult> {
  const vin = rawVin.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (vin.length !== 17 || /[IOQ]/.test(vin)) {
    throw new Error('Enter a valid 17-character VIN (excluding I, O, Q).');
  }

  const res = await fetch(`/api/vehicle/vin-decode?vin=${encodeURIComponent(vin)}`);
  const payload = (await res.json()) as VinDecodeResult & { error?: string };
  if (!res.ok) {
    throw new Error(payload.error || 'Unable to decode VIN.');
  }
  return payload;
}
