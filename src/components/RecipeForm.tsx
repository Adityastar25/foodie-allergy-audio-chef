
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TagInput from "./TagInput";
import CuisineSelector from "./CuisineSelector";
import DietaryPreferenceSelector from "./DietaryPreferenceSelector";
import { RecipeRequest } from "@/types/recipe";
import { getGeminiApiKey } from "@/services/geminiService";
import GeminiApiKeyForm from "./GeminiApiKeyForm";

interface RecipeFormProps {
  onSubmit: (request: RecipeRequest) => void;
  isLoading: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, isLoading }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [cuisineType, setCuisineType] = useState("italian");
  const [dietaryPreference, setDietaryPreference] = useState("none");
  const [showApiKeyForm, setShowApiKeyForm] = useState(!getGeminiApiKey());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ingredients.length === 0) {
      alert("Please add at least one ingredient.");
      return;
    }
    
    onSubmit({
      ingredients,
      allergies,
      cuisineType,
      dietaryPreference: dietaryPreference === "none" ? undefined : dietaryPreference
    });
  };

  const handleApiKeySaved = () => {
    setShowApiKeyForm(false);
  };

  return (
    <div className="space-y-6">
      {showApiKeyForm ? (
        <GeminiApiKeyForm onApiKeySaved={handleApiKeySaved} />
      ) : (
        <Card className="w-full">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <TagInput
                label="Ingredients"
                placeholder="Add an ingredient and press Enter"
                tags={ingredients}
                setTags={setIngredients}
              />
              
              <TagInput
                label="Allergies"
                placeholder="Add allergies to avoid and press Enter"
                tags={allergies}
                setTags={setAllergies}
              />
              
              <CuisineSelector selected={cuisineType} onSelect={setCuisineType} />
              
              <DietaryPreferenceSelector selected={dietaryPreference} onSelect={setDietaryPreference} />
              
              <div className="flex flex-col space-y-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || ingredients.length === 0}
                >
                  {isLoading ? "Generating Recipe..." : "Generate Recipe"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowApiKeyForm(true)}
                  className="w-full"
                >
                  Change API Key
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecipeForm;
