
import { RecipeRequest, GeminiResponse, Recipe } from "../types/recipe";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const generateRecipe = async (request: RecipeRequest): Promise<GeminiResponse> => {
  try {
    if (!SUPABASE_URL) {
      return {
        recipes: [],
        success: false,
        error: "Supabase configuration is missing. Please connect to Supabase first."
      };
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        ingredients: request.ingredients,
        allergies: request.allergies,
        cuisineType: request.cuisineType,
        dietaryPreference: request.dietaryPreference
      })
    });

    if (!response.ok) {
      throw new Error(`Edge function request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      recipes: data.recipes || [],
      success: data.success || false,
      error: data.error
    };
    
  } catch (error) {
    console.error("Error generating recipe:", error);
    return {
      recipes: [],
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate recipe"
    };
  }
};
