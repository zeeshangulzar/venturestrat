'use client';

import React from 'react';
import ClientSelect from './ClientSelect';

type FilterProps = {
  label: string;
  options?: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  type?: 'text' | 'multiselect';
};

const Filter: React.FC<FilterProps> = ({
  label,
  options = [],
  value,
  onChange,
  type = 'multiselect',
}) => {
  if (type === 'text') {
    return (
      <div className="mb-4 w-40">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
          type="text"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full p-2 border rounded"
          placeholder={`Enter ${label}`}
        />
      </div>
    );
  }

  const multiValue = Array.isArray(value) ? value : [];

  return (
    <div className="mb-4 w-64">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <ClientSelect
        isMulti
        options={options.map((opt) => ({ label: opt, value: opt }))}
        value={multiValue.map((val) => ({ label: val, value: val }))}
        onChange={(selected) =>
          onChange(
            Array.isArray(selected)
              ? selected.map((s: { value: string }) => s.value)
              : []
          )
        }
        className="mt-2"
        classNamePrefix="react-select"
        placeholder={`Search ${label}`}
      />
    </div>
  );
};

export default Filter;
