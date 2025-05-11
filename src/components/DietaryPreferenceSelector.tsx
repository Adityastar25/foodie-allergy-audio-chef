
import React from "react";
import { Check } from "lucide-react";

interface DietaryOption {
  id: string;
  name: string;
  description: string;
}

interface DietaryPreferenceSelectorProps {
  selected: string;
  onSelect: (preference: string) => void;
}

const dietaryOptions: DietaryOption[] = [
  { 
    id: "none", 
    name: "No Preference", 
    description: "No specific dietary restrictions" 
  },
  { 
    id: "vegetarian", 
    name: "Vegetarian", 
    description: "No meat or fish" 
  },
  { 
    id: "vegan", 
    name: "Vegan", 
    description: "No animal products" 
  },
  { 
    id: "keto", 
    name: "Keto", 
    description: "Low carb, high fat" 
  },
  { 
    id: "paleo", 
    name: "Paleo", 
    description: "Whole foods, no processed ingredients" 
  },
  { 
    id: "gluten-free", 
    name: "Gluten-Free", 
    description: "No gluten-containing grains" 
  }
];

const DietaryPreferenceSelector: React.FC<DietaryPreferenceSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2">Dietary Preference</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {dietaryOptions.map((option) => (
          <div
            key={option.id}
            className={`relative p-3 rounded-lg border-2 hover:border-recipe-primary cursor-pointer transition-all ${
              selected === option.id ? 'border-recipe-primary bg-amber-50' : ''
            }`}
            onClick={() => onSelect(option.id)}
          >
            <div className="font-medium">{option.name}</div>
            <div className="text-sm text-gray-600">{option.description}</div>
            {selected === option.id && (
              <div className="absolute top-2 right-2">
                <Check size={16} className="text-recipe-primary" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DietaryPreferenceSelector;
