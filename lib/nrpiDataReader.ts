import * as XLSX from 'xlsx';
import fs from 'fs';

export interface NRPIData {
  country: string;
  year: number;
  nrpi?: number;
  [key: string]: any;
}

export interface CHIData {
  country: string;
  iso3?: string;
  year: number;
  childMortalityRate?: number;
  childMortalityProtection?: number;
  waterAccess?: number;
  sanitationAccess?: number;
  childHealthIndex?: number;
  [key: string]: any;
}

export function readNRPIData(filePath: string): NRPIData[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets['NRPI_v2023'];
    
    if (!worksheet) {
      console.warn('NRPI_v2023 sheet not found');
      return [];
    }
    
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    const result: NRPIData[] = [];
    
    data.forEach((row: any) => {
      const country = row.Country_Territory_Island || row['Country_Territory_Island'] || '';
      if (!country) return;
      
      // Process years 2019-2022
      const years = [
        { year: 2019, key: 'NRPI_v2023_19' },
        { year: 2020, key: 'NRPI_v2023_20' },
        { year: 2021, key: 'NRPI_v2023_21' },
        { year: 2022, key: 'NRPI_v2023_22' },
      ];
      
      years.forEach(({ year, key }) => {
        const value = parseFloat(String(row[key] || ''));
        if (!isNaN(value)) {
          result.push({
            country,
            year,
            nrpi: value,
            ...row,
          });
        }
      });
    });
    
    return result;
  } catch (error) {
    console.error(`Error reading NRPI data:`, error);
    return [];
  }
}

export function readCHIData(filePath: string): CHIData[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets['CHI_v2023'];
    
    if (!worksheet) {
      console.warn('CHI_v2023 sheet not found');
      return [];
    }
    
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    const result: CHIData[] = [];
    
    data.forEach((row: any) => {
      const country = row.Country_Territory_Island || row['Country_Territory_Island'] || '';
      const iso3 = row.ISO3V10 || row['ISO3V10'] || '';
      if (!country) return;
      
      // Process years 2010-2022
      for (let year = 2010; year <= 2022; year++) {
        const suffix = String(year).slice(-2);
        const cmrKey = `CMR_${suffix}`;
        const chmortKey = `CHMORT_PT_${suffix}`;
        const watKey = `WAT_${suffix}`;
        const sanKey = `SAN_${suffix}`;
        const chiKey = `CHI_v2023_${suffix}`;
        
        const childMortalityRate = parseFloat(String(row[cmrKey] || ''));
        const childMortalityProtection = parseFloat(String(row[chmortKey] || ''));
        const waterAccess = parseFloat(String(row[watKey] || ''));
        const sanitationAccess = parseFloat(String(row[sanKey] || ''));
        const childHealthIndex = parseFloat(String(row[chiKey] || ''));
        
        // Create entry if at least one value exists
        if (!isNaN(childMortalityRate) || !isNaN(childHealthIndex)) {
          result.push({
            country,
            iso3,
            year,
            childMortalityRate: !isNaN(childMortalityRate) ? childMortalityRate : undefined,
            childMortalityProtection: !isNaN(childMortalityProtection) ? childMortalityProtection : undefined,
            waterAccess: !isNaN(waterAccess) ? waterAccess : undefined,
            sanitationAccess: !isNaN(sanitationAccess) ? sanitationAccess : undefined,
            childHealthIndex: !isNaN(childHealthIndex) ? childHealthIndex : undefined,
            ...row,
          });
        }
      }
    });
    
    return result;
  } catch (error) {
    console.error(`Error reading CHI data:`, error);
    return [];
  }
}

