
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import RecipeForm from "@/components/RecipeForm";
import RecipeCard from "@/components/RecipeCard";
import { Recipe, RecipeRequest } from "@/types/recipe";
import { generateRecipe } from "@/services/recipeService";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const handleGenerateRecipe = async (request: RecipeRequest) => {
    setIsLoading(true);
    try {
      const response = await generateRecipe(request);
      
      if (response.success && response.recipe) {
        // Add new recipe to the beginning of the list
        setRecipes(prev => [response.recipe, ...prev]);
        toast({
          title: "Recipe Generated!",
          description: `Your ${response.recipe.title} recipe is ready.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Failed to generate recipe. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-recipe-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-4xl mx-auto">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Create Your Recipe</h2>
            <RecipeForm onSubmit={handleGenerateRecipe} isLoading={isLoading} />
          </section>
          
          {recipes.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Recipes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe, index) => (
                  <RecipeCard key={index} recipe={recipe} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      
      <footer className="bg-white py-4 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Recipe Generator. Powered by Gemini AI
        </div>
      </footer>
    </div>
  );
};

export default Index;
