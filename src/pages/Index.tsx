
import { useState } from "react";
import { Container } from "@/components/ui/container";
import Header from "@/components/Header";
import RecipeForm from "@/components/RecipeForm";
import RecipeCard from "@/components/RecipeCard";
import { RecipeRequest, Recipe, GeminiResponse } from "@/types/recipe";
import { generateRecipe } from "@/services/recipeService";
import { generateRecipesWithGemini } from "@/services/geminiService";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (request: RecipeRequest) => {
    setLoading(true);
    
    try {
      // Try to use Gemini API first
      const geminiResponse = await generateRecipesWithGemini(request);
      
      if (geminiResponse.success && geminiResponse.recipes.length > 0) {
        setRecipes(geminiResponse.recipes);
      } else {
        // Fall back to mock recipe generation if Gemini API fails
        const mockResponse = await generateRecipe(request);
        setRecipes(mockResponse.recipes);
      }
    } catch (error) {
      console.error("Error generating recipes:", error);
      toast({
        title: "Error",
        description: "Failed to generate recipes. Please try again.",
        variant: "destructive",
      });
      
      // Fall back to mock recipe generation
      try {
        const mockResponse = await generateRecipe(request);
        setRecipes(mockResponse.recipes);
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        setRecipes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Container className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <RecipeForm onSubmit={handleFormSubmit} isLoading={loading} />
          </div>
          <div className="md:col-span-2">
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-lg text-gray-500">Generating recipes...</div>
                </div>
              ) : recipes.length > 0 ? (
                recipes.map((recipe, index) => (
                  <RecipeCard key={index} recipe={recipe} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <h3 className="text-xl font-medium text-gray-700">No Recipes Yet</h3>
                  <p className="text-gray-500 mt-2">
                    Enter your ingredients and preferences to generate recipes
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Index;
