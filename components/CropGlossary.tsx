'use client';

import { useState } from 'react';

export function CropGlossary() {
  const [isOpen, setIsOpen] = useState(false);

  const terms = [
    {
      term: 'Production (tonnes)',
      definition: 'The total amount of crop output in tonnes (metric tons). Production = Yield × Area. This measures the total quantity of crops harvested.',
      whyImportant: 'Production indicates the total food output, which is crucial for food security assessments. Higher production means more food available, though it must be considered alongside population needs.'
    },
    {
      term: 'Yield (tonnes/ha)',
      definition: 'Crop output per unit area, measured in tonnes per hectare. Yield = Production ÷ Area. This measures agricultural productivity and efficiency.',
      whyImportant: 'Yield is a key indicator of agricultural efficiency. Higher yields indicate better farming practices, improved crop varieties, better technology, and effective use of resources. Yield improvements are essential for feeding growing populations without expanding farmland.'
    },
    {
      term: 'Hectares (ha)',
      definition: 'A unit of area equal to 10,000 square meters (about 2.47 acres). In agriculture, hectares measure the area of land under crop cultivation.',
      whyImportant: 'Understanding hectares helps assess the extent of agricultural land use. Combined with production and yield, it provides a complete picture of agricultural activity and land use patterns.'
    },
    {
      term: 'Wheat',
      definition: 'A major cereal crop and staple food worldwide. Wheat is one of the most important crops globally, used primarily for human consumption (flour, bread, pasta).',
      whyImportant: 'Wheat is a critical staple crop feeding billions of people. Tracking wheat production, yield, and area helps understand global food security and agricultural trends.'
    },
    {
      term: 'Maize (Corn)',
      definition: 'A major cereal crop used for human consumption, animal feed, and industrial purposes. Maize is one of the most widely grown crops globally.',
      whyImportant: 'Maize is essential for food security, livestock feed, and biofuel production. Understanding maize trends helps assess global food and feed availability.'
    },
    {
      term: 'Spring Wheat',
      definition: 'Wheat varieties planted in spring and harvested in late summer or early fall. Spring wheat is common in regions with harsh winters where winter wheat cannot survive.',
      whyImportant: 'Spring wheat is important in northern climates. Tracking spring wheat separately from winter wheat provides detailed insights into regional agricultural patterns.'
    },
    {
      term: 'Winter Wheat',
      definition: 'Wheat varieties planted in fall, overwinter, and are harvested in early summer. Winter wheat typically has higher yields than spring wheat due to a longer growing season.',
      whyImportant: 'Winter wheat is more productive than spring wheat and is common in temperate climates. Understanding winter wheat trends helps assess agricultural productivity in specific regions.'
    },
    {
      term: 'Cereals',
      definition: 'A category of crops including wheat, maize, rice, barley, oats, and other grain crops. Cereals are staple foods providing carbohydrates and essential nutrients.',
      whyImportant: 'Cereals are fundamental to global food security. Understanding cereal production, yield, and area helps assess overall food availability and agricultural productivity.'
    },
    {
      term: 'Harvest Year',
      definition: 'The year in which crops are harvested. For most crops in the Northern Hemisphere, harvest occurs in the summer or fall of the same year they were planted.',
      whyImportant: 'Harvest year helps track agricultural production over time. Understanding harvest years helps identify seasonal patterns, climate impacts, and long-term trends.'
    },
    {
      term: 'Agricultural Productivity',
      definition: 'The efficiency of agricultural production, typically measured as output per unit of input (land, labor, or resources). Yield (tonnes/ha) is a key measure of land productivity.',
      whyImportant: 'Productivity improvements are essential for meeting growing food demand without expanding farmland. Higher productivity means more food from the same amount of land, reducing pressure on natural resources.'
    },
    {
      term: 'Green Revolution',
      definition: 'A period of agricultural transformation (1960s-1980s) characterized by the adoption of high-yielding crop varieties, increased use of fertilizers and irrigation, and improved farming techniques. This dramatically increased crop yields worldwide.',
      whyImportant: 'The Green Revolution significantly increased global food production and helped prevent famines. Understanding its impacts helps assess how agricultural technology can address future food security challenges.'
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

