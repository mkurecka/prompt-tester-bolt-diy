import React, { useState, useEffect } from 'react';
import { Model, Prompt, TestResult } from './types';
import { ApiKeyProvider, useApiKey } from './context/ApiKeyContext';
import ApiKeyInput from './components/ApiKeyInput';
import ModelSelector from './components/ModelSelector';
import PromptBuilder from './components/PromptBuilder';
import TestRunner from './components/TestRunner';
import TestResults from './components/TestResults';
import { BrainCircuit } from 'lucide-react';

const AppContent: React.FC = () => {
  const { apiKey } = useApiKey();
  const [selectedModels, setSelectedModels] = useState<Model[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSelectModels = (models: Model[]) => {
    setSelectedModels(models);
  };

  const handlePromptChange = (prompt: Prompt) => {
    setCurrentPrompt(prompt);
  };

  const handleTestComplete = (results: TestResult[]) => {
    setTestResults(results);
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <BrainCircuit className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Prompt Tester Tool</h1>
          </div>
          <div className="w-64">
            <ApiKeyInput />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {!apiKey ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Welcome to the Prompt Tester Tool</h2>
            <p className="text-gray-600 mb-6">
              Please enter your OpenRouter API key to get started. Your key is stored securely in your browser's session storage.
            </p>
            <div className="max-w-md mx-auto">
              <ApiKeyInput />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ModelSelector 
                selectedModels={selectedModels} 
                onSelectModels={handleSelectModels} 
              />
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <PromptBuilder 
                currentPrompt={currentPrompt} 
                onPromptChange={handlePromptChange} 
              />
              
              <TestRunner 
                selectedModels={selectedModels} 
                currentPrompt={currentPrompt} 
                onTestComplete={handleTestComplete} 
              />
              
              {showResults && testResults.length > 0 && (
                <TestResults 
                  results={testResults} 
                  models={selectedModels} 
                />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            Prompt Tester Tool for OpenRouter API • Built with React and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <ApiKeyProvider>
      <AppContent />
    </ApiKeyProvider>
  );
}

export default App;
