
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import RecipeForm from "@/components/RecipeForm";
import RecipeCard from "@/components/RecipeCard";
import ApiKeyManager from "@/components/ApiKeyManager";
import { Recipe, RecipeRequest } from "@/types/recipe";
import { generateRecipe } from "@/services/recipeService";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 6;

  const handleGenerateRecipe = async (request: RecipeRequest) => {
    setIsLoading(true);
    try {
      const response = await generateRecipe(request);
      
      if (response.success && response.recipes && response.recipes.length > 0) {
        // Clear previous recipes and set new ones
        setRecipes(response.recipes);
        setCurrentPage(1); // Reset to first page when new recipes are generated
        
        toast({
          title: "Recipes Generated!",
          description: `${response.recipes.length} new recipes are ready.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Failed to generate recipes. Please try again.",
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
  
  // Pagination logic
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  return (
    <div className="min-h-screen flex flex-col bg-recipe-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-6xl mx-auto">
          <ApiKeyManager />
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Create Your Recipe</h2>
            <RecipeForm onSubmit={handleGenerateRecipe} isLoading={isLoading} />
          </section>
          
          {recipes.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Recipes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentRecipes.map((recipe, index) => (
                  <RecipeCard key={`${recipe.title}-${index}`} recipe={recipe} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            isActive={currentPage === i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
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
