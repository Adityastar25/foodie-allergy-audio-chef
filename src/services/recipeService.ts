
import { RecipeRequest, GeminiResponse, Recipe } from "../types/recipe";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

export const generateRecipe = async (request: RecipeRequest): Promise<GeminiResponse> => {
  try {
    const apiKey = localStorage.getItem('gemini_api_key');
    
    if (!apiKey) {
      return {
        recipes: [],
        success: false,
        error: "Please enter your Gemini API key first"
      };
    }

    const prompt = generatePrompt(request);
    
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
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response format from Gemini API");
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log("Gemini response:", generatedText);
    
    // Parse the JSON response
    const parsedRecipes = parseGeminiResponse(generatedText);
    
    return {
      recipes: parsedRecipes,
      success: true
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

const generatePrompt = (request: RecipeRequest): string => {
  const numberOfRecipes = 3;
  
  return `Generate ${numberOfRecipes} different detailed recipes based on the following requirements:

Available ingredients: ${request.ingredients.join(', ')}
${request.allergies.length > 0 ? `Allergies to avoid: ${request.allergies.join(', ')}` : ''}
Cuisine type: ${request.cuisineType}
${request.dietaryPreference ? `Dietary preference: ${request.dietaryPreference}` : ''}

Please respond with ONLY a valid JSON array in this exact format (no additional text or markdown):

[
  {
    "title": "Recipe Name",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
    "instructions": ["Step 1: Do this", "Step 2: Do that", "Step 3: Final step"],
    "imageUrl": "https://images.unsplash.com/photo-appropriate-food-image",
    "preparationTime": "30 minutes",
    "servings": 4,
    "nutritionalInfo": {
      "calories": 350,
      "protein": 25,
      "carbs": 30,
      "fat": 15
    }
  }
]

Requirements:
- Generate exactly ${numberOfRecipes} recipes
- Use realistic cooking instructions
- Include appropriate Unsplash food image URLs
- Respect dietary preferences and allergies
- Make recipes that actually use the provided ingredients
- Provide realistic nutritional information
- Ensure all recipes match the specified cuisine type`;
};

const parseGeminiResponse = (responseText: string): Recipe[] => {
  try {
    // Clean the response text - remove any markdown formatting
    let cleanText = responseText.trim();
    
    // Remove markdown code blocks if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse the JSON
    const recipes = JSON.parse(cleanText);
    
    if (!Array.isArray(recipes)) {
      throw new Error("Response is not an array");
    }
    
    // Validate each recipe has required fields
    const validatedRecipes = recipes.map((recipe: any) => ({
      title: recipe.title || "Untitled Recipe",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
      imageUrl: recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      preparationTime: recipe.preparationTime || "30 minutes",
      servings: recipe.servings || 4,
      nutritionalInfo: recipe.nutritionalInfo || {
        calories: 300,
        protein: 20,
        carbs: 25,
        fat: 10
      }
    }));
    
    return validatedRecipes;
    
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    console.error("Raw response:", responseText);
    throw new Error("Failed to parse recipe data from Gemini response");
  }
};
