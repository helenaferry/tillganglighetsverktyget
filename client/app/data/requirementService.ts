import { apiClient } from './apiClient';
import { standaloneClient } from './standaloneClient';
import { ObjectType, type Requirement } from './types';
import { STANDALONE_CLIENT } from '../../public/standaloneConfiguration.js'

/**
 * Check if we're in standalone mode
 */
function isStandaloneMode(): boolean {
  return STANDALONE_CLIENT
}

/**
 * Fetch and parse requirements from local JSON file
 * Shared helper function used by both standaloneClient and fallback logic
 */
async function fetchLocalRequirements(): Promise<Requirement[]> {
  const urlToLocalFile = '/krav.json';
  const res = await fetch(urlToLocalFile);
  if (!res.ok) {
    throw new Error(
      `Failed to load requirements from ${urlToLocalFile}: ${res.status} ${res.statusText}`,
    );
  }
  const json: { data: Requirement[] } = await res.json();
  if (!json || !json.data || !Array.isArray(json.data)) {
    throw new Error('Invalid requirements data format: expected { data: Requirement[] }');
  }

  return json.data;
}

export const RequirementService = {
  async getAllRequirements(regulatoryFramework: string = ''): Promise<Requirement[]> {
    let requirements: Requirement[] = [];

    // In standalone mode, always use standaloneClient (no fallback)
    if (isStandaloneMode()) {
      try {
        requirements = await standaloneClient.requirements.getAllRequirements();
      } catch (error) {
        console.error(`Failed to load requirements in standalone mode: ${error}`);
        throw new Error(`Failed to load requirements from local file: ${error}`);
      }
    } else {
      // In non-standalone mode, try API first, then fallback to local file
      try {
        requirements = await apiClient.requirements.getAllRequirements();
      } catch (error) {
        console.warn(`Failed to load requirements from API: ${error}. Falling back to local file.`);
        try {
          requirements = await fetchLocalRequirements();
        } catch (fallbackError) {
          console.error(`Failed to load requirements from local file: ${fallbackError}`);
          throw new Error(
            `Failed to load requirements from API or local file: ${error}. Fallback also failed: ${fallbackError}`,
          );
        }
      }
    }

    // Filter by regulatory framework if specified
    if (regulatoryFramework) {
      return requirements.filter((req) =>
        req.regulatoryFramework.split(',').includes(regulatoryFramework),
      );
    }
    return requirements;
  },

  /**
   * Get requirements from local JSON file
   * Public method for direct access to local requirements
   */
  async getLocalRequirements(): Promise<Requirement[]> {
    return fetchLocalRequirements();
  },

  async getAllRequirementCategories(objectType: ObjectType): Promise<string[]> {
    let requirements: Requirement[] = [];
    try {
      requirements = await this.getAllRequirements();
    } catch (error) {
      throw new Error(`Failed to load requirement categories: ${error}`);
    }

    if (!Array.isArray(requirements)) {
      throw new Error('Invalid requirement categories data format');
    }
    const categories = Array.from(
      new Set(
        requirements.filter((req) => req.objectType === objectType).map((req) => req.category),
      ),
    );
    return categories;
  },

  async getAllRequirementContentTypes(objectType: ObjectType): Promise<string[]> {
    let requirements: Requirement[] = [];
    try {
      requirements = await this.getAllRequirements();
    } catch (error) {
      throw new Error(`Failed to load requirement content types: ${error}`);
    }
    if (!Array.isArray(requirements)) {
      throw new Error('Invalid requirement content types data format');
    }
    const contentTypes = Array.from(
      new Set(
        requirements.filter((req) => req.objectType === objectType).map((req) => req.contentType),
      ),
    ).filter((type) => type && type.trim().length > 0);
    return contentTypes;
  },
};
