import { Prompt, TestResult } from '../types';

// Prompts Storage
export const savePrompt = (prompt: Prompt): void => {
  const prompts = getPrompts();
  const existingIndex = prompts.findIndex(p => p.id === prompt.id);
  
  if (existingIndex >= 0) {
    prompts[existingIndex] = prompt;
  } else {
    prompts.push(prompt);
  }
  
  localStorage.setItem('prompts', JSON.stringify(prompts));
};

export const getPrompts = (): Prompt[] => {
  const promptsJson = localStorage.getItem('prompts');
  return promptsJson ? JSON.parse(promptsJson) : [];
};

export const getPromptById = (id: string): Prompt | undefined => {
  const prompts = getPrompts();
  return prompts.find(p => p.id === id);
};

export const deletePrompt = (id: string): void => {
  const prompts = getPrompts().filter(p => p.id !== id);
  localStorage.setItem('prompts', JSON.stringify(prompts));
};

// Test Results Storage
export const saveTestResult = (result: TestResult): void => {
  const results = getTestResults();
  results.push(result);
  localStorage.setItem('testResults', JSON.stringify(results));
  
  // Also save to "disk" (simulated by creating a downloadable file)
  const fileName = `${result.timestamp}-${result.modelId.replace(/[^a-z0-9]/gi, '_')}.json`;
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

export const getTestResults = (): TestResult[] => {
  const resultsJson = localStorage.getItem('testResults');
  return resultsJson ? JSON.parse(resultsJson) : [];
};

export const getTestResultById = (id: string): TestResult | undefined => {
  const results = getTestResults();
  return results.find(r => r.id === id);
};

export const getTestResultsByPromptId = (promptId: string): TestResult[] => {
  const results = getTestResults();
  return results.filter(r => r.promptId === promptId);
};

export const deleteTestResult = (id: string): void => {
  const results = getTestResults().filter(r => r.id !== id);
  localStorage.setItem('testResults', JSON.stringify(results));
};
