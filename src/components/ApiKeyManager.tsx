
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ApiKeyManager = () => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isKeySet, setIsKeySet] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setIsKeySet(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid API key",
      });
      return;
    }

    localStorage.setItem('gemini_api_key', apiKey.trim());
    setIsKeySet(true);
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved locally.",
    });
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsKeySet(false);
    toast({
      title: "API Key Cleared",
      description: "Your API key has been removed.",
    });
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key size={20} />
          Gemini API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? "text" : "password"}
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          <Button onClick={handleSaveKey} disabled={!apiKey.trim()}>
            Save
          </Button>
          {isKeySet && (
            <Button variant="outline" onClick={handleClearKey}>
              Clear
            </Button>
          )}
        </div>
        
        {isKeySet && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            ✓ API key is configured and ready to use
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <p>Your API key is stored locally in your browser and never sent to our servers.</p>
          <p>Get your free Gemini API key from: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Google AI Studio</a></p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyManager;
