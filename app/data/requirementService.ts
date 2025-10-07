import { ObjectType, type Requirement } from './types';

const requirementsPath = import.meta.env.VITE_REQUIREMENTS_URL;

export const RequirementService = {
  async getAllRequirements(objectType: ObjectType): Promise<Requirement[]> {
    const res = await fetch(requirementsPath);
    if (!res.ok) {
      throw new Error(
        `Failed to load requirements from ${requirementsPath}: ${res.status} ${res.statusText}`,
      );
    }
    const json: { data: Requirement[] } = await res.json();
    if (!Array.isArray(json.data)) {
      throw new Error('Invalid requirements data format');
    }
    return json.data
      .filter((req) => req.objectType === objectType)
      .filter((req) => req.type === 'requirement');
  },

  async getAllRequirementCategories(objectType: ObjectType): Promise<string[]> {
    const res = await fetch(requirementsPath);
    if (!res.ok) {
      throw new Error(
        `Failed to load requirement categories from ${requirementsPath}: ${res.status} ${res.statusText}`,
      );
    }
    const json: { data: Requirement[] } = await res.json();
    if (!Array.isArray(json.data)) {
      throw new Error('Invalid requirement categories data format');
    }
    const categories = Array.from(
      new Set(json.data.filter((req) => req.objectType === objectType).map((req) => req.category)),
    );
    return categories;
  },

  async getAllRequirementContentTypes(objectType: ObjectType): Promise<string[]> {
    const res = await fetch(requirementsPath);
    if (!res.ok) {
      throw new Error(
        `Failed to load requirement content types from ${requirementsPath}: ${res.status} ${res.statusText}`,
      );
    }
    const json: { data: Requirement[] } = await res.json();
    if (!Array.isArray(json.data)) {
      throw new Error('Invalid requirement content types data format');
    }
    const contentTypes = Array.from(
      new Set(
        json.data
          .filter((req) => req.objectType === objectType)
          .map((req) => req.contentType)
          .filter(Boolean) as string[],
      ),
    );
    return contentTypes;
  },
};
