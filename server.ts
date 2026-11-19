import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.NODE_ENV === 'production' ? Number(process.env.PORT) || 3000 : 3000;

interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantRequestBody {
  message?: string;
  history?: ChatHistoryMessage[];
  vehicleContext?: {
    label?: string;
    year?: number;
    fuelType?: string;
    odometerKm?: number;
    healthScore?: number;
    isDemoData?: boolean;
  } | null;
  activeCodesContext?: Array<{
    code: string;
    name: string;
    severity: string;
  }>;
}

const SYSTEM_INSTRUCTION = `You are AutoSense AI, an intelligent, cautious automotive diagnostic assistant designed for everyday car owners, young drivers, and families.

Your responsibilities:
1. Explain dashboard warning lights, universal and manufacturer-specific OBD-II diagnostic trouble codes (e.g., P0300, P0171, P0420, P1610, B2799, U0100), routine maintenance intervals, and vehicle health readings in clear, reassuring, plain English across all makes and models.
2. Always assess safety first:
   - If a user describes symptoms like flashing Check Engine Light, severe overheating, brake failure, fuel smell, loss of steering/power, or red battery/oil pressure lights, immediately advise pulling over safely and seeking professional roadside or mechanic assistance.
3. Strict diagnostic honesty & risk-gated sensor-bypass safety:
   - Never claim an OBD-II error code alone confirms a specific broken part. Explain that a trouble code indicates which circuit or system reported an anomaly, and list possible causes that a qualified technician can verify.
   - If a driver asks about bypassing sensors to control the car up to a safe limit and reach a service center: explain clearly that only non-critical / low-to-moderate risk faults (such as EVAP, secondary O2 heaters, or ECU limp-home fallback maps) can be managed or cleared under strict workshop transit limits (e.g., 25–55 km/h speed cap, 2,000–3,000 RPM ceiling, short distance to workshop), while very high-risk safety systems (crank/cam timing P0335/P0340, immobilizers P1610/B2799, fuel-rail pressure P0087, severe coolant overheat P0217, EV high-voltage isolation P0AA6, brake hydraulics, and airbags) MUST remain locked and CANNOT be bypassed by an OBD-II app. Also note honestly that physical RPM/speed limiting relies on the vehicle ECU's limp-home calibration rather than generic Mode $04 fault clearing.
   - Never recommend unsafe DIY repairs (such as jumpering relays/sensors, opening pressurized coolant caps when hot, working on airbags, brake hydraulics, fuel lines, or high-voltage hybrid/EV systems).
4. Context awareness:
   - If vehicle or active trouble code context is provided, reference it accurately. If the context is marked as DEMO DATA, acknowledge that you are referencing their demonstration vehicle profile.
   - If insufficient data is provided to identify a mechanical issue, state clearly what information or professional inspection is needed.
5. Keep answers well-structured with concise headings or short bullet points so drivers can scan quickly on mobile or desktop.`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'autosense-api' });
  });

  app.get('/api/vehicle/vin-decode', async (req: Request, res: Response) => {
    const rawVin = typeof req.query.vin === 'string' ? req.query.vin : '';
    const vin = rawVin.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (vin.length !== 17 || /[IOQ]/.test(vin)) {
      res.status(400).json({
        error: 'Enter a valid 17-character VIN (letters A–Z excluding I, O, Q and digits 0–9).',
      });
      return;
    }

    const YEAR_MAP: Record<string, number> = {
      A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017,
      J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023, R: 2024, S: 2025,
      T: 2026, V: 2027, W: 2028, X: 2029, Y: 2030,
      '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
      '6': 2006, '7': 2007, '8': 2008, '9': 2009,
    };
    const WMI_MAP: Record<string, { make: string; country: string }> = {
      MA1: { make: 'Mahindra', country: 'India' },
      MA3: { make: 'Maruti Suzuki', country: 'India' },
      MA6: { make: 'General Motors India', country: 'India' },
      MA7: { make: 'Honda Cars India', country: 'India' },
      MAK: { make: 'Honda', country: 'India' },
      MAL: { make: 'Hyundai', country: 'India' },
      MAT: { make: 'Tata Motors', country: 'India' },
      MBH: { make: 'Suzuki / Maruti Suzuki', country: 'India' },
      MBJ: { make: 'Toyota Kirloskar', country: 'India' },
      MC2: { make: 'Volvo Eicher', country: 'India' },
      MDH: { make: 'Nissan India', country: 'India' },
      MEE: { make: 'Renault India', country: 'India' },
      MEX: { make: 'Skoda / Volkswagen India', country: 'India' },
      MHR: { make: 'Honda', country: 'Asia' },
      MRH: { make: 'Honda', country: 'Thailand' },
      '1HG': { make: 'Honda', country: 'United States' },
      '19X': { make: 'Honda', country: 'United States' },
      '2HG': { make: 'Honda', country: 'Canada' },
      '1FA': { make: 'Ford', country: 'United States' },
      '1FT': { make: 'Ford', country: 'United States' },
      '1G1': { make: 'Chevrolet', country: 'United States' },
      '4T1': { make: 'Toyota', country: 'United States' },
      JTD: { make: 'Toyota', country: 'Japan' },
      JHM: { make: 'Honda', country: 'Japan' },
      KMH: { make: 'Hyundai', country: 'South Korea' },
      KNA: { make: 'Kia', country: 'South Korea' },
      KND: { make: 'Kia', country: 'South Korea' },
      '5YJ': { make: 'Tesla', country: 'United States' },
      '7SA': { make: 'Tesla', country: 'United States' },
      WBA: { make: 'BMW', country: 'Germany' },
      WBS: { make: 'BMW M', country: 'Germany' },
      WDB: { make: 'Mercedes-Benz', country: 'Germany' },
      WDD: { make: 'Mercedes-Benz', country: 'Germany' },
      W1K: { make: 'Mercedes-Benz', country: 'Germany' },
      WAU: { make: 'Audi', country: 'Germany' },
      WVW: { make: 'Volkswagen', country: 'Germany' },
      WVG: { make: 'Volkswagen', country: 'Germany' },
      TMB: { make: 'Skoda', country: 'Czechia' },
      VF1: { make: 'Renault', country: 'France' },
      VF3: { make: 'Peugeot', country: 'France' },
      SJN: { make: 'Nissan', country: 'United Kingdom' },
      SAJ: { make: 'Jaguar', country: 'United Kingdom' },
      SAL: { make: 'Land Rover', country: 'United Kingdom' },
      YV1: { make: 'Volvo', country: 'Sweden' },
    };

    const isoYear = YEAR_MAP[vin[9]];
    const wmi = WMI_MAP[vin.slice(0, 3)];

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const apiRes = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (apiRes.ok) {
        const json = (await apiRes.json()) as {
          Results?: Array<Record<string, string>>;
        };
        const row = json.Results?.[0];
        if (row) {
          const nhtsaMake = (row.Make || '').trim();
          const nhtsaModel = (row.Model || '').trim();
          const nhtsaYear = Number(row.ModelYear) || isoYear;
          const rawFuel = (row.FuelTypePrimary || '').trim();
          const fuelLower = rawFuel.toLowerCase();
          const mappedFuel = fuelLower.includes('electric')
            ? fuelLower.includes('hybrid') || row.ElectrificationLevel?.toLowerCase().includes('hev')
              ? 'Hybrid'
              : 'Electric'
            : fuelLower.includes('diesel')
            ? 'Diesel'
            : fuelLower.includes('cng') || fuelLower.includes('compressed natural')
            ? 'CNG'
            : fuelLower.includes('hybrid')
            ? 'Hybrid'
            : 'Petrol';

          if (nhtsaMake && nhtsaModel) {
            res.json({
              vin,
              source: 'nhtsa_vpic',
              verifiedModel: true,
              manufacturer: nhtsaMake,
              model: row.Trim ? `${nhtsaModel} ${row.Trim}`.trim() : nhtsaModel,
              year: nhtsaYear || 2022,
              fuelType: mappedFuel,
              bodyClass: (row.BodyClass || '').trim(),
              plantCountry: (row.PlantCountry || wmi?.country || '').trim(),
              note: `Verified via NHTSA vPIC VIN Registry: ${nhtsaYear || ''} ${nhtsaMake} ${nhtsaModel}`.trim(),
            });
            return;
          }
        }
      }
    } catch {
      // Fallback to deterministic ISO 3779 WMI/Year decode below
    }

    if (wmi) {
      res.json({
        vin,
        source: 'iso3779_wmi',
        verifiedModel: false,
        manufacturer: wmi.make,
        model: '',
        year: isoYear || undefined,
        fuelType: 'Petrol',
        bodyClass: '',
        plantCountry: wmi.country,
        note: `ISO 3779 VIN decoded manufacturer (${wmi.make}, ${wmi.country})${isoYear ? ` and model year (${isoYear})` : ''}. Enter the exact model trim if not listed in NHTSA.`,
      });
      return;
    }

    res.status(404).json({
      error:
        'VIN not found in NHTSA vPIC or standard WMI tables. Please verify the 17 characters or enter Make and Model manually.',
    });
  });

  app.post('/api/ai/assistant', async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(503).json({
          error: 'AutoSense AI is unavailable because GEMINI_API_KEY is not configured in Settings > Secrets.',
        });
        return;
      }

      const body = req.body as AssistantRequestBody;
      const userMessage = typeof body.message === 'string' ? body.message.trim() : '';

      if (!userMessage) {
        res.status(400).json({ error: 'Please enter a question for AutoSense AI.' });
        return;
      }

      if (userMessage.length > 2000) {
        res.status(400).json({ error: 'Question is too long. Please keep your message under 2000 characters.' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contextLines: string[] = [];
      if (body.vehicleContext?.label) {
        contextLines.push(
          `Active Vehicle: ${body.vehicleContext.label}` +
            (body.vehicleContext.year ? ` (${body.vehicleContext.year})` : '') +
            (body.vehicleContext.fuelType ? `, Fuel: ${body.vehicleContext.fuelType}` : '') +
            (typeof body.vehicleContext.odometerKm === 'number'
              ? `, Odometer: ${body.vehicleContext.odometerKm.toLocaleString()} km`
              : '') +
            (typeof body.vehicleContext.healthScore === 'number'
              ? `, Last Health Score: ${body.vehicleContext.healthScore}/100`
              : '') +
            (body.vehicleContext.isDemoData ? ' [DEMO DATA]' : '')
        );
      }

      if (Array.isArray(body.activeCodesContext) && body.activeCodesContext.length > 0) {
        const codesSummary = body.activeCodesContext
          .slice(0, 10)
          .map((c) => `${c.code} (${c.name}, Severity: ${c.severity})`)
          .join('; ');
        contextLines.push(`Detected Codes in Recent Scan: ${codesSummary}`);
      }

      const historyText = Array.isArray(body.history)
        ? body.history
            .slice(-6)
            .map((m) => `${m.role === 'user' ? 'Driver' : 'AutoSense AI'}: ${m.content}`)
            .join('\n')
        : '';

      const promptParts: string[] = [];
      if (contextLines.length > 0) {
        promptParts.push(`Vehicle Context:\n${contextLines.join('\n')}`);
      }
      if (historyText) {
        promptParts.push(`Recent Conversation:\n${historyText}`);
      }
      promptParts.push(`Driver Question: ${userMessage}`);

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptParts.join('\n\n'),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'AutoSense AI returned an empty response. Please try again.' });
        return;
      }

      res.json({ reply });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unexpected AI service error.';
      console.error('AutoSense AI error:', message);
      res.status(500).json({
        error: `Unable to reach AutoSense AI right now (${message}). Please verify your API key in Settings > Secrets and try again.`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoSense server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
