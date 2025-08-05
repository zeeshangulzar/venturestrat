// components/Filter.tsx
import React from 'react';

type FilterProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

const Filter: React.FC<FilterProps> = ({ label, options, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 w-full p-2 border rounded"
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default Filter;
