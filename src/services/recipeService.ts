
import { RecipeRequest, GeminiResponse, Recipe } from "../types/recipe";

// This would be replaced with a proper API key
const GEMINI_API_KEY = "YOUR_API_KEY";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export const generateRecipe = async (request: RecipeRequest): Promise<GeminiResponse> => {
  try {
    // In a real implementation, this would call the Gemini API
    // For now, we'll simulate a response to avoid API key requirements
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create multiple mock recipes based on the request
    const numberOfRecipes = 3; // Generate 3 recipes
    const mockRecipes: Recipe[] = [];
    
    for (let i = 0; i < numberOfRecipes; i++) {
      mockRecipes.push(createMockRecipe(request, i));
    }
    
    return {
      recipes: mockRecipes,
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
            text: generatePrompt(request, numberOfRecipes)
          }]
        }]
      })
    });

    const data = await response.json();
    
    // Parse the response to extract multiple recipe information
    const parsedRecipes = parseGeminiResponse(data);
    
    return {
      recipes: parsedRecipes,
      success: true
    };
    */
  } catch (error) {
    console.error("Error generating recipe:", error);
    return {
      recipes: [],
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate recipe"
    };
  }
};

const generatePrompt = (request: RecipeRequest, numberOfRecipes: number): string => {
  return `Generate ${numberOfRecipes} different detailed recipes with the following requirements:
    
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
      "nutritionalInfo": {
        "calories": X,
        "protein": X,
        "carbs": X,
        "fat": X
      }
    }`;
};

// Improved mock function to create recipes based on the request with better title-image matching
const createMockRecipe = (request: RecipeRequest, index: number) => {
  const cuisineTypes: Record<string, { prefix: string, dishes: string[], images: string[] }> = {
    'italian': {
      prefix: 'Italian',
      dishes: ['Pasta Carbonara', 'Margherita Pizza', 'Lasagna', 'Risotto', 'Bruschetta'],
      images: [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", // Pasta
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", // Pizza
        "https://images.unsplash.com/photo-1574894709920-11b28e7367e3", // Lasagna
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141", // Risotto
        "https://images.unsplash.com/photo-1572695157998-c5186b64c1c2" // Bruschetta
      ]
    },
    'chinese': {
      prefix: 'Chinese',
      dishes: ['Stir-Fried Noodles', 'Dim Sum Dumplings', 'Kung Pao Chicken', 'Fried Rice', 'Spring Rolls'],
      images: [
        "https://images.unsplash.com/photo-1585032226651-759b368d7246", // Noodles
        "https://images.unsplash.com/photo-1496116218417-1a781b1c416c", // Dumplings
        "https://images.unsplash.com/photo-1525755662778-989d0524087e", // Kung Pao
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b", // Fried Rice
        "https://images.unsplash.com/photo-1515669097368-22e68427d265" // Spring Rolls
      ]
    },
    'indian': {
      prefix: 'Indian',
      dishes: ['Butter Chicken Curry', 'Vegetable Tikka Masala', 'Lamb Biryani', 'Palak Paneer', 'Chana Masala'],
      images: [
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641", // Butter Chicken
        "https://images.unsplash.com/photo-1585937421612-70a008356cf7", // Tikka Masala
        "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a", // Biryani
        "https://images.unsplash.com/photo-1601050690597-df0568f70950", // Palak Paneer
        "https://images.unsplash.com/photo-1546833998-877b37c2e5c6" // Chana Masala
      ]
    },
    'mexican': {
      prefix: 'Mexican', 
      dishes: ['Beef Tacos', 'Chicken Enchiladas', 'Cheese Quesadillas', 'Bean Burritos', 'Fresh Guacamole'],
      images: [
        "https://images.unsplash.com/photo-1565299507177-b0ac66763828", // Tacos
        "https://images.unsplash.com/photo-1534352956036-cd81e27dd615", // Enchiladas
        "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f", // Quesadillas
        "https://images.unsplash.com/photo-1594149572395-50db09f82e71", // Burritos
        "https://images.unsplash.com/photo-1604548530945-f33587db61fd" // Guacamole
      ]
    },
    'mediterranean': {
      prefix: 'Mediterranean',
      dishes: ['Classic Hummus', 'Falafel Plate', 'Greek Salad', 'Grilled Lamb Kebabs', 'Tabbouleh'],
      images: [
        "https://images.unsplash.com/photo-1577906096429-f73c2c312435", // Hummus
        "https://images.unsplash.com/photo-1593001872095-7d5b3868dd20", // Falafel
        "https://images.unsplash.com/photo-1551248429-40975aa4de74", // Greek Salad
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1", // Kebabs
        "https://images.unsplash.com/photo-1505253668822-42074d58a7c6" // Tabbouleh
      ]
    },
    'japanese': {
      prefix: 'Japanese',
      dishes: ['Fresh Sushi Rolls', 'Tonkotsu Ramen', 'Chicken Teriyaki', 'Miso Soup', 'Vegetable Tempura'],
      images: [
        "https://images.unsplash.com/photo-1583623025817-d180a2221d0a", // Sushi
        "https://images.unsplash.com/photo-1557872943-16a5ac26437e", // Ramen
        "https://images.unsplash.com/photo-1519984388953-d2406bc725e1", // Teriyaki
        "https://images.unsplash.com/photo-1607301406259-dfb186e15de8", // Miso Soup
        "https://images.unsplash.com/photo-1615361200141-f45040f367be" // Tempura
      ]
    },
    'american': {
      prefix: 'American',
      dishes: ['Classic Cheeseburger', 'Creamy Mac and Cheese', 'BBQ Ribs', 'Southern Fried Chicken', 'Hearty Beef Chili'],
      images: [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd", // Burger
        "https://images.unsplash.com/photo-1612152328336-83c6d9a44d72", // Mac and Cheese
        "https://images.unsplash.com/photo-1544025162-d76694265947", // BBQ Ribs
        "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58", // Fried Chicken
        "https://images.unsplash.com/photo-1551550649-12abb73e6510" // Chili
      ]
    }
  };
  
  let cuisineInfo = cuisineTypes['italian']; // Default
  const lowerCuisine = request.cuisineType.toLowerCase();
  
  // Find matching cuisine
  for (const key in cuisineTypes) {
    if (lowerCuisine.includes(key)) {
      cuisineInfo = cuisineTypes[key];
      break;
    }
  }
  
  // Select corresponding dish and image
  const dishIndex = (index) % cuisineInfo.dishes.length;
  const randomDish = cuisineInfo.dishes[dishIndex];
  const matchingImage = cuisineInfo.images[dishIndex];
  
  const dietPrefix = request.dietaryPreference ? `${request.dietaryPreference} ` : '';
  
  // Generate a title with appropriate prefixes
  let title = `${dietPrefix}${cuisineInfo.prefix} ${randomDish}`;
  
  // Generate mock ingredients with available ingredients
  const availableIngredients = request.ingredients.length > 0 
    ? request.ingredients.slice(0, Math.min(request.ingredients.length, 5)) 
    : ["ingredients"];
  
  const mockIngredients = [
    ...availableIngredients,
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
    "Cover and simmer for 15 minutes, stirring occasionally.",
    `Add the remaining ${request.ingredients[1] || "ingredients"} and cook for another 5 minutes.`,
    "Taste and adjust seasoning if necessary.",
    "Remove from heat and let it rest for 2 minutes.",
    "Garnish with fresh herbs and serve hot."
  ];
  
  return {
    title,
    ingredients: mockIngredients,
    instructions: mockInstructions,
    imageUrl: matchingImage,
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

