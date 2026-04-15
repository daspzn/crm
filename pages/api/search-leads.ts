import type { NextApiRequest, NextApiResponse } from 'next';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface FoundLead {
  businessName: string;
  niche: string;
  city: string;
  contact: string;
  projectValue: number;
  notes: string;
}

function generateProjectValue(niche: string): number {
  const values: Record<string, [number, number]> = {
    'restaurante': [1200, 3500],
    'pizzaria': [1200, 3000],
    'dentista': [2500, 6000],
    'fotógrafo': [800, 2500],
    'clínica estética': [2000, 5000],
    'advogado': [1500, 4000],
    'personal trainer': [1000, 3000],
    'barbearia': [1000, 2500],
    'academia': [1500, 4000],
    'pet shop': [1000, 2800],
    'consultório médico': [2500, 5500],
    'arquiteto': [2000, 5000],
    'default': [1000, 3000]
  };
  const [min, max] = values[niche.toLowerCase().trim()] || values['default'];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FoundLead[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { niche, city, limit = '5' } = req.query;

  if (!niche || !city) {
    return res.status(400).json({ error: 'Niche and city are required' });
  }

  if (!GOOGLE_PLACES_API_KEY) {
    console.error('GOOGLE_PLACES_API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured. Please set GOOGLE_PLACES_API_KEY in .env.local' });
  }

  try {
    const searchQuery = `${niche} em ${city}`;
    const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR&region=br`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return res.status(500).json({
        error: `Google Places API error: ${data.status}`,
        details: data.error_message || 'Unknown error'
      });
    }

    const places = (data.results || []).slice(0, parseInt(limit as string, 10) || 5);

    const leads: FoundLead[] = places.map((place: any) => ({
      businessName: place.name,
      niche: niche as string,
      city: city as string,
      contact: place.formatted_address || place.vicinity || 'Sem endereço',
      projectValue: generateProjectValue(niche as string),
      notes: `Negócio encontrado via Google Places. Rating: ${place.rating || 'N/A'}/5`
    }));

    return res.status(200).json(leads);
  } catch (error) {
    console.error('Error searching leads:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
