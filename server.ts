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
1. Explain dashboard warning lights, OBD-II diagnostic trouble codes (e.g., P0300, P0171, P0420), routine maintenance intervals, and vehicle health readings in clear, reassuring, plain English.
2. Always assess safety first:
   - If a user describes symptoms like flashing Check Engine Light, severe overheating, brake failure, fuel smell, loss of steering/power, or red battery/oil pressure lights, immediately advise pulling over safely and seeking professional roadside or mechanic assistance.
3. Strict diagnostic honesty:
   - Never claim an OBD-II error code alone confirms a specific broken part. Explain that a trouble code indicates which circuit or system reported an anomaly, and list possible causes that a qualified technician can verify.
   - Never recommend unsafe DIY repairs (such as opening pressurized coolant caps when hot, working on airbags, brake hydraulics, fuel lines, or high-voltage hybrid/EV systems).
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
