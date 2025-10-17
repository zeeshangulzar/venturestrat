'use client';

import React from 'react';

interface InitialsAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function InitialsAvatar({ 
  name, 
  size = 'md', 
  className = '', 
  backgroundColor,
  textColor = '#ffffff'
}: InitialsAvatarProps) {
  // Extract initials from the name
  const getInitials = (name: string): string => {
    if (!name || name.trim() === '') return '?';
    
    // Always take only the first letter of the first word
    const firstWord = name.trim().split(/\s+/)[0];
    return firstWord.charAt(0).toUpperCase();
  };

  // Generate background color based on name if not provided
  const generateBackgroundColor = (name: string): string => {
    if (backgroundColor) return backgroundColor;
    
    // Generate a consistent color based on the name
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Violet
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
      '#EC4899', // Pink
      '#6366F1', // Indigo
    ];
    
    // Simple hash function to get consistent color for same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-6 h-6',
      text: 'text-xs'
    },
    md: {
      container: 'w-8 h-8',
      text: 'text-sm'
    },
    lg: {
      container: 'w-12 h-12',
      text: 'text-lg'
    }
  };

  const initials = getInitials(name);
  const bgColor = generateBackgroundColor(name);

  return (
    <div 
      className={`${sizeConfig[size].container} rounded-full flex items-center justify-center font-semibold ${sizeConfig[size].text} ${className}`}
      style={{ 
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      {initials}
    </div>
  );
}
