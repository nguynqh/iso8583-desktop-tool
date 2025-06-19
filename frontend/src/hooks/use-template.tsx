"use client";
import { useState, useEffect } from "react";

import { loadAllTemplates } from "@/utils/loadTemplates";

interface Template {
    name: string;
    fileName: string;
    data: any;
}

export const useTemplate = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const loadedTemplates = loadAllTemplates();
            setTemplates(loadedTemplates);
            setLoading(false);
        } catch (error) {
            console.error("Error loading templates:", error);
            setError("Failed to load templates");
            setLoading(false);
        }
    }, []);

    return { templates, loading, error };
};