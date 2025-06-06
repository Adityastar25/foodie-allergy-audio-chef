
import React from "react";
import { ChefHat } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <div className="flex items-center">
          <ChefHat className="text-recipe-primary h-8 w-8 mr-2" />
          <h1 className="text-xl font-bold text-gray-800">Chef Ali Khan</h1>
        </div>
        <div className="ml-auto text-sm text-gray-500">
          Powered by Gemini AI
        </div>
      </div>
    </header>
  );
};

export default Header;
