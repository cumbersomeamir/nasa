import * as XLSX from 'xlsx';
import fs from 'fs';

export interface CropData {
  harvestYear?: number;
  year?: number;
  country?: string;
  admin1?: string;
  admin2?: string;
  crop?: string;
  hectares?: number;
  production?: number;
  yield?: number;
  notes?: string;
  [key: string]: any;
}

export function readCropData(filePath: string): CropData[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets['CropStats'];
    
    if (!worksheet) {
      console.warn('CropStats sheet not found');
      return [];
    }
    
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    const result: CropData[] = [];
    
    data.forEach((row: any) => {
      const year = parseInt(String(row['year'] || row['Harvest_year'] || '0'));
      const country = row['admin0'] || row['admin0'] || '';
      const crop = row['crop'] || '';
      
      if (isNaN(year) || !country || !crop) return;
      
      const processed: CropData = {
        harvestYear: parseInt(String(row['Harvest_year'] || row['year'] || year)) || year,
        year: year,
        country: country,
        admin1: row['admin1'] || '',
        admin2: row['admin2'] || '',
        crop: crop,
        hectares: parseFloat(String(row['hectares (ha)'] || row['hectares'] || '0')) || 0,
        production: parseFloat(String(row['production (tonnes)'] || row['production'] || '0')) || 0,
        yield: parseFloat(String(row['yield(tonnes/ha)'] || row['yield'] || '0')) || 0,
        notes: row['notes'] || '',
        ...row, // Include all other fields
      };
      
      result.push(processed);
    });
    
    return result;
  } catch (error) {
    console.error(`Error reading crop data:`, error);
    return [];
  }
}

