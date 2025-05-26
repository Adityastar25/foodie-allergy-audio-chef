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
    
    // Generate images for each recipe with ingredient-specific prompts
    const recipesWithImages = await Promise.all(
      parsedRecipes.map(async (recipe, index) => {
        try {
          const imageUrl = await generateRecipeImage(recipe.title, recipe.ingredients, request.ingredients, request.cuisineType, apiKey);
          return { ...recipe, imageUrl };
        } catch (error) {
          console.error(`Failed to generate image for ${recipe.title}:`, error);
          // Use ingredient-specific fallback images
          const fallbackImage = getIngredientBasedFallbackImage(recipe.title, request.ingredients, request.cuisineType, index);
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

const generateRecipeImage = async (recipeTitle: string, recipeIngredients: string[], userIngredients: string[], cuisineType: string, apiKey: string): Promise<string> => {
  try {
    // Focus on the main user ingredients and recipe-specific ingredients
    const keyIngredients = [...userIngredients, ...recipeIngredients.slice(0, 2)];
    const uniqueId = Math.random().toString(36).substring(7);
    
    // Create a more focused prompt based on the actual ingredients
    const imagePrompt = `Professional food photography of ${recipeTitle}, prominently featuring ${keyIngredients.join(" and ")}, ${cuisineType} cuisine, beautifully plated, high-resolution, appetizing, studio lighting, food styling, close-up shot showing ${keyIngredients[0]} clearly, unique ID ${uniqueId}`;
    
    console.log(`Generating image for: ${recipeTitle} with ingredients: ${keyIngredients.join(", ")}`);
    console.log(`Image prompt: ${imagePrompt}`);
    
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
      const errorText = await response.text();
      console.error(`Image generation failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Image generation failed: ${response.status} ${response.statusText}`);
    }

    const imageData = await response.json();
    console.log('Image generation response:', imageData);
    
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
      const imageUrl = URL.createObjectURL(blob);
      console.log(`Successfully generated image for ${recipeTitle}`);
      return imageUrl;
    }
    
    throw new Error("No image generated in response");
    
  } catch (error) {
    console.error("Error generating recipe image:", error);
    throw error;
  }
};

const getIngredientBasedFallbackImage = (recipeTitle: string, userIngredients: string[], cuisineType: string, index: number): string => {
  const title = recipeTitle.toLowerCase();
  const ingredients = userIngredients.map(ing => ing.toLowerCase());
  
  console.log(`Getting fallback image for: ${recipeTitle} with ingredients: ${ingredients.join(", ")}`);
  
  // Ingredient-specific images
  const ingredientImages = {
    chocolate: [
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop", // chocolate cake
      "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop", // chocolate dessert
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop"  // chocolate cookies
    ],
    chicken: [
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop", // grilled chicken
      "https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400&h=400&fit=crop", // chicken dish
      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=400&fit=crop"  // roasted chicken
    ],
    pasta: [
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop", // pasta dish
      "https://images.unsplash.com/photo-1586734479020-c07f1936ae8a?w=400&h=400&fit=crop", // spaghetti
      "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=400&fit=crop"  // pasta bowl
    ],
    rice: [
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop", // rice bowl
      "https://images.unsplash.com/photo-1563379091339-03246963d25a?w=400&h=400&fit=crop", // fried rice
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop"  // rice dish
    ],
    tomato: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop", // tomato pizza
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop", // pasta with tomato
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop"  // tomato salad
    ],
    cheese: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop", // cheese pizza
      "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=400&fit=crop", // cheesy pasta
      "https://images.unsplash.com/photo-1586734479020-c07f1936ae8a?w=400&h=400&fit=crop"  // cheese dish
    ],
    fish: [
      "https://images.unsplash.com/photo-1544943400-1c36c0b6d0c5?w=400&h=400&fit=crop", // grilled fish
      "https://images.unsplash.com/photo-1559847844-d72d1c6d4ae2?w=400&h=400&fit=crop", // fish dish
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop"  // cooked fish
    ],
    beef: [
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop", // beef steak
      "https://images.unsplash.com/photo-1626082936724-52bbed6e036f?w=400&h=400&fit=crop", // beef dish
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop"  // cooked beef
    ]
  };

  // Check for specific ingredients first
  for (const ingredient of ingredients) {
    if (ingredientImages[ingredient]) {
      console.log(`Found specific image for ingredient: ${ingredient}`);
      return ingredientImages[ingredient][index % ingredientImages[ingredient].length];
    }
  }

  // Check recipe title for ingredient keywords
  for (const [ingredient, images] of Object.entries(ingredientImages)) {
    if (title.includes(ingredient)) {
      console.log(`Found ingredient ${ingredient} in recipe title`);
      return images[index % images.length];
    }
  }

  // Cuisine-specific fallbacks
  const cuisineImages = {
    japanese: [
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=400&fit=crop", // sushi
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop", // ramen
      "https://images.unsplash.com/photo-1563379091339-03246963d25a?w=400&h=400&fit=crop"  // teriyaki
    ],
    italian: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop", // pizza
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop", // pasta
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop"  // risotto
    ],
    mexican: [
      "https://images.unsplash.com/photo-1565299585323-38174c19fe12?w=400&h=400&fit=crop", // tacos
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=400&fit=crop", // burritos
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop"  // nachos
    ],
    indian: [
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop", // curry
      "https://images.unsplash.com/photo-1563379091339-03246963d25a?w=400&h=400&fit=crop", // biryani
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop"  // dal
    ],
    chinese: [
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=400&fit=crop", // stir fry
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop", // noodles
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=400&fit=crop"  // dumplings
    ],
    thai: [
      "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400&h=400&fit=crop", // pad thai
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop", // curry
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop"  // soup
    ]
  };

  // Get cuisine-specific images or default to generic food images
  const cuisineSpecificImages = cuisineImages[cuisineType.toLowerCase()] || [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop", // generic food 1
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop", // generic food 2
    "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop"  // generic food 3
  ];

  console.log(`Using cuisine-specific fallback for ${cuisineType}`);
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
