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

  // AI editing functions
  const handleTextSelected = (text: string, range: any) => {
    setSelectedText(text);
    setSelectedRange(range);
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
            <div className="absolute z-40 flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2"
                 style={{
                   top: '50%',
                   left: '50%',
                   transform: 'translate(-50%, -50%)',
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
