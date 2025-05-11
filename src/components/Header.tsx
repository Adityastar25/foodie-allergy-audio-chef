
import React from "react";
import { Chef } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <div className="flex items-center">
          <Chef className="text-recipe-primary h-8 w-8 mr-2" />
          <h1 className="text-xl font-bold text-gray-800">Recipe Generator</h1>
        </div>
        <div className="ml-auto text-sm text-gray-500">
          Powered by Gemini AI
        </div>
      </div>
    </header>
  );
};

export default Header;
