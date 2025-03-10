export interface Model {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  description?: string;
  pricing?: {
    prompt: number;
    completion: number;
  };
  selected?: boolean;
}

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Prompt {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface TestResult {
  id: string;
  promptId: string;
  modelId: string;
  prompt: Message[];
  response: string;
  cost: number;
  timestamp: number;
}

export interface ApiResponse {
  id: string;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
