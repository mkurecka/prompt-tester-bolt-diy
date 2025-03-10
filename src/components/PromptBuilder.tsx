import React, { useState, useEffect } from 'react';
import { Message, Prompt } from '../types';
import { generateId } from '../utils/helpers';
import { savePrompt, getPrompts } from '../utils/storage';
import { MessageSquare, Plus, Save, Trash2, User, Bot, Settings } from 'lucide-react';

interface PromptBuilderProps {
  currentPrompt: Prompt | null;
  onPromptChange: (prompt: Prompt) => void;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({ currentPrompt, onPromptChange }) => {
  const [prompt, setPrompt] = useState<Prompt>({
    id: '',
    name: 'New Prompt',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    if (currentPrompt) {
      setPrompt(currentPrompt);
    } else {
      setPrompt({
        id: generateId(),
        name: 'New Prompt',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  }, [currentPrompt]);

  useEffect(() => {
    setSavedPrompts(getPrompts());
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt({ ...prompt, name: e.target.value, updatedAt: Date.now() });
  };

  const handleAddMessage = (role: 'system' | 'user' | 'assistant') => {
    const newMessage: Message = {
      id: generateId(),
      role,
      content: ''
    };
    
    const updatedPrompt = {
      ...prompt,
      messages: [...prompt.messages, newMessage],
      updatedAt: Date.now()
    };
    
    setPrompt(updatedPrompt);
    onPromptChange(updatedPrompt);
  };

  const handleMessageChange = (id: string, content: string) => {
    const updatedMessages = prompt.messages.map(msg => 
      msg.id === id ? { ...msg, content } : msg
    );
    
    const updatedPrompt = {
      ...prompt,
      messages: updatedMessages,
      updatedAt: Date.now()
    };
    
    setPrompt(updatedPrompt);
    onPromptChange(updatedPrompt);
  };

  const handleMessageRoleChange = (id: string, role: 'system' | 'user' | 'assistant') => {
    const updatedMessages = prompt.messages.map(msg => 
      msg.id === id ? { ...msg, role } : msg
    );
    
    const updatedPrompt = {
      ...prompt,
      messages: updatedMessages,
      updatedAt: Date.now()
    };
    
    setPrompt(updatedPrompt);
    onPromptChange(updatedPrompt);
  };

  const handleDeleteMessage = (id: string) => {
    const updatedMessages = prompt.messages.filter(msg => msg.id !== id);
    
    const updatedPrompt = {
      ...prompt,
      messages: updatedMessages,
      updatedAt: Date.now()
    };
    
    setPrompt(updatedPrompt);
    onPromptChange(updatedPrompt);
  };

  const handleSavePrompt = () => {
    const updatedPrompt = {
      ...prompt,
      updatedAt: Date.now()
    };
    
    savePrompt(updatedPrompt);
    setSavedPrompts(getPrompts());
    setPrompt(updatedPrompt);
    onPromptChange(updatedPrompt);
  };

  const handleLoadPrompt = (id: string) => {
    const selectedPrompt = savedPrompts.find(p => p.id === id);
    if (selectedPrompt) {
      setPrompt(selectedPrompt);
      onPromptChange(selectedPrompt);
    }
  };

  const handleNewPrompt = () => {
    const newPrompt: Prompt = {
      id: generateId(),
      name: 'New Prompt',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setPrompt(newPrompt);
    onPromptChange(newPrompt);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'system':
        return <Settings className="h-5 w-5 text-purple-500" />;
      case 'user':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'assistant':
        return <Bot className="h-5 w-5 text-green-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'system':
        return 'border-purple-200 bg-purple-50';
      case 'user':
        return 'border-blue-200 bg-blue-50';
      case 'assistant':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Prompt Builder</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNewPrompt}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
          >
            New
          </button>
          
          <select
            value=""
            onChange={(e) => handleLoadPrompt(e.target.value)}
            className="text-sm border border-gray-300 rounded-md p-1"
          >
            <option value="" disabled>Load saved prompt</option>
            {savedPrompts.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <label htmlFor="promptName" className="block text-sm font-medium text-gray-700 mb-1">
            Prompt Name
          </label>
          <input
            type="text"
            id="promptName"
            value={prompt.name}
            onChange={handleNameChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="space-y-4 mb-4">
          {prompt.messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`p-4 border rounded-lg ${getRoleColor(message.role)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getRoleIcon(message.role)}
                  <select
                    value={message.role}
                    onChange={(e) => handleMessageRoleChange(
                      message.id, 
                      e.target.value as 'system' | 'user' | 'assistant'
                    )}
                    className="ml-2 text-sm border border-gray-300 rounded-md p-1"
                  >
                    <option value="system">System</option>
                    <option value="user">User</option>
                    <option value="assistant">Assistant</option>
                  </select>
                  <span className="ml-2 text-xs text-gray-500">Message {index + 1}</span>
                </div>
                
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <textarea
                value={message.content}
                onChange={(e) => handleMessageChange(message.id, e.target.value)}
                rows={5}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder={`Enter ${message.role} message...`}
              />
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleAddMessage('system')}
            className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            System
          </button>
          
          <button
            onClick={() => handleAddMessage('user')}
            className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            User
          </button>
          
          <button
            onClick={() => handleAddMessage('assistant')}
            className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            Assistant
          </button>
        </div>
        
        <button
          onClick={handleSavePrompt}
          disabled={prompt.messages.length === 0}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Prompt
        </button>
      </div>
    </div>
  );
};

export default PromptBuilder;
