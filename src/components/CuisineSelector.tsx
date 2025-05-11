
import React from "react";
import { Check } from "lucide-react";

interface CuisineOption {
  id: string;
  name: string;
  icon: string;
}

interface CuisineSelectorProps {
  selected: string;
  onSelect: (cuisine: string) => void;
}

const cuisineOptions: CuisineOption[] = [
  { id: "italian", name: "Italian", icon: "🍝" },
  { id: "chinese", name: "Chinese", icon: "🥢" },
  { id: "indian", name: "Indian", icon: "🍛" },
  { id: "mexican", name: "Mexican", icon: "🌮" },
  { id: "mediterranean", name: "Mediterranean", icon: "🫒" },
  { id: "japanese", name: "Japanese", icon: "🍣" },
  { id: "american", name: "American", icon: "🍔" }
];

const CuisineSelector: React.FC<CuisineSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2">Cuisine Type</label>
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
        {cuisineOptions.map((cuisine) => (
          <div
            key={cuisine.id}
            className={`cuisine-card ${selected === cuisine.id ? 'selected' : ''}`}
            onClick={() => onSelect(cuisine.id)}
          >
            <div className="text-3xl mb-1">{cuisine.icon}</div>
            <div className="text-sm text-center">{cuisine.name}</div>
            {selected === cuisine.id && (
              <div className="absolute top-1 right-1">
                <Check size={16} className="text-recipe-primary" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CuisineSelector;
