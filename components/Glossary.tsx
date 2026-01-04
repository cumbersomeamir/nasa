'use client';

import { useState } from 'react';

export function Glossary() {
  const [isOpen, setIsOpen] = useState(false);

  const terms = [
    {
      term: 'LECZ (Low Elevation Coastal Zone)',
      definition: 'Areas of land that are contiguous to the coast and located at low elevations. This dataset focuses on two zones: LECZ05 (areas at or below 5 meters above sea level) and LECZ10 (areas between 5-10 meters above sea level). These zones are particularly vulnerable to sea-level rise and coastal flooding.',
      whyImportant: 'Understanding LECZ helps identify populations at risk from climate change impacts like sea-level rise, storm surges, and flooding.'
    },
    {
      term: 'Delta Zones',
      definition: 'River delta regions where rivers deposit sediment, creating fertile low-lying areas. Major deltas include the Ganges-Brahmaputra (Bangladesh/India), Nile (Egypt), and Mississippi (USA).',
      whyImportant: 'Delta regions are often densely populated, agriculturally productive, and highly vulnerable to both sea-level rise and land subsidence.'
    },
    {
      term: 'Urban Population',
      definition: 'People living in urban centers - cities and towns with high population density and infrastructure. Urban areas typically have populations of 5,000 or more with specific administrative boundaries.',
      whyImportant: 'Urbanization trends show how populations are concentrating in cities, which affects resource consumption, infrastructure needs, and vulnerability patterns.'
    },
    {
      term: 'Rural Population',
      definition: 'People living in rural areas - smaller settlements, villages, and countryside regions with lower population density and less developed infrastructure than urban areas.',
      whyImportant: 'Rural populations often depend on agriculture and natural resources, and may have different vulnerability patterns and adaptation needs.'
    },
    {
      term: 'Quasi-Urban Population',
      definition: 'Populations in transitional areas between urban and rural - these are settlements that don\'t meet strict urban criteria but are more developed than typical rural areas. Think of large towns or peri-urban zones.',
      whyImportant: 'This category captures the growing phenomenon of urban sprawl and suburban development, which is significant in many regions.'
    },
    {
      term: 'Built-up Area',
      definition: 'Land covered by buildings, roads, and other human-made structures. This includes residential, commercial, industrial, and infrastructure development.',
      whyImportant: 'Built-up area growth indicates urbanization intensity and helps assess infrastructure density and impervious surface coverage (which affects flooding risk).'
    },
    {
      term: 'Land Area',
      definition: 'Total land surface area in square kilometers, excluding water bodies. This provides context for population density and land use patterns.',
      whyImportant: 'Understanding land area helps calculate population density, assess resource availability, and understand spatial distribution patterns.'
    },
    {
      term: 'Urbanization Rate',
      definition: 'The percentage of a country\'s population living in urban areas. Calculated as (Urban Population / Total Population) × 100.',
      whyImportant: 'Higher urbanization rates indicate faster migration to cities, which affects infrastructure needs, resource consumption, and climate vulnerability patterns.'
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

