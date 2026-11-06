import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Route: Auto-format raw thoughts into structured community initiatives
app.post('/api/gemini/parse-initiative', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // If no API key is available, use heuristic fallback
  if (!process.env.GEMINI_API_KEY) {
    const fallback = generateFallbackInitiative(prompt);
    return res.json({ initiative: fallback, source: 'heuristic' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are Sandigan's AI Grassroots Initiative Coordinator in Northern Mindanao (Cagayan de Oro, Bukidnon, Misamis Oriental, etc.). 
Analyze this raw thought or informal volunteer call and transform it into a well-structured, inspiring community drive:
"${prompt}"

Extract or intelligently infer:
1. title: Inspiring, concise, action-oriented title (e.g. "Macajalar Bay Coastal Cleanup", "Dahilayan Reforestation Day")
2. category: One of ["Environment", "Education", "Community Relief", "Disaster Response", "Health", "Animal Welfare", "Livelihood"]
3. date: Human-readable date and time (e.g., "This Saturday, 6:30 AM" or "Nov 15, 8:00 AM")
4. location: Specific venue and location in CDO/Bukidnon/Philippines (e.g. "Opol Beach, Misamis Oriental" or "Carmen Gym, Cagayan de Oro")
5. description: Clear 2-3 sentence overview of the mission, why it matters, and what volunteers will do.
6. capacity: Realistic recommended volunteer count as an integer (default 15-30 if unspecified)
7. whatToBring: An array of 3-5 recommended items for volunteers (e.g. "Reusable water tumbler", "Work/gardening gloves", "Extra t-shirt", "Hat/sunscreen")
8. meetPoint: Specific meeting or rendezvous landmark (e.g. "Near the lighthouse boardwalk entrance")
9. organizerName: Suggested grassroots organizer/team name (e.g. "Kagay-an Eco Champions" or "Bukidnon Youth Circle")
10. impactGoal: 1 punchy sentence summarizing the targeted community impact (e.g. "Target: Collect 30 sacks of beach waste and protect marine sanctuary.")`,
      config: {
        systemInstruction: "You are an expert civic organizer and community coordinator specializing in grassroots mobilization in the Philippines.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            date: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            capacity: { type: Type.INTEGER },
            whatToBring: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            meetPoint: { type: Type.STRING },
            organizerName: { type: Type.STRING },
            impactGoal: { type: Type.STRING },
          },
          required: ["title", "category", "date", "location", "description", "capacity", "whatToBring"],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ initiative: parsed, source: 'gemini' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const fallback = generateFallbackInitiative(prompt);
    return res.json({ initiative: fallback, source: 'fallback', error: error?.message });
  }
});

// Heuristic fallback generator
function generateFallbackInitiative(prompt: string) {
  const p = prompt.toLowerCase();
  let category = 'Environment';
  if (p.includes('teach') || p.includes('school') || p.includes('book') || p.includes('code') || p.includes('child') || p.includes('student') || p.includes('education') || p.includes('reading')) {
    category = 'Education';
  } else if (p.includes('flood') || p.includes('relief') || p.includes('calamity') || p.includes('repack') || p.includes('typhoon') || p.includes('emergency')) {
    category = 'Disaster Response';
  } else if (p.includes('food') || p.includes('pantry') || p.includes('feed') || p.includes('elderly') || p.includes('shelter')) {
    category = 'Community Relief';
  } else if (p.includes('medical') || p.includes('health') || p.includes('blood') || p.includes('dental')) {
    category = 'Health';
  } else if (p.includes('dog') || p.includes('cat') || p.includes('animal') || p.includes('shelter')) {
    category = 'Animal Welfare';
  }

  const capMatch = prompt.match(/(\d+)\s*(volunteers?|people|pax|slots?|persons?)/i);
  const capacity = capMatch ? parseInt(capMatch[1], 10) : 20;

  let location = 'Cagayan de Oro City Center';
  if (p.includes('opol')) location = 'Opol Beach Coastal Park, Misamis Oriental';
  else if (p.includes('bukidnon')) location = 'Malaybalay City Ground, Bukidnon';
  else if (p.includes('dahilayan') || p.includes('manolo')) location = 'Manolo Fortich, Bukidnon';
  else if (p.includes('carmen')) location = 'Carmen Community Center, Cagayan de Oro';
  else if (p.includes('macabalan') || p.includes('bonbon')) location = 'Bonbon Shoreline, Cagayan de Oro';
  else if (p.includes('claveria')) location = 'Claveria Upland Reforestation Site';

  let date = 'This Saturday, 7:00 AM';
  if (p.includes('tomorrow')) date = 'Tomorrow, 6:30 AM';
  else if (p.includes('sunday')) date = 'This Sunday, 7:00 AM';
  else if (p.includes('next week')) date = 'Next Saturday, 8:00 AM';

  const cleanTitle = prompt
    .replace(/(need|looking for|want|please help|volunteers?)/gi, '')
    .trim()
    .slice(0, 48);

  const title = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : 'Grassroots Community Action Drive';

  return {
    title: title.length > 8 ? title : 'Bayanihan Community Drive',
    category,
    date,
    location,
    description: prompt.length > 20 ? prompt : `${prompt}. Join fellow community volunteers to make an immediate, tangible grassroots impact!`,
    capacity: Math.max(5, Math.min(150, capacity)),
    whatToBring: [
      'Reusable water tumbler',
      'Personal hat & sun protection',
      'Work or heavy gardening gloves',
      'Extra clothes & towel',
    ],
    meetPoint: 'Main plaza entrance near the community marker',
    organizerName: 'Sandigan Community Volunteers',
    impactGoal: 'Direct grassroots community empowerment and environmental stewardship.',
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Sandigan server running on http://localhost:${port}`);
  });
}

startServer();
