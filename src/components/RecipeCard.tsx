
import React, { useState, useEffect } from "react";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import speechService from "@/services/speechService";
import { Book, Pause, Play } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  
  // Effect to update speaking state when speech service state changes
  useEffect(() => {
    const checkSpeakingInterval = setInterval(() => {
      if (isSpeaking && !speechService.isSpeaking()) {
        setIsSpeaking(false);
      }
    }, 500);
    
    return () => clearInterval(checkSpeakingInterval);
  }, [isSpeaking]);
  
  // Effect to stop speaking when dialog is closed
  useEffect(() => {
    if (!isOpen && isSpeaking) {
      handleStopSpeaking();
    }
  }, [isOpen]);

  const handleSpeakInstructions = (e) => {
    try {
      // Prevent event from propagating to parent elements
      e.stopPropagation();
      
      if (isSpeaking) {
        handleStopSpeaking();
      } else {
        // Create a more detailed narration including title, ingredients and instructions
        const textToRead = `
          Recipe for ${recipe.title}.
          You will need the following ingredients:
          ${recipe.ingredients.join(", ")}.
          
          Now for the instructions:
          ${recipe.instructions.map((step, index) => `Step ${index + 1}: ${step}`).join(". ")}
        `;
        
        speechService.speak(textToRead);
        setIsSpeaking(true);
        
        toast({
          title: "Reading recipe aloud",
          description: "Listen to the recipe instructions being read aloud.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error with text-to-speech:", error);
      toast({
        variant: "destructive",
        title: "Speech Error",
        description: "Could not read recipe aloud. Your browser might not support this feature.",
        duration: 5000,
      });
      setIsSpeaking(false);
    }
  };
  
  const handleStopSpeaking = () => {
    try {
      speechService.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" 
        onClick={() => setIsOpen(true)}
      >
        <div 
          className="h-48 bg-cover bg-center" 
          style={{ 
            backgroundImage: `url(${recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"})`
          }}
        />
        <CardContent className="p-4">
          <h3 className="text-lg font-medium line-clamp-2">{recipe.title}</h3>
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>{recipe.preparationTime}</span>
            <span>{recipe.servings} servings</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open && isSpeaking) {
          handleStopSpeaking();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{recipe.title}</DialogTitle>
            <DialogDescription className="sr-only">
              Recipe details for {recipe.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img 
                src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                alt={recipe.title} 
                className="w-full h-64 object-cover rounded-md"
              />
              
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  {recipe.preparationTime}
                </div>
                <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  {recipe.servings} servings
                </div>
              </div>
              
              {recipe.nutritionalInfo && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Nutritional Information</h4>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <div className="font-medium">{recipe.nutritionalInfo.calories}</div>
                      <div className="text-gray-600">Calories</div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <div className="font-medium">{recipe.nutritionalInfo.protein}g</div>
                      <div className="text-gray-600">Protein</div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <div className="font-medium">{recipe.nutritionalInfo.carbs}g</div>
                      <div className="text-gray-600">Carbs</div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <div className="font-medium">{recipe.nutritionalInfo.fat}g</div>
                      <div className="text-gray-600">Fat</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="mb-4">
                <h4 className="font-medium mb-2">Ingredients</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="font-medium mb-2">Instructions</h4>
                  <Button
                    onClick={handleSpeakInstructions}
                    variant="outline"
                    className="flex items-center gap-1"
                    size="sm"
                  >
                    {isSpeaking ? <Pause size={16} /> : <Play size={16} />}
                    <Book size={16} className="ml-1" />
                    {isSpeaking ? "Stop Reading" : "Read Aloud"}
                  </Button>
                </div>
                <ol className="list-decimal pl-5 space-y-2">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="pl-1">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecipeCard;
