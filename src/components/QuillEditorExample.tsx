'use client';

import React, { useState } from 'react';
import QuillEditor from './QuillEditor';

// Example component showing how to use QuillEditor in different scenarios
const QuillEditorExample: React.FC = () => {
  const [emailContent, setEmailContent] = useState('');
  const [blogPost, setBlogPost] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">QuillEditor Usage Examples</h1>
      
      {/* Email Editor */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Email Editor</h2>
        <QuillEditor
          value={emailContent}
          onChange={setEmailContent}
          placeholder="Compose your email..."
          height="300px"
          className="border rounded-lg"
        />
      </div>

      {/* Blog Post Editor */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Blog Post Editor</h2>
        <QuillEditor
          value={blogPost}
          onChange={setBlogPost}
          placeholder="Write your blog post..."
          height="500px"
          className="border rounded-lg"
        />
      </div>

      {/* Simple Notes Editor */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Notes Editor</h2>
        <QuillEditor
          value={notes}
          onChange={setNotes}
          placeholder="Take some notes..."
          height="200px"
          className="border rounded-lg"
        />
      </div>

      {/* Read-only Editor */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Read-only Content</h2>
        <QuillEditor
          value="<p>This is read-only content that cannot be edited.</p>"
          onChange={() => {}}
          readOnly={true}
          height="150px"
          className="border rounded-lg bg-gray-50"
        />
      </div>
    </div>
  );
};

export default QuillEditorExample;
