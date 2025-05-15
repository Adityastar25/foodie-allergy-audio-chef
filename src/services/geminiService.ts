
import { RecipeRequest, GeminiResponse, Recipe } from "../types/recipe";
import { toast } from "@/hooks/use-toast";

// Replace this with your actual Gemini API key
// For production, this should be stored in environment variables or secure storage
let GEMINI_API_KEY = "";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const GEMINI_IMAGE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent";

// Function to set the API key
export const setGeminiApiKey = (key: string) => {
  GEMINI_API_KEY = key;
  localStorage.setItem("gemini-api-key", key); // Store in localStorage for persistence
  return true;
};

// Function to get the API key (from localStorage if available)
export const getGeminiApiKey = (): string => {
  if (!GEMINI_API_KEY) {
    const storedKey = localStorage.getItem("gemini-api-key");
    if (storedKey) {
      GEMINI_API_KEY = storedKey;
    }
  }
  return GEMINI_API_KEY;
};

// Generate recipes using Gemini API
export const generateRecipesWithGemini = async (request: RecipeRequest): Promise<GeminiResponse> => {
  try {
    const apiKey = getGeminiApiKey();
    
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please set your Google Gemini API key first.",
        variant: "destructive",
      });
      return {
        recipes: [],
        success: false,
        error: "API Key not provided"
      };
    }

    const prompt = generateRecipePrompt(request);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to generate recipes");
    }

    const data = await response.json();
    
    // Process the Gemini API response to extract recipe information
    const recipes = parseGeminiResponse(data);
    
    // Generate images for each recipe
    for (let i = 0; i < recipes.length; i++) {
      try {
        // Generate an image for each recipe asynchronously
        const imageUrl = await generateRecipeImage(recipes[i].title);
        if (imageUrl) {
          recipes[i].imageUrl = imageUrl;
        }
      } catch (error) {
        console.error(`Failed to generate image for recipe ${i + 1}:`, error);
        // Continue with the next recipe if image generation fails
      }
    }
    
    return {
      recipes,
      success: true
    };
    
  } catch (error) {
    console.error("Error generating recipes:", error);
    toast({
      title: "Recipe Generation Failed",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive",
    });
    
    return {
      recipes: [],
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate recipes"
    };
  }
};

// Generate an image for a recipe using Unsplash API (as Gemini doesn't generate images)
const generateRecipeImage = async (recipeTitle: string): Promise<string> => {
  try {
    // Using Unsplash API for image generation since Gemini Pro doesn't generate images
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(recipeTitle + " food")}&per_page=1`, {
      headers: {
        'Authorization': 'Client-ID YOUR_UNSPLASH_ACCESS_KEY' // Replace with your Unsplash API key
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
    
    // Use a fallback food image URL
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
    
  } catch (error) {
    console.error("Error generating image:", error);
    // Return a fallback image URL
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
  }
};

// Generate prompt for recipe creation
const generateRecipePrompt = (request: RecipeRequest): string => {
  return `Generate 3 different detailed recipes with the following requirements:
    
    Available ingredients: ${request.ingredients.join(', ')}
    
    Allergies to avoid: ${request.allergies.length > 0 ? request.allergies.join(', ') : 'None'}
    
    Cuisine type: ${request.cuisineType}
    
    Dietary preference: ${request.dietaryPreference || 'None specified'}
    
    Please format the response as a JSON array with each recipe having the following structure:
    {
      "title": "Recipe Title",
      "ingredients": ["ingredient 1", "ingredient 2", ...],
      "instructions": ["step 1", "step 2", ...],
      "preparationTime": "X minutes",
      "servings": X,
      "dietaryPreference": "${request.dietaryPreference || 'standard'}",
      "nutritionalInfo": {
        "calories": X,
        "protein": X,
        "carbs": X,
        "fat": X
      }
    }
    
    Only respond with the JSON data and nothing else. Do not include any explanations or text outside of the JSON structure.`;
};

// Parse Gemini API response to extract recipe information
const parseGeminiResponse = (response: any): Recipe[] => {
  try {
    const text = response.candidates[0].content.parts[0].text;
    
    // Extract JSON array from response text
    let jsonString = text;
    
    // Handle cases where the response might have markdown code blocks or extra text
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      jsonString = jsonMatch[1] || jsonMatch[0];
    }
    
    // Find the first occurrence of '[' and the last occurrence of ']'
    const startIdx = jsonString.indexOf('[');
    const endIdx = jsonString.lastIndexOf(']');
    
    if (startIdx !== -1 && endIdx !== -1) {
      jsonString = jsonString.substring(startIdx, endIdx + 1);
    }
    
    // Parse the JSON string to get the recipes array
    const recipes: Recipe[] = JSON.parse(jsonString);
    
    // Validate and clean up recipe data
    return recipes.map(recipe => ({
      title: recipe.title || "Untitled Recipe",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
      imageUrl: recipe.imageUrl || undefined,
      preparationTime: recipe.preparationTime || "30 minutes",
      servings: recipe.servings || 4,
      dietaryPreference: recipe.dietaryPreference,
      nutritionalInfo: recipe.nutritionalInfo || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    }));
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to parse recipe data from API response");
  }
};
