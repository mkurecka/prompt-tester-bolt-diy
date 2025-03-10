import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';

export const generateId = (): string => {
  return uuidv4();
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const estimateTokens = (text: string): number => {
  // Very rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
};

export const generateCodeSnippet = (
  apiKey: string,
  modelId: string,
  messages: Message[],
  language: 'javascript' | 'python' | 'curl'
): string => {
  const formattedMessages = JSON.stringify(
    messages.map(msg => ({ role: msg.role, content: msg.content })),
    null,
    2
  );

  switch (language) {
    case 'javascript':
      return `
const axios = require('axios');

async function callOpenRouter() {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: "${modelId}",
      messages: ${formattedMessages}
    },
    {
      headers: {
        'Authorization': 'Bearer ${apiKey}',
        'HTTP-Referer': 'YOUR_SITE_URL', // Replace with your site URL
        'X-Title': 'YOUR_APP_NAME' // Replace with your app name
      }
    }
  );
  
  return response.data;
}

callOpenRouter()
  .then(result => console.log(result))
  .catch(error => console.error(error));
`;

    case 'python':
      return `
import requests
import json

def call_openrouter():
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": "Bearer ${apiKey}",
        "HTTP-Referer": "YOUR_SITE_URL",  # Replace with your site URL
        "X-Title": "YOUR_APP_NAME",  # Replace with your app name
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "${modelId}",
        "messages": ${formattedMessages}
    }
    
    response = requests.post(url, headers=headers, json=payload)
    return response.json()

result = call_openrouter()
print(json.dumps(result, indent=2))
`;

    case 'curl':
      return `
curl -X POST \\
  https://openrouter.ai/api/v1/chat/completions \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "HTTP-Referer: YOUR_SITE_URL" \\
  -H "X-Title: YOUR_APP_NAME" \\
  -H "Content-Type: application/json" \\
  -d '{
  "model": "${modelId}",
  "messages": ${formattedMessages.replace(/\n/g, '\n  ')}
}'
`;

    default:
      return '';
  }
};
