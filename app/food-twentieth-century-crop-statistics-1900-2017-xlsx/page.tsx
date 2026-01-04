import { readCropData, CropData } from '@/lib/cropDataReader';
import { CropDashboard } from '@/components/CropDashboard';
import { CropGlossary } from '@/components/CropGlossary';
import Link from 'next/link';
import path from 'path';
import fs from 'fs';

async function getData() {
  const basePath = process.cwd();
  const filePath = path.join(basePath, 'food-twentieth-century-crop-statistics-1900-2017-xlsx', 'food-twentieth-century-crop-statistics-1900-2017-xlsx.xlsx');
  
  let data: CropData[] = [];
  
  console.log(`Data file path: ${filePath}`);
  console.log(`File exists: ${fs.existsSync(filePath)}`);
  
  try {
    if (fs.existsSync(filePath)) {
      data = readCropData(filePath);
      console.log(`Loaded ${data.length} crop records`);
    } else {
      console.warn(`Data file not found at: ${filePath}`);
    }
  } catch (error) {
    console.error('Error reading data:', error);
  }
  
  return { data };
}

export default async function CropStatisticsPage() {
  const { data } = await getData();

  const uniqueCrops = new Set(data.map(d => d.crop).filter(c => c)).size;
  const uniqueCountries = new Set(data.map(d => d.country).filter(c => c)).size;
  const years = Array.from(new Set(data.map(d => d.year).filter(y => y && y > 0))).sort();
  const yearRange = years.length > 0 ? {
    min: Math.min(...years),
    max: Math.max(...years),
  } : { min: 0, max: 0 };

  const totalProduction = data.reduce((sum, d) => sum + (d.production || 0), 0);
  const avgYield = data.filter(d => d.yield && d.yield > 0).reduce((sum, d) => sum + (d.yield || 0), 0) / 
                   data.filter(d => d.yield && d.yield > 0).length;
  const totalHectares = data.reduce((sum, d) => sum + (d.hectares || 0), 0);

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
            Twentieth Century Crop Statistics (1900-2017)
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Historical crop statistics covering wheat, maize, spring wheat, winter wheat, and cereals 
            from {yearRange.min} to {yearRange.max}. This dataset provides comprehensive information on 
            crop production (tonnes), yield (tonnes per hectare), and harvested area (hectares) across 
            multiple countries, offering insights into agricultural trends over more than a century.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Records</div>
              <div className="text-2xl font-bold text-blue-700">
                {data.length.toLocaleString()}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Production</div>
              <div className="text-2xl font-bold text-green-700">
                {(totalProduction / 1000000).toFixed(0)}M
              </div>
              <div className="text-xs text-gray-500">Million tonnes</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Avg. Yield</div>
              <div className="text-2xl font-bold text-purple-700">
                {avgYield.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Tonnes/ha</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Year Range</div>
              <div className="text-2xl font-bold text-orange-700">
                {yearRange.min}-{yearRange.max}
              </div>
              <div className="text-xs text-gray-500">{yearRange.max - yearRange.min} years</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Unique Crops</div>
              <div className="text-2xl font-bold text-indigo-700">{uniqueCrops}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Countries</div>
              <div className="text-2xl font-bold text-red-700">{uniqueCountries}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Area</div>
              <div className="text-2xl font-bold text-yellow-700">
                {(totalHectares / 1000000).toFixed(0)}M
              </div>
              <div className="text-xs text-gray-500">Million hectares</div>
            </div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <h3 className="font-semibold text-gray-900 mb-2">About This Dataset</h3>
            <p className="text-sm text-gray-700">
              This dataset contains comprehensive historical crop statistics spanning over a century of agricultural 
              data. It includes information on <strong>production</strong> (total crop output in tonnes), 
              <strong> yield</strong> (productivity per hectare in tonnes/ha), and <strong>harvested area</strong> 
              (hectares) for major crops including wheat, maize, spring wheat, winter wheat, and cereals. 
              The data covers multiple countries and provides insights into agricultural trends, productivity changes, 
              and the impacts of technological advances such as the Green Revolution on global food production.
            </p>
          </div>
        </div>

        <CropGlossary />

        <CropDashboard data={data} />
      </div>
    </div>
  );
}

