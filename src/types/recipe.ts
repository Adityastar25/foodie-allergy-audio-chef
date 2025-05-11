
export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  preparationTime?: string;
  servings?: number;
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
  recipe: Recipe;
  success: boolean;
  error?: string;
}
