import { Request, Response } from 'express';
import logger from '../logger';

const EXTERNAL_REQUIREMENTS_URL = process.env.EXTERNAL_REQUIREMENTS_URL || 
  'https://data.arbetsformedlingen.se/accessibility/latest/accessibility-requirements.json';

/**
 * GET /api/requirements
 * Proxy endpoint to fetch requirements from external data source
 * This avoids CORS issues by fetching on the server side
 */
export const getAllRequirements = async (req: Request, res: Response) => {
  try {
    const response = await fetch(EXTERNAL_REQUIREMENTS_URL, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Tillganglighetsverktyget/1.0',
      },
    });

    if (!response.ok) {
      logger.error('External requirements URL returned error', {
        status: response.status,
        statusText: response.statusText,
      });
      return res.status(response.status).json({
        error: `Failed to fetch requirements from external source`,
        status: response.status,
        statusText: response.statusText,
      });
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.data || !Array.isArray(data.data)) {
      logger.error('Invalid response format from external requirements source');
      return res.status(500).json({
        error: 'Invalid response format from external requirements source',
      });
    }

    // Return the data as-is (maintaining the { data: Requirement[] } structure)
    res.json(data);
  } catch (error: any) {
    logger.error('Error fetching requirements from external source', { error });
    res.status(500).json({
      error: 'Failed to fetch requirements',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
