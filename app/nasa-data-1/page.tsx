import { readExcelFile, processPopulationData, PopulationData } from '@/lib/excelReader';
import { Dashboard } from '@/components/Dashboard';
import { Glossary } from '@/components/Glossary';
import Link from 'next/link';
import path from 'path';
import fs from 'fs';

async function getData() {
  const basePath = process.cwd();
  const dataPath = path.join(basePath, 'nasa-data-1', 'lecz-delta-urban-rural-population-land-area-estimates-v1-data-xlsx.xlsx');
  const summaryPath = path.join(basePath, 'nasa-data-1', 'lecz-delta-urban-rural-population-land-area-estimates-v1-summary-tables-xlsx.xlsx');
  
  let data: PopulationData[] = [];
  let summaryData: any[] = [];
  
  console.log(`Base path: ${basePath}`);
  console.log(`Data path: ${dataPath}`);
  console.log(`Data file exists: ${fs.existsSync(dataPath)}`);
  console.log(`Summary file exists: ${fs.existsSync(summaryPath)}`);
  
  try {
    if (fs.existsSync(dataPath)) {
      try {
        const rawData = readExcelFile(dataPath, 'data');
        data = processPopulationData(rawData);
        console.log(`Loaded ${data.length} records from data file`);
      } catch (fileError: any) {
        console.error(`Error reading Excel file ${dataPath}:`, fileError);
      }
    } else {
      console.warn(`Data file not found at: ${dataPath}`);
    }
    
    if (fs.existsSync(summaryPath)) {
      try {
        summaryData = readExcelFile(summaryPath);
        console.log(`Loaded ${summaryData.length} records from summary file`);
      } catch (fileError: any) {
        console.error(`Error reading Excel file ${summaryPath}:`, fileError);
      }
    } else {
      console.warn(`Summary file not found at: ${summaryPath}`);
    }
  } catch (error) {
    console.error('Error reading data:', error);
  }
  
  // Serialize data to ensure only plain objects are passed to client components
  const serializedSummaryData = summaryData.map(item => {
    const plain: any = {};
    Object.keys(item).forEach(key => {
      const value = item[key];
      if (value !== null && value !== undefined && typeof value !== 'function') {
        plain[key] = value;
      }
    });
    return plain;
  });
  
  return { data, summaryData: serializedSummaryData };
}

export default async function NasaData1Page() {
  const { data, summaryData } = await getData();

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
            LECZ Delta Urban-Rural Population and Land Area Estimates
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Country-level estimates of populations and land areas in river delta- and non-delta contexts 
            for 246 statistical areas (1990, 2000, 2014, 2015)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Records</div>
              <div className="text-2xl font-bold text-blue-700">{data.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Countries</div>
              <div className="text-2xl font-bold text-green-700">
                {new Set(data.map(d => d.country)).size}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Years</div>
              <div className="text-2xl font-bold text-purple-700">
                {new Set(data.map(d => d.year)).size}
              </div>
            </div>
          </div>
        </div>

        <Glossary />

        <Dashboard data={data} summaryData={summaryData} />
      </div>
    </div>
  );
}

