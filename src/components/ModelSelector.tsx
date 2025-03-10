import React, { useState, useEffect } from 'react';
import { Model } from '../types';
import { fetchModels } from '../services/api';
import { useApiKey } from '../context/ApiKeyContext';
import { Check, Server, AlertCircle, RefreshCw } from 'lucide-react';

interface ModelSelectorProps {
  selectedModels: Model[];
  onSelectModels: (models: Model[]) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModels, onSelectModels }) => {
  const { apiKey } = useApiKey();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string | null>(null);

  const loadModels = async () => {
    if (!apiKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedModels = await fetchModels(apiKey);
      setModels(fetchedModels);
    } catch (err) {
      setError('Failed to load models. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, [apiKey]);

  const handleModelToggle = (model: Model) => {
    const isSelected = selectedModels.some(m => m.id === model.id);
    
    if (isSelected) {
      onSelectModels(selectedModels.filter(m => m.id !== model.id));
    } else {
      onSelectModels([...selectedModels, model]);
    }
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          model.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = !filterProvider || model.provider === filterProvider;
    return matchesSearch && matchesProvider;
  });

  const providers = Array.from(new Set(models.map(model => model.provider))).sort();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Server className="h-5 w-5 mr-2 text-blue-500" />
            Available Models
          </h2>
          <button 
            onClick={loadModels}
            disabled={loading || !apiKey}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="Refresh models"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterProvider(null)}
              className={`text-xs px-2 py-1 rounded-full ${
                filterProvider === null 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All Providers
            </button>
            {providers.map(provider => (
              <button
                key={provider}
                onClick={() => setFilterProvider(provider === filterProvider ? null : provider)}
                className={`text-xs px-2 py-1 rounded-full ${
                  provider === filterProvider 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : filteredModels.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredModels.map(model => {
              const isSelected = selectedModels.some(m => m.id === model.id);
              
              return (
                <li 
                  key={model.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                  onClick={() => handleModelToggle(model)}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-5 w-5 rounded border ${
                      isSelected 
                        ? 'bg-blue-500 border-blue-500 flex items-center justify-center' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{model.name}</p>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                          {model.provider}
                        </span>
                      </div>
                      
                      {model.description && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{model.description}</p>
                      )}
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        {model.capabilities?.map(capability => (
                          <span 
                            key={capability} 
                            className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded"
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                      
                      {model.pricing && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="inline-block mr-3">
                            Input: ${(model.pricing.prompt * 1000).toFixed(2)}/1M tokens
                          </span>
                          <span className="inline-block">
                            Output: ${(model.pricing.completion * 1000).toFixed(2)}/1M tokens
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            {models.length > 0 
              ? 'No models match your search criteria.' 
              : 'No models available. Please check your API key.'}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-50 border-t">
        <div className="text-sm text-gray-700">
          <span className="font-medium">{selectedModels.length}</span> of {models.length} models selected
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;
