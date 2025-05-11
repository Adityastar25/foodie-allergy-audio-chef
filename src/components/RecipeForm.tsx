
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TagInput from "./TagInput";
import CuisineSelector from "./CuisineSelector";
import DietaryPreferenceSelector from "./DietaryPreferenceSelector";
import { RecipeRequest } from "@/types/recipe";

interface RecipeFormProps {
  onSubmit: (request: RecipeRequest) => void;
  isLoading: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, isLoading }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [cuisineType, setCuisineType] = useState("italian");
  const [dietaryPreference, setDietaryPreference] = useState("none");

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

  return (
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
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || ingredients.length === 0}
          >
            {isLoading ? "Generating Recipe..." : "Generate Recipe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RecipeForm;
