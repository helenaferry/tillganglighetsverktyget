import { type Requirement } from "./types";

export const RequirementService = {
    async getAllRequirements(path: string = "/krav.json"): Promise<Requirement[]> {
        const res = await fetch(path);
        if (!res.ok) {
            throw new Error(`Failed to load requirements from ${path}: ${res.status} ${res.statusText}`);
        }
        const json: { data: Requirement[] } = await res.json();
        if (!Array.isArray(json.data)) {
            throw new Error("Invalid requirements data format");
        }
        return json.data;
    },

    async getAllRequirementCategories(path: string = "/krav.json"): Promise<string[]> {
        const res = await fetch(path);
        if (!res.ok) {
            throw new Error(`Failed to load requirement categories from ${path}: ${res.status} ${res.statusText}`);
        }
        const json: { data: Requirement[] } = await res.json();
        if (!Array.isArray(json.data)) {
            throw new Error("Invalid requirement categories data format");
        }
        const categories = Array.from(new Set(json.data.map(req => req.category)));
        return categories;
    },

    async getAllRequirementContentTypes(path: string = "/krav.json"): Promise<string[]> {
        const res = await fetch(path);
        if (!res.ok) {
            throw new Error(`Failed to load requirement content types from ${path}: ${res.status} ${res.statusText}`);
        }
        const json: { data: Requirement[] } = await res.json();
        if (!Array.isArray(json.data)) {
            throw new Error("Invalid requirement content types data format");
        }
        const contentTypes = Array.from(new Set(json.data.map(req => req.contentType).filter(Boolean) as string[]));
        return contentTypes;
    },
};