import { Request, Response } from 'express';
import logger from '../logger';
import path from 'path';
import fs from 'fs';

// TODO: Fungerar inte att hämta kraven från podden på OCP- felsök senare
// const EXTERNAL_REQUIREMENTS_URL = 'https://data.arbetsformedlingen.se/accessibility/latest/accessibility-requirements.json';

const dataPath = path.resolve(__dirname, '../data/requirements.json');

/**
 * GET /api/requirements
 * Proxy endpoint to fetch requirements from external data source
 * This avoids CORS issues by fetching on the server side
 */
export const getAllRequirements = async (req: Request, res: Response) => {
  try {
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    const requirements = JSON.parse(jsonData);
    res.json(requirements);
  } catch (error: Error | unknown) {
    logger.error('Error fetching requirements from external source', { error });
    res.status(500).json({
      error: 'Failed to fetch requirements'
    });
  }
};
