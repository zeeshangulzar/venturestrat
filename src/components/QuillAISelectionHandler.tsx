'use client';

import React, { useEffect, useRef } from 'react';

interface QuillAISelectionHandlerProps {
  quillRef: React.RefObject<any>;
  onTextSelected: (text: string, range: any) => void;
  onSelectionCleared: () => void;
  enabled: boolean;
}

export default function QuillAISelectionHandler({
  quillRef,
  onTextSelected,
  onSelectionCleared,
  enabled
}: QuillAISelectionHandlerProps) {
  const selectionHandlerRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || !quillRef.current) return;

    const quillEditor = quillRef.current.getEditor();
    if (!quillEditor) return;

    // Set up Quill's selection-change event
    const handleSelectionChange = (range: any, oldRange: any, source: string) => {
      
      if (range && range.length > 0) {
        // Text is selected
        const selectedText = quillEditor.getText(range.index, range.length);
        
        if (selectedText.trim().length > 0) {
          onTextSelected(selectedText.trim(), range);
        }
      } else {
        // Selection cleared
        onSelectionCleared();
      }
    };

    // Store the handler reference for cleanup
    selectionHandlerRef.current = handleSelectionChange;
    
    // Add the event listener
    quillEditor.on('selection-change', handleSelectionChange);

    // Cleanup function
    return () => {
      if (quillEditor && selectionHandlerRef.current) {
        quillEditor.off('selection-change', selectionHandlerRef.current);
      }
    };
  }, [enabled, quillRef, onTextSelected, onSelectionCleared]);

  return null; // This component doesn't render anything
}
