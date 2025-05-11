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
    // Add Mediterranean cuisine type with appropriate dishes
    'mediterranean': {
      prefix: 'Mediterranean',
      dishes: {
        standard: ['Greek Salad', 'Hummus with Pita', 'Lamb Kebabs', 'Moussaka', 'Paella'],
        vegetarian: ['Spanakopita', 'Falafel Wrap', 'Vegetable Tagine', 'Greek Salad', 'Stuffed Bell Peppers'],
        vegan: ['Tabbouleh Salad', 'Dolmas', 'Vegan Falafel Bowl', 'Hummus with Vegetables', 'Mediterranean Lentil Soup'],
        keto: ['Greek Chicken Souvlaki', 'Mediterranean Cauliflower Rice', 'Keto Tzatziki with Vegetables', 'Grilled Halloumi Cheese', 'Mediterranean Fish with Olives'],
        paleo: ['Zucchini Hummus', 'Mediterranean Chicken with Herbs', 'Paleo Greek Meatballs', 'Eggplant and Olive Stew', 'Grilled Lamb with Herbs'],
        'gluten-free': ['Greek Salad', 'Gluten-Free Falafel', 'Mediterranean Quinoa Bowl', 'Stuffed Eggplants', 'Grilled Fish with Herbs']
      },
      images: {
        standard: [
          "https://images.unsplash.com/photo-1551248429-40975aa4de74", // Greek Salad
          "https://images.unsplash.com/photo-1577805947697-89e18249d767", // Hummus
          "https://images.unsplash.com/photo-1603360946369-dc9bb6258143", // Lamb Kebabs
          "https://images.unsplash.com/photo-1574484284002-952d92456975", // Moussaka
          "https://images.unsplash.com/photo-1515443961218-a51367888e4b"  // Paella
        ],
        vegetarian: [
          "https://images.unsplash.com/photo-1644704170910-a0cdf183649b", // Spanakopita
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", // Falafel Wrap
          "https://images.unsplash.com/photo-1490645935967-10de6ba17061", // Vegetable Tagine
          "https://images.unsplash.com/photo-1551248429-40975aa4de74", // Greek Salad
          "https://images.unsplash.com/photo-1602473812169-fa6878a41fbb"  // Stuffed Peppers
        ],
        vegan: [
          "https://images.unsplash.com/photo-1593001534082-a9a0ec307433", // Tabbouleh
          "https://images.unsplash.com/photo-1606505262466-fdbcfd3b9965", // Dolmas
          "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e", // Falafel Bowl
          "https://images.unsplash.com/photo-1577805947697-89e18249d767", // Hummus with Vegetables
          "https://images.unsplash.com/photo-1547592180-85f173990554"  // Lentil Soup
        ],
        keto: [
          "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0", // Souvlaki
          "https://images.unsplash.com/photo-1590759485397-26233d2f1ae0", // Cauli Rice
          "https://images.unsplash.com/photo-1631898039984-fd5f61fe8732", // Tzatziki
          "https://images.unsplash.com/photo-1559561853-08451507cbe7", // Halloumi
          "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2"  // Fish with Olives
        ],
        paleo: [
          "https://images.unsplash.com/photo-1505576399279-565b52d4ac71", // Zucchini Hummus
          "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0", // Mediterranean Chicken
          "https://images.unsplash.com/photo-1529042410759-befb1204b468", // Greek Meatballs
          "https://images.unsplash.com/photo-1615485290382-441e4d049cb5", // Eggplant and Olive
          "https://images.unsplash.com/photo-1603360946369-dc9bb6258143"  // Grilled Lamb
        ],
        'gluten-free': [
          "https://images.unsplash.com/photo-1551248429-40975aa4de74", // Greek Salad
          "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e", // GF Falafel
          "https://images.unsplash.com/photo-1556010614-9c6b0e0546d1", // Quinoa Bowl
          "https://images.unsplash.com/photo-1518779578993-ec3579fee39f", // Stuffed Eggplants
          "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2"  // Grilled Fish
        ]
      }
    },
    'indian': {
      prefix: 'Indian',
      dishes: {
        standard: ['Butter Chicken', 'Biryani', 'Tikka Masala', 'Naan Bread', 'Samosas'],
        vegetarian: ['Vegetable Curry', 'Paneer Tikka', 'Aloo Gobi', 'Dal Makhani', 'Vegetable Biryani'],
        vegan: ['Chana Masala', 'Vegetable Pakoras', 'Vegan Dal', 'Aloo Gobi', 'Bhindi Masala'],
        keto: ['Keto Butter Chicken', 'Paneer Tikka (No Bread)', 'Egg Curry', 'Keto Tandoori Chicken', 'Keto Coconut Curry'],
        paleo: ['Tandoori Chicken', 'Paleo Curry', 'Coconut Curry Fish', 'Paleo Stuffed Peppers', 'Cucumber Raita'],
        'gluten-free': ['Rice Dosas', 'Gluten-Free Curry', 'Rice Idli', 'Gluten-Free Biryani', 'Gluten-Free Pappadums']
      },
      images: {
        standard: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641", // Butter Chicken
          "https://images.unsplash.com/photo-1589302168068-964664d93dc0", // Biryani
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641", // Tikka Masala
          "https://images.unsplash.com/photo-1565538810643-b5bdb714032a", // Naan
          "https://images.unsplash.com/photo-1601050690597-df0568f70950"  // Samosas
        ],
        vegetarian: [
          "https://images.unsplash.com/photo-1585937421612-70a008356fbe", // Vegetable Curry
          "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6", // Paneer Tikka
          "https://images.unsplash.com/photo-1613292443284-8d10ef9d4698", // Aloo Gobi
          "https://images.unsplash.com/photo-1626132644485-f6af7056f482", // Dal Makhani
          "https://images.unsplash.com/photo-1589302168068-964664d93dc0"  // Vegetable Biryani
        ],
        vegan: [
          "https://images.unsplash.com/photo-1616300413710-73e6387707d8", // Chana Masala
          "https://images.unsplash.com/photo-1461009683693-342af2f2d6ce", // Pakoras
          "https://images.unsplash.com/photo-1626132644485-f6af7056f482", // Vegan Dal
          "https://images.unsplash.com/photo-1613292443284-8d10ef9d4698", // Aloo Gobi
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398"  // Bhindi Masala
        ],
        keto: [
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641", // Keto Butter Chicken
          "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6", // Paneer Tikka
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398", // Egg Curry
          "https://images.unsplash.com/photo-1606471191009-63994c53433b", // Tandoori Chicken
          "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd"  // Coconut Curry
        ],
        paleo: [
          "https://images.unsplash.com/photo-1606471191009-63994c53433b", // Tandoori Chicken
          "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd", // Paleo Curry
          "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2", // Coconut Curry Fish
          "https://images.unsplash.com/photo-1602473812169-fa6878a41fbb", // Stuffed Peppers
          "https://images.unsplash.com/photo-1596797038530-2c107229654b"  // Cucumber Raita
        ],
        'gluten-free': [
          "https://images.unsplash.com/photo-1586585090219-765bc057f036", // Dosas
          "https://images.unsplash.com/photo-1585937421612-70a008356fbe", // GF Curry
          "https://images.unsplash.com/photo-1589516261368-3b1d3e9aa4a8", // Rice Idli
          "https://images.unsplash.com/photo-1589302168068-964664d93dc0", // GF Biryani
          "https://images.unsplash.com/photo-1627308595171-d1b5d95d22f7"  // GF Pappadums
        ]
      }
    },
    'mexican': {
      prefix: 'Mexican',
      dishes: {
        standard: ['Beef Tacos', 'Chicken Enchiladas', 'Chiles Rellenos', 'Carne Asada', 'Beef Quesadillas'],
        vegetarian: ['Vegetable Quesadillas', 'Bean Burritos', 'Vegetable Enchiladas', 'Guacamole and Chips', 'Cheese Tamales'],
        vegan: ['Vegan Tacos', 'Bean and Rice Burritos', 'Vegan Tortilla Soup', 'Guacamole and Vegetables', 'Mexican Rice Bowl'],
        keto: ['Taco Salad (No Shell)', 'Keto Mexican Cauliflower Rice', 'Keto Fajitas', 'Mexican Stuffed Avocados', 'Keto Enchiladas'],
        paleo: ['Paleo Carnitas', 'Mexican Cauliflower Rice', 'Paleo Fajita Bowl', 'Paleo Mexican Stuffed Peppers', 'Paleo Mexican Chicken Soup'],
        'gluten-free': ['Corn Tortilla Tacos', 'Gluten-Free Enchiladas', 'Mexican Rice Bowl', 'Gluten-Free Tortilla Soup', 'Corn Tortilla Chips with Salsa']
      },
      images: {
        standard: [
          "https://images.unsplash.com/photo-1564767609342-620cb19b2357", // Tacos
          "https://images.unsplash.com/photo-1534352956036-cd81e27dd615", // Enchiladas
          "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c", // Chiles Rellenos
          "https://images.unsplash.com/photo-1611250282002-4b98945fc825", // Carne Asada
          "https://images.unsplash.com/photo-1618040996337-56904b7850b9"  // Quesadillas
        ],
        vegetarian: [
          "https://images.unsplash.com/photo-1618040996337-56904b7850b9", // Quesadillas
          "https://images.unsplash.com/photo-1562059390-a761a084768e", // Burritos
          "https://images.unsplash.com/photo-1534352956036-cd81e27dd615", // Enchiladas
          "https://images.unsplash.com/photo-1551326844-4df70f78d0e9", // Guacamole
          "https://images.unsplash.com/photo-1612225544180-bdd7a7a0dd7f"  // Tamales
        ],
        vegan: [
          "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85", // Vegan Tacos
          "https://images.unsplash.com/photo-1562059390-a761a084768e", // Burritos
          "https://images.unsplash.com/photo-1458898840853-20f9d66a50ad", // Tortilla Soup
          "https://images.unsplash.com/photo-1551326844-4df70f78d0e9", // Guacamole
          "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7"  // Rice Bowl
        ],
        keto: [
