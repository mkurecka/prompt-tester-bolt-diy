import React, { useState } from 'react';
import { TestResult, Model } from '../types';
import { formatDate } from '../utils/helpers';
import { generateCodeSnippet } from '../utils/helpers';
import { useApiKey } from '../context/ApiKeyContext';
import { Copy, Download, Code, Clock, DollarSign } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TestResultsProps {
  results: TestResult[];
  models: Model[];
}

const TestResults: React.FC<TestResultsProps> = ({ results, models }) => {
  const { apiKey } = useApiKey();
  const [activeTab, setActiveTab] = useState<string>(results[0]?.modelId || '');
  const [codeLanguage, setCodeLanguage] = useState<'javascript' | 'python' | 'curl'>('javascript');
  
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No test results yet. Run a test to see results here.</p>
      </div>
    );
  }

  const activeResult = results.find(result => result.modelId === activeTab) || results[0];
  const activeModel = models.find(model => model.id === activeResult.modelId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResult = (result: TestResult) => {
    const fileName = `${result.timestamp}-${result.modelId.replace(/[^a-z0-9]/gi, '_')}.json`;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPromptConfig = () => {
    const config = {
      model: activeResult.modelId,
      messages: activeResult.prompt.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    };
    
    copyToClipboard(JSON.stringify(config, null, 2));
  };

  const getCodeSnippet = () => {
    if (!apiKey || !activeResult) return '';
    
    return generateCodeSnippet(
      apiKey,
      activeResult.modelId,
      activeResult.prompt,
      codeLanguage
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-gray-900">Test Results</h2>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          {results.map(result => {
            const model = models.find(m => m.id === result.modelId);
            
            return (
              <button
                key={result.id}
                onClick={() => setActiveTab(result.modelId)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  activeTab === result.modelId
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {model?.name || result.modelId}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {formatDate(activeResult.timestamp)}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <DollarSign className="h-4 w-4 mr-1" />
            Cost: ${activeResult.cost.toFixed(6)}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => downloadResult(activeResult)}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </button>
            
            <button
              onClick={exportPromptConfig}
              className="flex items-center px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy Config
            </button>
          </div>
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Response</h3>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{activeResult.response}</ReactMarkdown>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <Code className="h-4 w-4 mr-1" />
              Code Snippet
            </h3>
            
            <div className="flex space-x-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value as any)}
                className="text-xs border border-gray-300 rounded-md p-1"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="curl">cURL</option>
              </select>
              
              <button
                onClick={() => copyToClipboard(getCodeSnippet())}
                className="flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </button>
            </div>
          </div>
          
          <div className="text-xs">
            <SyntaxHighlighter
              language={codeLanguage === 'curl' ? 'bash' : codeLanguage}
              style={tomorrow}
              customStyle={{ borderRadius: '0.375rem' }}
            >
              {getCodeSnippet()}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
