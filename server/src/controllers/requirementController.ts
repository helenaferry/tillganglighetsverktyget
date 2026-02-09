import { Request, Response } from 'express';

const EXTERNAL_API_URL = process.env.OPEN_DATA_PORTAL_API_URL || 
  'https://data.arbetsformedlingen.se/accessibility/accessibility-requirements.json';

/**
 * GET /api/requirements
 * Proxy endpoint to fetch requirements from external API
 * This avoids CORS issues by fetching on the server side
 */
export const getAllRequirements = async (req: Request, res: Response) => {
  try {
    const response = await fetch(EXTERNAL_API_URL, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Tillganglighetsverktyget/1.0',
      },
    });

    if (!response.ok) {
      console.error(`External API returned ${response.status}: ${response.statusText}`);
      return res.status(response.status).json({
        error: `Failed to fetch requirements from external API`,
        status: response.status,
        statusText: response.statusText,
      });
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.error('Invalid response format from external API');
      return res.status(500).json({
        error: 'Invalid response format from external API',
      });
    }

    // Return the data as-is (maintaining the { data: Requirement[] } structure)
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching requirements from external API:', error);
    res.status(500).json({
      error: 'Failed to fetch requirements',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
