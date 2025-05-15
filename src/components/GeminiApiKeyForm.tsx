
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getGeminiApiKey, setGeminiApiKey } from "@/services/geminiService";
import { toast } from "@/hooks/use-toast";

interface GeminiApiKeyFormProps {
  onApiKeySaved?: () => void;
}

const GeminiApiKeyForm: React.FC<GeminiApiKeyFormProps> = ({ onApiKeySaved }) => {
  const [apiKey, setApiKey] = useState("");
  const [isKeySet, setIsKeySet] = useState(false);

  useEffect(() => {
    const savedKey = getGeminiApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySet(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }
    
    const success = setGeminiApiKey(apiKey.trim());
    
    if (success) {
      setIsKeySet(true);
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
      
      if (onApiKeySaved) {
        onApiKeySaved();
      }
    }
  };

  const handleClear = () => {
    setApiKey("");
    setGeminiApiKey("");
    setIsKeySet(false);
    toast({
      title: "API Key Cleared",
      description: "Your API key has been removed",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Google Gemini API Key</CardTitle>
        <CardDescription>
          Enter your Google Gemini API key to enable AI recipe generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Your API key is stored locally in your browser and is not sent to our servers.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="flex-1">
              {isKeySet ? "Update Key" : "Save Key"}
            </Button>
            {isKeySet && (
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear Key
              </Button>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-gray-500 flex flex-col items-start">
        <p>Need an API key? <a href="https://ai.google.dev/tutorials/setup" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Get one from Google AI Studio</a></p>
      </CardFooter>
    </Card>
  );
};

export default GeminiApiKeyForm;
