import React, { useState } from 'react';
import { Model, Prompt, TestResult, Message } from '../types';
import { testPrompt, calculateCost } from '../services/api';
import { generateId } from '../utils/helpers';
import { saveTestResult } from '../utils/storage';
import { Play, AlertCircle, Loader } from 'lucide-react';
import { useApiKey } from '../context/ApiKeyContext';

interface TestRunnerProps {
  selectedModels: Model[];
  currentPrompt: Prompt | null;
  onTestComplete: (results: TestResult[]) => void;
}

const TestRunner: React.FC<TestRunnerProps> = ({ 
  selectedModels, 
  currentPrompt, 
  onTestComplete 
}) => {
  const { apiKey } = useApiKey();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{[key: string]: boolean}>({});

  const runTests = async () => {
    if (!currentPrompt || currentPrompt.messages.length === 0) {
      setError('Please create a prompt with at least one message.');
      return;
    }

    if (selectedModels.length === 0) {
      setError('Please select at least one model to test.');
      return;
    }

    if (!apiKey) {
      setError('Please set your OpenRouter API key.');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress({});

    const results: TestResult[] = [];
    const newProgress = { ...progress };

    try {
      const testPromises = selectedModels.map(async (model) => {
        try {
          newProgress[model.id] = false;
          setProgress(newProgress);

          const response = await testPrompt(apiKey, model.id, currentPrompt.messages);
          
          const cost = calculateCost(
            model,
            response.usage.prompt_tokens,
            response.usage.completion_tokens
          );

          const result: TestResult = {
            id: generateId(),
            promptId: currentPrompt.id,
            modelId: model.id,
            prompt: currentPrompt.messages,
            response: response.choices[0].message.content,
            cost,
            timestamp: Date.now()
          };

          saveTestResult(result);
          results.push(result);
          
          newProgress[model.id] = true;
          setProgress({ ...newProgress });
          
          return result;
        } catch (error) {
          console.error(`Error testing model ${model.id}:`, error);
          newProgress[model.id] = true;
          setProgress({ ...newProgress });
          throw error;
        }
      });

      await Promise.allSettled(testPromises);
      
      if (results.length > 0) {
        onTestComplete(results);
      } else {
        setError('All tests failed. Please check the console for details.');
      }
    } catch (error) {
      console.error('Error running tests:', error);
      setError('An error occurred while running tests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !apiKey || !currentPrompt || currentPrompt.messages.length === 0 || selectedModels.length === 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Test Runner</h2>
        <p className="text-sm text-gray-600">
          Run your prompt against the selected models to compare responses.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Models</h3>
        {selectedModels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedModels.map(model => (
              <div 
                key={model.id}
                className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
              >
                {model.name}
                {loading && (
                  progress[model.id] === false ? (
                    <Loader className="ml-2 h-3 w-3 animate-spin text-blue-500" />
                  ) : progress[model.id] === true ? (
                    <span className="ml-2 h-3 w-3 rounded-full bg-green-500"></span>
                  ) : null
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No models selected. Please select at least one model.</p>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Current Prompt</h3>
        {currentPrompt && currentPrompt.messages.length > 0 ? (
          <div className="text-sm text-gray-600">
            <p className="font-medium">{currentPrompt.name}</p>
            <p>{currentPrompt.messages.length} message(s)</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No prompt created. Please create a prompt first.</p>
        )}
      </div>

      <button
        onClick={runTests}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${
          isDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {loading ? (
          <>
            <Loader className="animate-spin h-5 w-5 mr-2" />
            Running Tests...
          </>
        ) : (
          <>
            <Play className="h-5 w-5 mr-2" />
            Run Tests
          </>
        )}
      </button>
    </div>
  );
};

export default TestRunner;
