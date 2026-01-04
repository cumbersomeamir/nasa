'use client';

import { useState } from 'react';

export function NRPIGlossary() {
  const [isOpen, setIsOpen] = useState(false);

  const terms = [
    {
      term: 'NRPI (Natural Resource Protection Index)',
      definition: 'A composite index that measures how well countries protect their natural resources including forests, water, biodiversity, and ecosystems. Scores range from 0-100, with higher scores indicating better resource protection.',
      whyImportant: 'NRPI helps assess environmental stewardship and sustainability. Countries with high NRPI scores demonstrate strong commitment to preserving natural resources for future generations.'
    },
    {
      term: 'CHI (Child Health Index)',
      definition: 'A composite measure combining child mortality rates, water access, and sanitation access. Higher scores (0-100) indicate better child health outcomes. The index provides a comprehensive view of child health beyond just mortality rates.',
      whyImportant: 'CHI gives a holistic picture of child health by combining multiple indicators. It helps identify countries making progress in child health and highlights the importance of infrastructure (water and sanitation) for health outcomes.'
    },
    {
      term: 'Child Mortality Rate (CMR)',
      definition: 'The number of deaths of children under 5 years old per 1,000 live births. Lower rates indicate better child health. This is one of the most important indicators of child health and overall development.',
      whyImportant: 'Child mortality rates reflect the effectiveness of healthcare systems, nutrition programs, and infrastructure. Significant reductions in CMR indicate progress in child health and development.'
    },
    {
      term: 'Water Access (WAT)',
      definition: 'The percentage of a country\'s population with access to improved water sources (piped water, protected wells, etc.). Access to clean water is fundamental for child health and preventing waterborne diseases.',
      whyImportant: 'Lack of clean water access is a major cause of child illness and death. Countries with high water access rates typically have lower child mortality rates, especially from diarrheal diseases.'
    },
    {
      term: 'Sanitation Access (SAN)',
      definition: 'The percentage of a country\'s population with access to improved sanitation facilities (flush toilets, septic tanks, etc.). Proper sanitation prevents the spread of diseases.',
      whyImportant: 'Poor sanitation leads to contamination of water sources and spread of diseases. Access to sanitation facilities is crucial for reducing child mortality, particularly from diarrheal diseases and other infections.'
    },
    {
      term: 'Child Mortality Protection (CHMORT_PT)',
      definition: 'A percentage score indicating how well a country protects children from mortality, derived from the child mortality rate. Higher percentages indicate better protection (lower mortality rates).',
      whyImportant: 'This metric provides an inverse measure of child mortality, making it easier to compare with other percentage-based indicators. It helps visualize progress in reducing child deaths.'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Understanding the Data: Key Terms Explained</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
        >
          {isOpen ? 'Hide' : 'Show'} Definitions
          <svg
            className={`w-5 h-5 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div className="space-y-4 mt-4">
          {terms.map((item, index) => (
            <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
              <h3 className="font-semibold text-gray-900 mb-1">{item.term}</h3>
              <p className="text-gray-700 mb-2">{item.definition}</p>
              <p className="text-sm text-gray-600 italic">
                <span className="font-medium">Why this matters:</span> {item.whyImportant}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

