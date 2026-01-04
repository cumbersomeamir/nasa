import { readSSPData, SSPData } from '@/lib/sspDataReader';
import { SSPDashboard } from '@/components/SSPDashboard';
import { SSPGlossary } from '@/components/SSPGlossary';
import Link from 'next/link';
import path from 'path';
import fs from 'fs';

async function getData() {
  const basePath = process.cwd();
  const filePath = path.join(basePath, 'ssp-sub-global-scenarios-xlsx', 'ssp-sub-global-scenarios-extend-ssp-narratives-literature-db-v1-xlsx.xlsx');
  
  let data: SSPData[] = [];
  
  console.log(`Data file path: ${filePath}`);
  console.log(`File exists: ${fs.existsSync(filePath)}`);
  
  try {
    if (fs.existsSync(filePath)) {
      data = readSSPData(filePath);
      console.log(`Loaded ${data.length} SSP records`);
    } else {
      console.warn(`Data file not found at: ${filePath}`);
    }
  } catch (error) {
    console.error('Error reading data:', error);
  }
  
  return { data };
}

export default async function SSPPage() {
  const { data } = await getData();

  const uniqueThemes = new Set(data.filter(d => d.theme).map(d => String(d.theme).split(/[;,\/]+/).map(t => t.trim())).flat()).size;
  const uniqueCountries = new Set(data.filter(d => d.caseStudyCountries).map(d => String(d.caseStudyCountries).split(/[;,\/]+/).map(c => c.trim())).flat()).size;
  const yearRange = data.length > 0 ? {
    min: Math.min(...data.map(d => d.publicationYear || 0).filter(y => y > 0)),
    max: Math.max(...data.map(d => d.publicationYear || 0).filter(y => y > 0)),
  } : { min: 0, max: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sub-Global Scenarios Extending Global SSP Narratives: Literature Database (2014-2021)
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            A comprehensive literature database tracking 155 papers published from 2014 to 2021 that extended 
            the narratives of global Shared Socioeconomic Pathways (SSPs) to sub-global scales. This database 
            includes bibliographic data, methodological insights, and analytical information for climate change 
            impact, adaptation, and vulnerability (CCIAV) assessments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Papers</div>
              <div className="text-2xl font-bold text-blue-700">
                {data.length}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Unique Themes</div>
              <div className="text-2xl font-bold text-green-700">
                {uniqueThemes}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Countries Studied</div>
              <div className="text-2xl font-bold text-purple-700">
                {uniqueCountries}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Year Range</div>
              <div className="text-2xl font-bold text-orange-700">
                {yearRange.min}-{yearRange.max}
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <h3 className="font-semibold text-gray-900 mb-2">About This Dataset</h3>
            <p className="text-sm text-gray-700">
              This database tracks research on extending global <strong>Shared Socioeconomic Pathways (SSPs)</strong> 
              to sub-global scales for climate impact, adaptation, and vulnerability assessments. SSPs describe 
              alternative futures of socioeconomic development, while <strong>Representative Concentration Pathways (RCPs)</strong> 
              describe different climate futures. Together, SSPs and RCPs enable exploration of how different 
              socioeconomic and climate futures interact. The database includes information on methodologies, 
              case study areas, themes, stakeholder involvement, and model types used in these studies.
            </p>
          </div>
        </div>

        <SSPGlossary />

        <SSPDashboard data={data} />
      </div>
    </div>
  );
}

