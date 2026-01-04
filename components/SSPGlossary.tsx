'use client';

import { useState } from 'react';

export function SSPGlossary() {
  const [isOpen, setIsOpen] = useState(false);

  const terms = [
    {
      term: 'SSP (Shared Socioeconomic Pathway)',
      definition: 'Scenarios describing alternative futures of socioeconomic development. Five SSPs (SSP1-SSP5) represent different combinations of challenges for mitigation and adaptation to climate change.',
      whyImportant: 'SSPs provide consistent frameworks for exploring future socioeconomic developments and their interactions with climate change. They help researchers and policymakers understand different possible futures.'
    },
    {
      term: 'RCP (Representative Concentration Pathway)',
      definition: 'Scenarios representing different greenhouse gas concentration trajectories. RCP2.6 (low emissions), RCP4.5 (moderate emissions), RCP6.0 (high emissions), and RCP8.5 (very high emissions) describe different climate futures.',
      whyImportant: 'RCPs provide standardized climate scenarios for impact assessments. When combined with SSPs, they allow exploration of interactions between socioeconomic and climate futures.'
    },
    {
      term: 'SSP1 (Sustainability)',
      definition: 'A scenario characterized by rapid development, low inequality, high environmental awareness, and strong commitment to achieving development goals while respecting environmental boundaries.',
      whyImportant: 'SSP1 represents an optimistic but challenging future requiring global cooperation and technological innovation. It provides a benchmark for "best case" scenarios in climate assessments.'
    },
    {
      term: 'SSP2 (Middle of the Road)',
      definition: 'A scenario representing moderate development trajectories with moderate inequality and partial progress toward development goals. Often used as a "business as usual" reference scenario.',
      whyImportant: 'SSP2 serves as a reference scenario for moderate future developments. It helps assess outcomes if current trends continue without major policy changes.'
    },
    {
      term: 'SSP3 (Regional Rivalry)',
      definition: 'A scenario characterized by slow development, high inequality, regional conflicts, and limited international cooperation. Challenges for both mitigation and adaptation.',
      whyImportant: 'SSP3 represents a pessimistic future with high vulnerability and low adaptive capacity. It helps identify worst-case scenarios and necessary adaptation measures.'
    },
    {
      term: 'SSP4 (Inequality)',
      definition: 'A scenario with slow development globally, high inequality within and between countries, and increasing divergence between rich and poor regions.',
      whyImportant: 'SSP4 highlights the importance of addressing inequality in climate policy. It shows how uneven development affects vulnerability and adaptive capacity.'
    },
    {
      term: 'SSP5 (Fossil-Fueled Development)',
      definition: 'A scenario with rapid development, low inequality, but high reliance on fossil fuels and high greenhouse gas emissions. Challenges for mitigation but good for adaptation.',
      whyImportant: 'SSP5 represents a future with strong economic growth but high climate risks. It demonstrates the tension between development and climate mitigation.'
    },
    {
      term: 'CCIAV (Climate Change Impact, Adaptation, and Vulnerability)',
      definition: 'A framework for assessing how climate change affects systems, how adaptation can reduce impacts, and how vulnerable systems are to climate risks.',
      whyImportant: 'CCIAV assessments are essential for understanding climate risks and designing effective adaptation strategies. SSPs provide socioeconomic contexts for these assessments.'
    },
    {
      term: 'Top-Down Approach',
      definition: 'A methodological approach that starts with global scenarios and scales them down to local or regional levels. Global narratives and data are adapted for sub-global contexts.',
      whyImportant: 'Top-down approaches ensure consistency with global scenarios and help integrate local assessments into global frameworks. They work well when global data is available.'
    },
    {
      term: 'Bottom-Up Approach',
      definition: 'A methodological approach that builds scenarios from local contexts, knowledge, and data upward. Local stakeholders and experts develop scenarios based on local conditions.',
      whyImportant: 'Bottom-up approaches ensure local relevance and stakeholder engagement. They capture local knowledge and context that might be missed in top-down approaches.'
    },
    {
      term: 'Stakeholder Involvement',
      definition: 'Direct engagement of local stakeholders (communities, policymakers, experts) in developing or validating SSP extensions. Can include workshops, surveys, interviews, or participatory scenario development.',
      whyImportant: 'Stakeholder involvement ensures scenarios are relevant, credible, and useful for local decision-making. It improves the quality and acceptance of scenario-based assessments.'
    },
    {
      term: 'Sub-Global SSP Extensions',
      definition: 'Adaptations of global SSP narratives for local, regional, or national scales. These extensions maintain consistency with global SSPs while incorporating local context, data, and stakeholder perspectives.',
      whyImportant: 'Sub-global extensions bridge the gap between global scenarios and local decision-making. They make SSPs more relevant and useful for regional climate impact assessments and adaptation planning.'
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

