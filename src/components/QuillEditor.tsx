'use client';

import React, { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';

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
  style = {}
}) => {
  const [isClient, setIsClient] = useState(false);
  const [ReactQuill, setReactQuill] = useState<React.ComponentType<Record<string, unknown>> | null>(null);

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
    <div className={`quill-editor-wrapper ${className}`}>
      <ReactQuill
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
  );
};

export default QuillEditor;
