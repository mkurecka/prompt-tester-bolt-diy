import axios from 'axios';
import { Model, Message, ApiResponse } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

export const fetchModels = async (apiKey: string): Promise<Model[]> => {
  try {
    const response = await axios.get(`${OPENROUTER_API_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Prompt Tester Tool'
      }
    });
    
    // Log the response to debug
    console.log('API Response:', response.data);
    
    // Ensure data exists and is an array
    if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
      console.error('Unexpected API response format:', response.data);
      return [];
    }
    
    return response.data.data.map((model: any) => {
      // Add defensive checks for each property
      return {
        id: model.id || 'unknown',
        name: model.name || model.id || 'Unknown Model',
        provider: model.provider?.name || 'Unknown Provider',
        capabilities: Array.isArray(model.capabilities) ? model.capabilities : [],
        description: model.description || '',
        pricing: {
          prompt: typeof model.pricing?.prompt === 'number' ? model.pricing.prompt : 0,
          completion: typeof model.pricing?.completion === 'number' ? model.pricing.completion : 0
        }
      };
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};

export const testPrompt = async (
  apiKey: string,
  modelId: string,
  messages: Message[]
): Promise<ApiResponse> => {
  try {
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await axios.post(
      `${OPENROUTER_API_URL}/chat/completions`,
      {
        model: modelId,
        messages: formattedMessages
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Prompt Tester Tool',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error testing prompt:', error);
    throw error;
  }
};

export const calculateCost = (
  model: Model,
  promptTokens: number,
  completionTokens: number
): number => {
  if (!model.pricing) return 0;
  
  const promptCost = (model.pricing.prompt || 0) * promptTokens / 1000;
  const completionCost = (model.pricing.completion || 0) * completionTokens / 1000;
  
  return promptCost + completionCost;
};
