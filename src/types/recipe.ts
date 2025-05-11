
export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  preparationTime?: string;
  servings?: number;
  dietaryPreference?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export interface RecipeRequest {
  ingredients: string[];
  allergies: string[];
  cuisineType: string;
  dietaryPreference?: string;
}

export interface GeminiResponse {
  recipes: Recipe[];  // Changed from single recipe to array of recipes
  success: boolean;
  error?: string;
}
