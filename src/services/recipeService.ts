import { RecipeRequest, GeminiResponse, Recipe } from "../types/recipe";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
const GEMINI_IMAGE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage";

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
    
    // Generate images for each recipe
    const recipesWithImages = await Promise.all(
      parsedRecipes.map(async (recipe, index) => {
        try {
          const imageUrl = await generateRecipeImage(recipe.title, apiKey);
          return { ...recipe, imageUrl };
        } catch (error) {
          console.error(`Failed to generate image for ${recipe.title}:`, error);
          // Use recipe-specific fallback images
          const fallbackImage = getFallbackImageForRecipe(recipe.title, request.cuisineType, index);
          return { ...recipe, imageUrl: fallbackImage };
        }
      })
    );
    
    return {
      recipes: recipesWithImages,
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

const generateRecipeImage = async (recipeTitle: string, apiKey: string): Promise<string> => {
  try {
    const imagePrompt = `A professional, appetizing photo of ${recipeTitle}, beautifully plated and styled for a cookbook, high quality food photography, well-lit, appetizing presentation`;
    
    const response = await fetch(`${GEMINI_IMAGE_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        config: {
          number_of_images: 1,
          aspect_ratio: "1:1",
          safety_filter_level: "block_few",
          person_generation: "dont_allow"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.status} ${response.statusText}`);
    }

    const imageData = await response.json();
    
    if (imageData.candidates && imageData.candidates[0] && imageData.candidates[0].image) {
      // Convert base64 to blob URL for display
      const base64Data = imageData.candidates[0].image;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    }
    
    throw new Error("No image generated");
    
  } catch (error) {
    console.error("Error generating recipe image:", error);
    throw error;
  }
};

const getFallbackImageForRecipe = (recipeTitle: string, cuisineType: string, index: number): string => {
  const title = recipeTitle.toLowerCase();
  
  // Cuisine-specific fallbacks
  const cuisineImages = {
    japanese: [
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56", // sushi
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624", // ramen
      "https://images.unsplash.com/photo-1563379091339-03246963d25a"  // teriyaki
    ],
    italian: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", // pizza
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141", // pasta
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3"  // risotto
    ],
    mexican: [
      "https://images.unsplash.com/photo-1565299585323-38174c19fe12", // tacos
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b", // burritos
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd"  // nachos
    ],
    indian: [
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe", // curry
      "https://images.unsplash.com/photo-1563379091339-03246963d25a", // biryani
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3"  // dal
    ],
    chinese: [
      "https://images.unsplash.com/photo-1525755662778-989d0524087e", // stir fry
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b", // noodles
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56"  // dumplings
    ],
    thai: [
      "https://images.unsplash.com/photo-1559314809-0f31657def5e", // pad thai
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3", // curry
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624"  // soup
    ]
  };

  // Get cuisine-specific images or default to generic food images
  const cuisineSpecificImages = cuisineImages[cuisineType.toLowerCase()] || [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", // generic food 1
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", // generic food 2
    "https://images.unsplash.com/photo-1574894709920-11b28e7367e3"  // generic food 3
  ];

  // Use different images based on recipe characteristics
  if (title.includes('sushi') || title.includes('roll')) {
    return "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56";
  } else if (title.includes('stir') || title.includes('fry')) {
    return "https://images.unsplash.com/photo-1525755662778-989d0524087e";
  } else if (title.includes('bowl') || title.includes('rice')) {
    return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624";
  } else if (title.includes('soup') || title.includes('broth')) {
    return "https://images.unsplash.com/photo-1574894709920-11b28e7367e3";
  } else if (title.includes('salad') || title.includes('slaw')) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd";
  }

  // Return cuisine-specific image based on index to ensure variety
  return cuisineSpecificImages[index % cuisineSpecificImages.length];
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
    "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
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

CRITICAL REQUIREMENTS:
- Generate exactly ${numberOfRecipes} recipes
- Use realistic cooking instructions with detailed steps
- For imageUrl, you MUST use actual working Unsplash food photography URLs. Here are specific examples you should use based on the dish type:
  * Italian dishes: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38" (pizza), "https://images.unsplash.com/photo-1551183053-bf91a1d81141" (pasta)
  * Mexican dishes: "https://images.unsplash.com/photo-1565299585323-38174c19fe12" (tacos), "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b" (burritos)
  * Indian dishes: "https://images.unsplash.com/photo-1585937421612-70a008356fbe" (curry), "https://images.unsplash.com/photo-1563379091339-03246963d25a" (biryani)
  * Chinese dishes: "https://images.unsplash.com/photo-1525755662778-989d0524087e" (stir fry), "https://images.unsplash.com/photo-1603133872878-684f208fb84b" (noodles)
  * Japanese dishes: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56" (sushi), "https://images.unsplash.com/photo-1569718212165-3a8278d5f624" (ramen)
  * Thai dishes: "https://images.unsplash.com/photo-1559314809-0f31657def5e" (pad thai), "https://images.unsplash.com/photo-1574894709920-11b28e7367e3" (curry)
  * American dishes: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd" (burger), "https://images.unsplash.com/photo-1544025162-d76694265947" (bbq)
  * French dishes: "https://images.unsplash.com/photo-1626082936724-52bbed6e036f" (steak), "https://images.unsplash.com/photo-1574894709920-11b28e7367e3" (ratatouille)
- Choose the most appropriate image URL from the examples above that matches your recipe type and cuisine
- Respect dietary preferences and allergies completely
- Make recipes that creatively use the provided ingredients
- Provide realistic nutritional information
- Ensure all recipes match the specified cuisine type
- Do NOT wrap your response in markdown code blocks - return raw JSON only`;
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
    
    // Validate each recipe has required fields and ensure proper image URLs
    const validatedRecipes = recipes.map((recipe: any, index: number) => {
      let imageUrl = recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
      
      // If the image URL looks like a placeholder, replace with a proper food image
      if (!imageUrl.includes('images.unsplash.com') || imageUrl.includes('appropriate-food-image')) {
        imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"; // generic food image
      }
      
      return {
        title: recipe.title || "Untitled Recipe",
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        imageUrl: imageUrl,
        preparationTime: recipe.preparationTime || "30 minutes",
        servings: recipe.servings || 4,
        nutritionalInfo: recipe.nutritionalInfo || {
          calories: 300,
          protein: 20,
          carbs: 25,
          fat: 10
        }
      };
    });
    
    return validatedRecipes;
    
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    console.error("Raw response:", responseText);
    throw new Error("Failed to parse recipe data from Gemini response");
  }
};
