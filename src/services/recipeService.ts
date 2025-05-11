
import { RecipeRequest, GeminiResponse } from "../types/recipe";

// This would be replaced with a proper API key
const GEMINI_API_KEY = "YOUR_API_KEY";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export const generateRecipe = async (request: RecipeRequest): Promise<GeminiResponse> => {
  try {
    // In a real implementation, this would call the Gemini API
    // For now, we'll simulate a response to avoid API key requirements
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a mock recipe based on the request
    const mockRecipe = createMockRecipe(request);
    
    return {
      recipe: mockRecipe,
      success: true
    };
    
    /* 
    // Actual Gemini API implementation would look something like:
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: generatePrompt(request)
          }]
        }]
      })
    });

    const data = await response.json();
    
    // Parse the response to extract recipe information
    const parsedRecipe = parseGeminiResponse(data);
    
    return {
      recipe: parsedRecipe,
      success: true
    };
    */
  } catch (error) {
    console.error("Error generating recipe:", error);
    return {
      recipe: {
        title: "",
        ingredients: [],
        instructions: [],
      },
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate recipe"
    };
  }
};

const generatePrompt = (request: RecipeRequest): string => {
  return `Generate a detailed recipe with the following requirements:
    
    Available ingredients: ${request.ingredients.join(', ')}
    
    Allergies to avoid: ${request.allergies.length > 0 ? request.allergies.join(', ') : 'None'}
    
    Cuisine type: ${request.cuisineType}
    
    Dietary preference: ${request.dietaryPreference || 'None specified'}
    
    Please format the response as a JSON object with the following structure:
    {
      "title": "Recipe Title",
      "ingredients": ["ingredient 1", "ingredient 2", ...],
      "instructions": ["step 1", "step 2", ...],
      "preparationTime": "X minutes",
      "servings": X,
      "nutritionalInfo": {
        "calories": X,
        "protein": X,
        "carbs": X,
        "fat": X
      }
    }`;
};

// Mock function to create a recipe based on the request
const createMockRecipe = (request: RecipeRequest) => {
  const cuisineTypes: Record<string, { prefix: string, dishes: string[] }> = {
    'italian': {
      prefix: 'Italian',
      dishes: ['Pasta', 'Risotto', 'Pizza', 'Lasagna', 'Bruschetta']
    },
    'chinese': {
      prefix: 'Chinese',
      dishes: ['Stir-Fry', 'Dumplings', 'Noodles', 'Fried Rice', 'Spring Rolls']
    },
    'indian': {
      prefix: 'Indian',
      dishes: ['Curry', 'Tikka Masala', 'Biryani', 'Saag', 'Chana Masala']
    },
    'mexican': {
      prefix: 'Mexican', 
      dishes: ['Tacos', 'Enchiladas', 'Quesadilla', 'Burrito', 'Guacamole']
    },
    'mediterranean': {
      prefix: 'Mediterranean',
      dishes: ['Hummus', 'Falafel', 'Greek Salad', 'Kebabs', 'Tabbouleh']
    },
    'japanese': {
      prefix: 'Japanese',
      dishes: ['Sushi', 'Ramen', 'Teriyaki', 'Miso Soup', 'Tempura']
    },
    'american': {
      prefix: 'American',
      dishes: ['Burger', 'Mac and Cheese', 'BBQ Ribs', 'Fried Chicken', 'Chili']
    }
  };
  
  let cuisineInfo = cuisineTypes['italian']; // Default
  const lowerCuisine = request.cuisineType.toLowerCase();
  
  for (const key in cuisineTypes) {
    if (lowerCuisine.includes(key)) {
      cuisineInfo = cuisineTypes[key];
      break;
    }
  }
  
  const randomDish = cuisineInfo.dishes[Math.floor(Math.random() * cuisineInfo.dishes.length)];
  const dietPrefix = request.dietaryPreference ? `${request.dietaryPreference} ` : '';
  
  // Generate a title based on ingredients
  let title = `${dietPrefix}${cuisineInfo.prefix} ${randomDish}`;
  if (request.ingredients.length > 0) {
    const mainIngredient = request.ingredients[Math.floor(Math.random() * request.ingredients.length)];
    title += ` with ${mainIngredient}`;
  }
  
  // Generate mock ingredients
  const mockIngredients = [
    ...request.ingredients.slice(0, Math.min(request.ingredients.length, 5)),
    "olive oil",
    "salt",
    "black pepper",
    "garlic",
    "onion"
  ];
  
  // Generate mock instructions
  const mockInstructions = [
    "Prepare all ingredients by washing and chopping them into appropriate sizes.",
    "Heat olive oil in a large pan over medium heat.",
    "Add onions and garlic, sauté until translucent.",
    `Add ${request.ingredients[0] || "main ingredients"} and cook for 5 minutes.`,
    "Season with salt and pepper to taste.",
    "Cover and simmer for 15 minutes.",
    "Garnish and serve hot."
  ];
  
  // Random image selection
  const recipeImages = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187"
  ];
  
  return {
    title,
    ingredients: mockIngredients,
    instructions: mockInstructions,
    imageUrl: recipeImages[Math.floor(Math.random() * recipeImages.length)],
    preparationTime: `${Math.floor(Math.random() * 30) + 15} minutes`,
    servings: Math.floor(Math.random() * 4) + 2,
    nutritionalInfo: {
      calories: Math.floor(Math.random() * 500) + 200,
      protein: Math.floor(Math.random() * 30) + 10,
      carbs: Math.floor(Math.random() * 40) + 20,
      fat: Math.floor(Math.random() * 20) + 5
    }
  };
};
