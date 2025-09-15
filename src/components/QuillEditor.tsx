'use client';

import React, { useState, useEffect, useRef } from 'react';
import 'react-quill/dist/quill.snow.css';
import AIEditModal from './AIEditModal';
import QuillAISelectionHandler from './QuillAISelectionHandler';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string | number;
  modules?: Record<string, unknown>;
  formats?: string[];
  className?: string;
  style?: React.CSSProperties;
  enableAIEditing?: boolean;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter your content...',
  readOnly = false,
  height = '400px',
  modules,
  formats,
  className = '',
  style = {},
  enableAIEditing = false
}) => {
  const [isClient, setIsClient] = useState(false);
  const [ReactQuill, setReactQuill] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<any>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const quillContentRef = useRef<HTMLDivElement | null>(null);

  // Default modules configuration
  const defaultModules = {
    toolbar: [
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  // Default formats
  const defaultFormats = [
    'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align'
  ];

  useEffect(() => {
    // Only load ReactQuill on client side to avoid SSR issues
    if (typeof window !== 'undefined') {
      import('react-quill').then((module) => {
        setReactQuill(() => module.default);
        setIsClient(true);
      }).catch((error) => {
        console.error('Failed to load React Quill:', error);
      });
    }
  }, []);

  // Update quillContentRef when quillRef changes
  useEffect(() => {
    if (quillRef.current) {
      const quillEditor = quillRef.current.getEditor();
      if (quillEditor && quillEditor.root) {
        quillContentRef.current = quillEditor.root;
      }
    }
  }, [isClient]); // Update when ReactQuill is loaded

  // Update button position on scroll and resize
  useEffect(() => {
    if (!showFloatingButton || !selectedRange) return;

    const updatePosition = () => {
      calculateButtonPosition(selectedRange);
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showFloatingButton, selectedRange]);

  // Function to calculate button position at the end of selected text
  const calculateButtonPosition = (range: any) => {
    if (!quillRef.current || !quillContentRef.current) return;

    const quillEditor = quillRef.current.getEditor();
    if (!quillEditor) return;

    try {
      // Get the bounds of the selection
      const bounds = quillEditor.getBounds(range);
      if (!bounds) return;

      // Get the editor container's position
      const editorRect = quillContentRef.current.getBoundingClientRect();
      
      // Get the text content of the selection
      const selectedText = quillEditor.getText(range.index, range.length);
      
      let endPosition;
      
      if (selectedText.includes('\n')) {
        // Multi-line selection: find the actual end of the text using DOM
        const endIndex = range.index + range.length;
        
        // Create a range that ends at the exact end of the selection
        const endRange = { index: endIndex - 1, length: 1 };
        const endBounds = quillEditor.getBounds(endRange);
        
        if (endBounds) {
          // Position at the end of the last character
          endPosition = {
            top: endBounds.top + editorRect.top - 10,
            left: endBounds.left + endBounds.width + editorRect.left + 10
          };
        } else {
          // Fallback: try to get bounds of the last line
          const lines = selectedText.split('\n');
          const lastLine = lines[lines.length - 1];
          
          if (lastLine.length > 0) {
            // Find the start of the last line in the selection
            const lastLineStart = range.index + selectedText.lastIndexOf('\n') + 1;
            const lastLineRange = { index: lastLineStart, length: lastLine.length };
            const lastLineBounds = quillEditor.getBounds(lastLineRange);
            
            if (lastLineBounds) {
              endPosition = {
                top: lastLineBounds.top + editorRect.top - 10,
                left: lastLineBounds.left + lastLineBounds.width + editorRect.left + 10
              };
            } else {
              // Final fallback to original bounds
              endPosition = {
                top: bounds.top + editorRect.top - 10,
                left: bounds.left + bounds.width + editorRect.left + 10
              };
            }
          } else {
            // Empty last line, position at the end of the previous line
            endPosition = {
              top: bounds.top + editorRect.top - 10,
              left: bounds.left + bounds.width + editorRect.left + 10
            };
          }
        }
      } else {
        // Single line selection: use original calculation
        endPosition = {
          top: bounds.top + editorRect.top - 10,
          left: bounds.left + bounds.width + editorRect.left + 10
        };
      }

      // Ensure button doesn't go off-screen
      const buttonWidth = 200; // Approximate button width
      const buttonHeight = 40; // Approximate button height
      
      // Check if button would go off the right edge
      if (endPosition.left + buttonWidth > window.innerWidth) {
        endPosition.left = window.innerWidth - buttonWidth - 10;
      }
      
      // Check if button would go off the top edge
      if (endPosition.top < 10) {
        endPosition.top = bounds.top + editorRect.top + bounds.height + 10; // Position below text instead
      }
      
      // Check if button would go off the bottom edge
      if (endPosition.top + buttonHeight > window.innerHeight) {
        endPosition.top = window.innerHeight - buttonHeight - 10;
      }

      setButtonPosition(endPosition);
    } catch (error) {
      console.error('Error calculating button position:', error);
      // Fallback to center position
      setButtonPosition({ top: 0, left: 0 });
    }
  };

  // AI editing functions
  const handleTextSelected = (text: string, range: any) => {
    setSelectedText(text);
    setSelectedRange(range);
    calculateButtonPosition(range);
    setShowFloatingButton(true);
  };

  const handleSelectionCleared = () => {
    setShowFloatingButton(false);
    // Only clear selection if modal is not open
    if (!isAIModalOpen) {
      setSelectedText('');
      setSelectedRange(null);
    }
  };

  const handleEditWithAI = () => {
    setIsAIModalOpen(true);
    setShowFloatingButton(false);
  };

  const handleClearSelection = () => {
    if (quillRef.current) {
      const quillEditor = quillRef.current.getEditor();
      quillEditor.setSelection(null);
    }
    setShowFloatingButton(false);
  };

  const generateAI = async (prompt: string, selectedText: string, previousResponse?: string): Promise<string> => {
    try {      
      const response = await fetch('/api/chatgpt/edit-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          selectedText,
          previousResponse
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error response:', errorData);
        throw new Error(`Failed to generate AI response: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  };

  const insertTextAtCursor = (text: string) => {
    if (quillRef.current && selectedRange) {
      const quill = quillRef.current.getEditor();
      quill.insertText(selectedRange.index + selectedRange.length, text);
      quill.setSelection(selectedRange.index + selectedRange.length + text.length);
    }
  };

  const replaceSelectedText = (text: string) => {
    if (quillRef.current && selectedRange) {
      const quill = quillRef.current.getEditor();
      quill.deleteText(selectedRange.index, selectedRange.length);
      quill.insertText(selectedRange.index, text);
      quill.setSelection(selectedRange.index + text.length);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleAddNew = (text: string) => {
    insertTextAtCursor(text);
  };

  const handleReplace = (text: string) => {
    replaceSelectedText(text);
  };

  if (!isClient || !ReactQuill) {
    return (
      <div 
        className={`w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center ${className}`}
        style={{ height, ...style }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  const editorStyle = {
    height: typeof height === 'number' ? `${height}px` : height,
    ...style
  };

  return (
    <div className={`quill-editor-wrapper relative ${className}`}>
      <div ref={editorRef}>
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={(content: string) => onChange(content)}
          modules={modules || defaultModules}
          formats={formats || defaultFormats}
          placeholder={placeholder}
          readOnly={readOnly}
          style={editorStyle}
          theme="snow"
        />
      </div>
      
      {/* AI Editing Components */}
      {enableAIEditing && !readOnly && (
        <>
          <QuillAISelectionHandler
            quillRef={quillRef}
            onTextSelected={handleTextSelected}
            onSelectionCleared={handleSelectionCleared}
            enabled={enableAIEditing}
          />
          
          {showFloatingButton && (
            <div className="fixed z-40 flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2"
                 style={{
                   top: `${buttonPosition.top}px`,
                   left: `${buttonPosition.left}px`,
                 }}>
              <button
                onClick={handleClearSelection}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Clear selection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="w-px h-4 bg-gray-200"></div>
              
              <button
                onClick={handleEditWithAI}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                title="Edit with AI"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm font-medium">Edit with AI</span>
              </button>
            </div>
          )}
          
          <AIEditModal
            isOpen={isAIModalOpen}
            onClose={() => {
              setIsAIModalOpen(false);
              // Clear selection when modal is closed
              setSelectedText('');
              setSelectedRange(null);
            }}
            selectedText={selectedText}
            onCopy={handleCopy}
            onAddNew={handleAddNew}
            onReplace={handleReplace}
            onGenerateAI={generateAI}
          />
        </>
      )}
    </div>
  );
};

export default QuillEditor;
