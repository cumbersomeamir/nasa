import { readNRPIData, readCHIData, NRPIData, CHIData } from '@/lib/nrpiDataReader';
import { NRPIDashboard } from '@/components/NRPIDashboard';
import { NRPIGlossary } from '@/components/NRPIGlossary';
import Link from 'next/link';
import path from 'path';
import fs from 'fs';

async function getData() {
  const basePath = process.cwd();
  const filePath = path.join(basePath, 'nrpi-chi-2023-xlsx', 'nrpi-chi-2023-xlsx.xlsx');
  
  let nrpiData: NRPIData[] = [];
  let chiData: CHIData[] = [];
  
  console.log(`Data file path: ${filePath}`);
  console.log(`File exists: ${fs.existsSync(filePath)}`);
  
  try {
    if (fs.existsSync(filePath)) {
      nrpiData = readNRPIData(filePath);
      chiData = readCHIData(filePath);
      console.log(`Loaded ${nrpiData.length} NRPI records`);
      console.log(`Loaded ${chiData.length} CHI records`);
    } else {
      console.warn(`Data file not found at: ${filePath}`);
    }
  } catch (error) {
    console.error('Error reading data:', error);
  }
  
  return { nrpiData, chiData };
}

export default async function NRPI2023Page() {
  const { nrpiData, chiData } = await getData();

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
            Natural Resource Protection and Child Health Indicators (2023)
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Comprehensive data on Natural Resource Protection Index (NRPI) and Child Health Indicators (CHI) 
            for countries worldwide. This dataset combines environmental protection metrics with child health outcomes, 
            including mortality rates and access to water and sanitation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Countries (NRPI)</div>
              <div className="text-2xl font-bold text-blue-700">
                {new Set(nrpiData.map(d => d.country)).size}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Countries (CHI)</div>
              <div className="text-2xl font-bold text-green-700">
                {new Set(chiData.map(d => d.country)).size}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">NRPI Records</div>
              <div className="text-2xl font-bold text-purple-700">{nrpiData.length}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">CHI Records</div>
              <div className="text-2xl font-bold text-orange-700">{chiData.length}</div>
            </div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <h3 className="font-semibold text-gray-900 mb-2">About This Dataset</h3>
            <p className="text-sm text-gray-700">
              The <strong>Natural Resource Protection Index (NRPI)</strong> measures how well countries protect their natural resources 
              (forests, water, biodiversity, etc.) from 2019-2022. The <strong>Child Health Index (CHI)</strong> is a composite measure 
              combining child mortality rates, water access, and sanitation access from 2010-2022. Together, these indicators help 
              understand the relationship between environmental protection and child health outcomes.
            </p>
          </div>
        </div>

        <NRPIGlossary />

        <NRPIDashboard nrpiData={nrpiData} chiData={chiData} />
      </div>
    </div>
  );
}

