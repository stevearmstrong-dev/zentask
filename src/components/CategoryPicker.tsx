import React, { useState, useRef, useEffect } from 'react';

interface CategoryPickerProps {
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
}

interface CategoryOption {
  value: string;
  label: string;
}

function CategoryPicker({ selectedCategory, onSelectCategory }: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const predefinedCategories: CategoryOption[] = [
    { value: '', label: 'No Category' },
    { value: 'Work', label: 'Work' },
    { value: 'Personal', label: 'Personal' },
    { value: 'Coding', label: 'Coding' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Health', label: 'Health' },
    { value: 'Hydration', label: 'Hydration' },
    { value: 'Food', label: 'Food' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Education', label: 'Education' },
    { value: 'Relationship', label: 'Relationship' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Home', label: 'Home' },
    { value: 'Social', label: 'Social' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomInput(false);
        setCustomCategory('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCategorySelect = (value: string): void => {
    onSelectCategory(value);
    setIsOpen(false);
    setShowCustomInput(false);
    setCustomCategory('');
  };

  const handleCustomInputSubmit = (): void => {
    if (customCategory.trim()) {
      onSelectCategory(customCategory.trim());
      setIsOpen(false);
      setShowCustomInput(false);
      setCustomCategory('');
    }
  };

  const handleCustomInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleCustomInputSubmit();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomCategory('');
    }
  };

  const displayText = selectedCategory || 'Category (optional)';
  const isPredefined = predefinedCategories.some(cat => cat.value === selectedCategory);

  return (
    <div className="category-picker-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="category-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="category-icon">🏷️</span>
        <span className="category-display-text">{displayText}</span>
        <span className="category-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="category-dropdown">
          {!showCustomInput ? (
            <>
              <div className="category-list">
                {predefinedCategories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    className={`category-option ${selectedCategory === category.value ? 'selected' : ''}`}
                    onClick={() => handleCategorySelect(category.value)}
                  >
                    <span className="category-check">
                      {selectedCategory === category.value ? '✓' : ''}
                    </span>
                    <span className="category-label">{category.label}</span>
                  </button>
                ))}
              </div>
              <div className="category-divider"></div>
              <button
                type="button"
                className="category-custom-btn"
                onClick={() => setShowCustomInput(true)}
              >
                <span className="category-plus">+</span>
                <span>Custom Category</span>
              </button>
            </>
          ) : (
            <div className="category-custom-input-wrapper">
              <input
                type="text"
                className="category-custom-input"
                placeholder="Enter custom category..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={handleCustomInputKeyPress}
                autoFocus
              />
              <div className="category-custom-actions">
                <button
                  type="button"
                  className="category-custom-save"
                  onClick={handleCustomInputSubmit}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="category-custom-cancel"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomCategory('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryPicker;
