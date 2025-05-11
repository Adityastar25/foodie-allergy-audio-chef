
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
// and respect for dietary preferences
const createMockRecipe = (request: RecipeRequest, index: number) => {
  const dietaryPreference = request.dietaryPreference;
  
  // Define cuisine types with appropriate dishes based on dietary preferences
  const cuisineTypes: Record<string, { 
    prefix: string, 
    dishes: { 
      standard: string[], 
      vegetarian: string[], 
      vegan: string[], 
      keto: string[],
      paleo: string[],
      'gluten-free': string[]
    }, 
    images: {
      standard: string[],
      vegetarian: string[],
      vegan: string[],
      keto: string[],
      paleo: string[],
      'gluten-free': string[]
    }
  }> = {
    'italian': {
      prefix: 'Italian',
      dishes: {
        standard: ['Pasta Carbonara', 'Margherita Pizza', 'Lasagna', 'Risotto', 'Bruschetta'],
        vegetarian: ['Eggplant Parmesan', 'Margherita Pizza', 'Mushroom Risotto', 'Caprese Salad', 'Vegetable Lasagna'],
        vegan: ['Vegan Pasta Primavera', 'Marinara Spaghetti', 'Italian White Bean Soup', 'Focaccia Bread', 'Vegan Pesto Pasta'],
        keto: ['Zucchini Pasta with Pesto', 'Italian Chicken Cacciatore', 'Keto Eggplant Parmesan', 'Cauliflower Risotto', 'Italian Stuffed Peppers'],
        paleo: ['Zucchini Pasta with Meat Sauce', 'Italian Chicken with Herbs', 'Paleo Eggplant Lasagna', 'Italian Stuffed Portobello Mushrooms', 'Italian Herb Roasted Vegetables'],
        'gluten-free': ['Gluten-Free Pizza', 'Polenta with Mushrooms', 'Gluten-Free Pasta with Tomato Sauce', 'Risotto', 'Italian Bean Salad']
      },
      images: {
        standard: [
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", // Pasta
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", // Pizza
          "https://images.unsplash.com/photo-1574894709920-11b28e7367e3", // Lasagna
          "https://images.unsplash.com/photo-1551183053-bf91a1d81141", // Risotto
          "https://images.unsplash.com/photo-1572695157998-c5186b64c1c2" // Bruschetta
        ],
        vegetarian: [
          "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7", // Eggplant Parmesan
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", // Pizza
          "https://images.unsplash.com/photo-1551183053-bf91a1d81141", // Risotto
          "https://images.unsplash.com/photo-1615719413546-198b25453f85", // Caprese
          "https://images.unsplash.com/photo-1574894709920-11b28e7367e3" // Vegetable Lasagna
        ],
        vegan: [
          "https://images.unsplash.com/photo-1473093295043-cdd812d0e601", // Pasta Primavera
          "https://images.unsplash.com/photo-1627042633145-b780d842ba5a", // Marinara
          "https://images.unsplash.com/photo-1583187855714-1cf6aa8e70ac", // Bean Soup
          "https://images.unsplash.com/photo-1586444248879-9a78403cdb11", // Focaccia
          "https://images.unsplash.com/photo-1595295333158-4742f28fbd85" // Pesto Pasta
        ],
        keto: [
          "https://images.unsplash.com/photo-1559737604-9f61d63topshot-sfusd-failing-hs=8e5", // Zucchini Pasta
          "https://images.unsplash.com/photo-1599921841143-819065a55cc6", // Chicken Cacciatore
          "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7", // Keto Eggplant
          "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6", // Cauliflower Risotto
          "https://images.unsplash.com/photo-1629207338691-aCD573ad56d2" // Stuffed Peppers
        ],
        paleo: [
          "https://images.unsplash.com/photo-1559737604-9f61d63topshot-sfusd-failing-hs=8e5", // Zucchini Pasta
          "https://images.unsplash.com/photo-1619903024274-4581d70e5740", // Italian Chicken
          "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7", // Paleo Eggplant
          "https://images.unsplash.com/photo-1602093697647-530b9211ecd3", // Stuffed Mushrooms
          "https://images.unsplash.com/photo-1511994714008-b6d68a8b32a2" // Roasted Vegetables
        ],
        'gluten-free': [
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", // GF Pizza
          "https://images.unsplash.com/photo-1668236534978-65578e045793", // Polenta
          "https://images.unsplash.com/photo-1578160112054-954a67602b88", // GF Pasta
          "https://images.unsplash.com/photo-1551183053-bf91a1d81141", // Risotto
          "https://images.unsplash.com/photo-1639302729929-ea39ce10848b" // Bean Salad
        ]
      }
    },
    // Add more cuisines with dietary preference variations
    'chinese': {
      prefix: 'Chinese',
      dishes: {
        standard: ['Stir-Fried Noodles', 'Dim Sum Dumplings', 'Kung Pao Chicken', 'Fried Rice', 'Spring Rolls'],
        vegetarian: ['Vegetable Lo Mein', 'Vegetable Spring Rolls', 'Vegetable Fried Rice', 'Mapo Tofu', 'Chinese Broccoli in Garlic Sauce'],
        vegan: ['Vegan Dan Dan Noodles', 'Vegetable Dumplings', 'Buddha\'s Delight Stir Fry', 'Vegan Mapo Tofu', 'Chinese Garlic Eggplant'],
        keto: ['Chinese Broccoli Beef (No Sugar)', 'Egg Drop Soup', 'Stir-Fried Bok Choy', 'Keto Kung Pao Chicken', 'Chinese Cabbage Stir Fry'],
        paleo: ['Chinese Cauliflower Rice', 'Paleo Beef and Broccoli', 'Chinese Five Spice Chicken', 'Paleo Egg Fu Yung', 'Paleo Chinese Lettuce Wraps'],
        'gluten-free': ['Gluten-Free Stir-Fried Rice Noodles', 'Gluten-Free Fried Rice', 'Gluten-Free Chinese Beef and Vegetables', 'Gluten-Free Orange Chicken', 'Gluten-Free Scallion Pancakes']
      },
      images: {
        standard: [
          "https://images.unsplash.com/photo-1585032226651-759b368d7246", // Noodles
          "https://images.unsplash.com/photo-1496116218417-1a781b1c416c", // Dumplings
          "https://images.unsplash.com/photo-1525755662778-989d0524087e", // Kung Pao
          "https://images.unsplash.com/photo-1603133872878-684f208fb84b", // Fried Rice
          "https://images.unsplash.com/photo-1515669097368-22e68427d265" // Spring Rolls
        ],
        vegetarian: [
          "https://images.unsplash.com/photo-1585032226651-759b368d7246", // Veg Lo Mein
          "https://images.unsplash.com/photo-1515669097368-22e68427d265", // Veg Spring Rolls
          "https://images.unsplash.com/photo-1603133872878-684f208fb84b", // Veg Fried Rice
          "https://images.unsplash.com/photo-1623595119708-26b1f7500ddd", // Mapo Tofu
          "https://images.unsplash.com/photo-1606756790138-261d2b21cd75" // Chinese Broccoli
        ],
        vegan: [
          "https://images.unsplash.com/photo-1618889482923-38250401a84e", // Dan Dan Noodles
          "https://images.unsplash.com/photo-1496116218417-1a781b1c416c", // Veg Dumplings
          "https://images.unsplash.com/photo-1512003867696-6d5ce6835040", // Buddha's Delight
          "https://images.unsplash.com/photo-1623595119708-26b1f7500ddd", // Vegan Mapo Tofu
          "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7" // Garlic Eggplant
        ],
        keto: [
          "https://images.unsplash.com/photo-1606756303426-6b9a464ecd21", // Broccoli Beef
          "https://images.unsplash.com/photo-1626630456263-d9bc9177d4e4", // Egg Drop Soup
          "https://images.unsplash.com/photo-1606756790138-261d2b21cd75", // Bok Choy
          "https://images.unsplash.com/photo-1525755662778-989d0524087e", // Keto Kung Pao
          "https://images.unsplash.com/photo-1580013759032-c96505e24c1f" // Cabbage Stir Fry
        ],
        paleo: [
          "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10", // Cauliflower Rice
          "https://images.unsplash.com/photo-1606756303426-6b9a464ecd21", // Beef and Broccoli
          "https://images.unsplash.com/photo-1626082936724-52bbed6e036f", // Five Spice Chicken
          "https://images.unsplash.com/photo-1600180133858-c711378b0807", // Egg Fu Yung
          "https://images.unsplash.com/photo-1506084868230-bb9d95c24759" // Lettuce Wraps
        ],
        'gluten-free': [
          "https://images.unsplash.com/photo-1585032226651-759b368d7246", // GF Rice Noodles
          "https://images.unsplash.com/photo-1603133872878-684f208fb84b", // GF Fried Rice
          "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841", // GF Beef and Vegetables
          "https://images.unsplash.com/photo-1525755662778-989d0524087e", // GF Orange Chicken
          "https://images.unsplash.com/photo-1625771254140-1a54a2dc9405" // GF Scallion Pancakes
        ]
      }
    },
    // Add more cuisines with similar dietary preference variations
  };
  
  // Default to Italian if the cuisine isn't specifically defined
  let cuisineInfo = cuisineTypes['italian']; 
  const lowerCuisine = request.cuisineType.toLowerCase();
  
  // Find matching cuisine
  for (const key in cuisineTypes) {
    if (lowerCuisine.includes(key)) {
      cuisineInfo = cuisineTypes[key];
      break;
    }
  }
  
  // Determine which type of dishes to use based on dietary preference
  let dishType: string = 'standard';
  if (dietaryPreference && dietaryPreference !== 'none' && 
      cuisineInfo.dishes[dietaryPreference as keyof typeof cuisineInfo.dishes]) {
    dishType = dietaryPreference;
  }
  
  // Select corresponding dish and image from the appropriate dietary category
  const dishes = cuisineInfo.dishes[dishType as keyof typeof cuisineInfo.dishes] || cuisineInfo.dishes.standard;
  const images = cuisineInfo.images[dishType as keyof typeof cuisineInfo.images] || cuisineInfo.images.standard;
  
  const dishIndex = index % dishes.length;
  const randomDish = dishes[dishIndex];
  const matchingImage = images[dishIndex];
  
  // Generate a title with appropriate prefixes
  let title = `${cuisineInfo.prefix} ${randomDish}`;
  
  // Use user-provided ingredients to create custom ingredient list
  const availableIngredients = request.ingredients.length > 0 
    ? [...request.ingredients] // Make a copy to avoid modifying the original
    : ["ingredients"];
  
  // Filter out any ingredients that don't match dietary preferences
  const filteredIngredients = filterIngredientsForDiet(availableIngredients, dietaryPreference);
  
  // Add some basic ingredients that fit the dietary preference
  const commonIngredients = getCommonIngredientsForDiet(dietaryPreference);
  
  const mockIngredients = [
    ...filteredIngredients.slice(0, Math.min(filteredIngredients.length, 5)),
    ...commonIngredients
  ];
  
  // Generate instructions that actually reference the ingredients
  const mockInstructions = generateInstructions(mockIngredients, cuisineInfo.prefix, randomDish, dietaryPreference);
  
  return {
    title,
    ingredients: mockIngredients,
    instructions: mockInstructions,
    imageUrl: matchingImage,
    dietaryPreference: dietaryPreference,
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

// Filter ingredients based on dietary preferences
const filterIngredientsForDiet = (ingredients: string[], dietaryPreference?: string): string[] => {
  if (!dietaryPreference || dietaryPreference === 'none') {
    return ingredients;
  }
  
  const nonVegetarianIngredients = ['chicken', 'beef', 'pork', 'lamb', 'bacon', 'ham', 'turkey', 'veal', 'sausage', 'salami', 'pepperoni'];
  const dairyIngredients = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'ice cream', 'ghee', 'paneer', 'cottage cheese'];
  const grainsToAvoid = ['wheat', 'barley', 'rye', 'oats', 'bread', 'pasta', 'flour', 'white rice'];
  
  let filteredList = [...ingredients];
  
  switch(dietaryPreference) {
    case 'vegetarian':
      filteredList = filteredList.filter(ingredient => 
        !nonVegetarianIngredients.some(meat => ingredient.toLowerCase().includes(meat)));
      break;
    
    case 'vegan':
      filteredList = filteredList.filter(ingredient => 
        !nonVegetarianIngredients.some(meat => ingredient.toLowerCase().includes(meat)) &&
        !dairyIngredients.some(dairy => ingredient.toLowerCase().includes(dairy)));
      break;
      
    case 'keto':
      filteredList = filteredList.filter(ingredient => 
        !ingredient.toLowerCase().includes('sugar') && 
        !ingredient.toLowerCase().includes('honey') &&
        !ingredient.toLowerCase().includes('maple syrup') &&
        !grainsToAvoid.some(grain => ingredient.toLowerCase().includes(grain)));
      break;
      
    case 'paleo':
      filteredList = filteredList.filter(ingredient => 
        !ingredient.toLowerCase().includes('dairy') && 
        !ingredient.toLowerCase().includes('sugar') &&
        !grainsToAvoid.some(grain => ingredient.toLowerCase().includes(grain)));
      break;
      
    case 'gluten-free':
      filteredList = filteredList.filter(ingredient => 
        !grainsToAvoid.some(grain => ingredient.toLowerCase().includes(grain)));
      break;
  }
  
  return filteredList;
};

// Get common ingredients based on dietary preference
const getCommonIngredientsForDiet = (dietaryPreference?: string): string[] => {
  const commonBase = ['salt', 'black pepper', 'olive oil', 'garlic', 'onion'];
  
  switch(dietaryPreference) {
    case 'vegetarian':
      return [...commonBase, 'bell peppers', 'broccoli', 'eggs', 'cheese'];
    case 'vegan':
      return [...commonBase, 'bell peppers', 'broccoli', 'tofu', 'nutritional yeast', 'plant milk'];
    case 'keto':
      return [...commonBase, 'avocado', 'spinach', 'butter', 'heavy cream', 'bacon'];
    case 'paleo':
      return [...commonBase, 'sweet potatoes', 'avocado', 'almond flour', 'coconut oil', 'eggs'];
    case 'gluten-free':
      return [...commonBase, 'gluten-free flour', 'rice', 'quinoa', 'corn starch', 'potatoes'];
    default:
      return commonBase;
  }
};

// Generate more unique and relevant instructions for each recipe
const generateInstructions = (ingredients: string[], cuisine: string, dish: string, dietaryPreference?: string): string[] => {
  const mainIngredients = ingredients.slice(0, 3);
  const secondaryIngredients = ingredients.slice(3, 6);
  const seasonings = ingredients.filter(ing => ['salt', 'pepper', 'herbs', 'spice'].some(s => ing.toLowerCase().includes(s)));
  
  // Create more diverse instructions based on cuisine and dish type
  if (dish.toLowerCase().includes('stir')) {
    return [
      `Prepare all ingredients: dice ${mainIngredients.join(', ')} into bite-sized pieces.`,
      `Heat a wok or large pan over high heat. Add oil and wait until it's very hot.`,
      `Add ${ingredients.find(i => i.includes('garlic')) || 'garlic'} and ${ingredients.find(i => i.includes('onion')) || 'onions'} to the wok and stir-fry for 30 seconds until fragrant.`,
      `Add ${mainIngredients[0]} and ${mainIngredients[1] || 'other main ingredients'} to the wok. Stir-fry for about 3-4 minutes.`,
      `Add ${secondaryIngredients[0] || 'vegetables'} and continue to stir-fry for 2 minutes.`,
      `Season with ${seasonings.join(', ') || 'salt and pepper'} to taste.`,
      `Pour in any sauce ingredients and toss to combine. Cook for another minute.`,
      `Plate the stir-fry and garnish with fresh herbs if available.`,
      `Serve hot with rice or noodles on the side (unless making a keto or paleo version).`
    ];
  } else if (dish.toLowerCase().includes('soup') || dish.toLowerCase().includes('stew')) {
    return [
      `Prep work: chop ${mainIngredients.join(', ')} into even pieces.`,
      `Heat oil in a large pot over medium heat.`,
      `Add ${ingredients.find(i => i.includes('onion')) || 'onions'} and cook until translucent, about 3-4 minutes.`,
      `Add ${ingredients.find(i => i.includes('garlic')) || 'garlic'} and cook for another 30 seconds.`,
      `Add ${mainIngredients[0]} and cook for 2 minutes, stirring occasionally.`,
      `Pour in broth or water and bring to a simmer.`,
      `Add ${secondaryIngredients.join(', ') || 'remaining ingredients'} to the pot.`,
      `Season with ${seasonings.join(', ') || 'salt and pepper'} to taste.`,
      `Cover and simmer for 15-20 minutes, until all ingredients are tender.`,
      `Adjust seasoning if needed and serve hot in bowls.`
    ];
  } else if (dish.toLowerCase().includes('salad')) {
    return [
      `Wash and dry all produce thoroughly.`,
      `Chop ${mainIngredients.join(', ')} into bite-sized pieces.`,
      `Prepare any proteins included in the recipe.`,
      `In a large bowl, combine ${mainIngredients.join(', ')}.`,
      `In a small bowl, whisk together ingredients for the dressing.`,
      `Add ${secondaryIngredients.join(', ') || 'remaining ingredients'} to the salad bowl.`,
      `Pour the dressing over the salad and toss gently to combine.`,
      `Season with ${seasonings.join(', ') || 'salt and pepper'} to taste.`,
      `Let sit for 5 minutes to allow flavors to meld.`,
      `Serve immediately or refrigerate until ready to eat.`
    ];
  } else if (dish.toLowerCase().includes('pasta') || dish.toLowerCase().includes('noodle')) {
    const pastaType = dietaryPreference === 'keto' ? 'zucchini noodles' : 
                     dietaryPreference === 'paleo' ? 'sweet potato noodles' : 
                     dietaryPreference === 'gluten-free' ? 'gluten-free pasta' :
                     'pasta';
    
    return [
      `Bring a large pot of salted water to a boil.`,
      `Cook ${pastaType} according to package instructions until al dente.`,
      `Meanwhile, heat oil in a large skillet over medium heat.`,
      `Add ${ingredients.find(i => i.includes('onion')) || 'onions'} and ${ingredients.find(i => i.includes('garlic')) || 'garlic'}, cook until fragrant.`,
      `Add ${mainIngredients.filter(i => !i.includes('pasta')).join(', ') || 'main ingredients'} to the pan and cook for 5-7 minutes.`,
      `Season with ${seasonings.join(', ') || 'salt and pepper'} to taste.`,
      `Drain the ${pastaType}, reserving 1/4 cup of cooking water.`,
      `Add the ${pastaType} to the sauce in the skillet and toss to combine.`,
      `If needed, add some of the reserved cooking water to loosen the sauce.`,
      `Garnish with herbs and serve immediately.`
    ];
  } else {
    // Generic recipe instructions that reference the ingredients
    return [
      `Prepare all ingredients: wash, peel and chop ${mainIngredients.join(', ')} as needed.`,
      `Heat oil in a suitable pan over medium heat.`,
      `Add ${ingredients.find(i => i.includes('onion')) || 'onions'} and ${ingredients.find(i => i.includes('garlic')) || 'garlic'}, sauté until fragrant and translucent.`,
      `Add ${mainIngredients[0]} and cook for 3-5 minutes, stirring occasionally.`,
      `Add ${mainIngredients[1] || 'the next ingredient'} and continue cooking for 2-3 minutes.`,
      `Pour in any liquids and bring to a simmer if applicable.`,
      `Add ${secondaryIngredients.join(', ') || 'remaining ingredients'} to the pan.`,
      `Season with ${seasonings.join(', ') || 'salt and pepper'} to taste.`,
      `Cover and cook for 10-15 minutes, or until all ingredients are properly cooked.`,
      `Serve hot, garnished with fresh herbs if available.`
    ];
  }
};
