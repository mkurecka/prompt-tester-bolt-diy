import React, { useState } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import { Key, KeyRound, Save } from 'lucide-react';

const ApiKeyInput: React.FC = () => {
  const { apiKey, setApiKey } = useApiKey();
  const [inputKey, setInputKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      setApiKey(inputKey.trim());
      setInputKey('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {apiKey ? (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <KeyRound className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">API Key is set</span>
          </div>
          <div className="flex items-center">
            <input
              type={isVisible ? "text" : "password"}
              value={apiKey}
              readOnly
              className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
            />
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              {isVisible ? "Hide" : "Show"}
            </button>
          </div>
          <button
            onClick={() => setApiKey('')}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear API Key
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <div className="flex items-center">
            <Key className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Enter OpenRouter API Key</h3>
          </div>
          <p className="text-sm text-gray-600">
            Your API key is stored securely in your browser's session storage and is never sent to our servers.
          </p>
          <div className="flex">
            <input
              type={isVisible ? "text" : "password"}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="sk-or-..."
              className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
            >
              {isVisible ? "Hide" : "Show"}
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ApiKeyInput;
