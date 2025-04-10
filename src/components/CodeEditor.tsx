import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface CodeEditorProps {
  language: string;
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onRunCode?: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  language, 
  initialCode = '', 
  onCodeChange, 
  onRunCode 
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string | null>(null);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  
  // Map language to starter code
  useEffect(() => {
    let starterCode = '';
    
    switch (language) {
      case 'javascript':
        starterCode = `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solution(nums, target) {
  // Your code here
  
  return [];
}
`;
        break;
      case 'python':
        starterCode = `def solution(nums, target):
    # Your code here
    
    return []
`;
        break;
      case 'java':
        starterCode = `class Solution {
    public int[] solution(int[] nums, int target) {
        // Your code here
        
        return new int[0];
    }
}
`;
        break;
      case 'cpp':
        starterCode = `class Solution {
public:
    vector<int> solution(vector<int>& nums, int target) {
        // Your code here
        
        return {};
    }
};
`;
        break;
      case 'csharp':
        starterCode = `public class Solution {
    public int[] Solution(int[] nums, int target) {
        // Your code here
        
        return new int[0];
    }
}
`;
        break;
      case 'ruby':
        starterCode = `def solution(nums, target)
  # Your code here
  
  return []
end
`;
        break;
      case 'go':
        starterCode = `package main

import "fmt"

func solution(nums []int, target int) []int {
  // Your code here
  
  return []int{}
}

func main() {
  fmt.Println(solution([]int{2, 7, 11, 15}, 9))
}
`;
        break;
      case 'typescript':
        starterCode = `function solution(nums: number[], target: number): number[] {
  // Your code here
  
  return [];
}
`;
        break;
      default:
        starterCode = '// Start coding here';
    }
    
    setCode(initialCode || starterCode);
  }, [language, initialCode]);
  
  useEffect(() => {
    if (onCodeChange) {
      onCodeChange(code);
    }
  }, [code, onCodeChange]);
  
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };
  
  const handleRunCode = () => {
    if (code.trim() === '') {
      toast.error("Code cannot be empty");
      return;
    }
    
    // In a real app, this would send the code to a backend for execution
    setOutput("Running your code...");
    setIsOutputOpen(true);
    
    // Simulate code execution
    setTimeout(() => {
      if (Math.random() > 0.3) {
        setOutput("✅ Test cases passed!\n\nInput: [2,7,11,15], target = 9\nExpected: [0,1]\nOutput: [0,1]\n\nInput: [3,2,4], target = 6\nExpected: [1,2]\nOutput: [1,2]");
      } else {
        setOutput("❌ Some test cases failed.\n\nInput: [2,7,11,15], target = 9\nExpected: [0,1]\nOutput: [0,1] ✓\n\nInput: [3,2,4], target = 6\nExpected: [1,2]\nOutput: null ✗");
      }
      
      if (onRunCode) {
        onRunCode(code);
      }
    }, 1500);
  };
  
  const handleSaveCode = () => {
    // In a real app, this would save the code to the backend
    toast.success("Code saved successfully");
  };
  
  const getLanguageClass = (lang: string) => {
    switch (lang) {
      case 'javascript': return 'language-javascript';
      case 'python': return 'language-python';
      case 'java': return 'language-java';
      case 'cpp': return 'language-cpp';
      case 'csharp': return 'language-csharp';
      case 'ruby': return 'language-ruby';
      case 'go': return 'language-go';
      case 'typescript': return 'language-typescript';
      default: return 'language-javascript';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor toolbar */}
      <div className="bg-icon-gray px-4 py-2 flex items-center justify-between rounded-t-md">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-icon-light-gray text-sm">
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveCode}
            className="h-8 text-xs hover:bg-icon-gray/70"
          >
            <Save size={14} className="mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            onClick={handleRunCode}
            className="h-8 text-xs bg-icon-accent text-icon-black hover:brightness-105"
          >
            <Play size={14} className="mr-1" />
            Run
          </Button>
        </div>
      </div>
      
      {/* Code editor */}
      <div className="flex-grow flex flex-col">
        <textarea
          value={code}
          onChange={handleCodeChange}
          className={`flex-grow p-4 bg-icon-dark-gray text-icon-white font-mono text-sm resize-none outline-none ${getLanguageClass(language)}`}
          spellCheck="false"
          placeholder="Write your solution here..."
        />
      </div>
      
      {/* Output console */}
      {isOutputOpen && output && (
        <div className="border-t border-icon-gray">
          <div className="bg-icon-gray px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-medium">Output</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOutputOpen(false)}
            >
              <X size={14} />
            </Button>
          </div>
          <pre className="p-4 bg-icon-black text-icon-light-gray font-mono text-sm h-40 overflow-auto">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
