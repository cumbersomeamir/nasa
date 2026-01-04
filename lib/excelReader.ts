import * as XLSX from 'xlsx';
import fs from 'fs';

export interface PopulationData {
  country: string;
  year: number;
  totalPopulation?: number;
  urbanPopulation?: number;
  ruralPopulation?: number;
  quasiUrbanPopulation?: number;
  totalLandArea?: number;
  builtUpArea?: number;
  lecz05?: boolean;
  lecz10?: boolean;
  delta?: boolean;
  [key: string]: any;
}

export function readExcelFile(filePath: string, sheetName?: string, headerRow?: number): any[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  
  try {
    // Read file as buffer first, then parse with xlsx
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    // If specific sheet requested, use it; otherwise try 'data' sheet, then first sheet
    let targetSheet = sheetName;
    if (!targetSheet) {
      if (workbook.SheetNames.includes('data')) {
        targetSheet = 'data';
      } else {
        targetSheet = workbook.SheetNames[0];
      }
    }
    
    if (!workbook.SheetNames.includes(targetSheet)) {
      console.warn(`Sheet "${targetSheet}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
      return [];
    }
    
    const worksheet = workbook.Sheets[targetSheet];
    
    // For the data sheet, use row 5 (0-indexed) as header, which is row 6 in Excel
    // This skips the title rows and uses the actual column names
    if (headerRow !== undefined) {
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { 
        defval: null, 
        range: headerRow 
      });
      return sheetData;
    } else if (targetSheet === 'data') {
      // For data sheet, skip first 5 rows and use row 5 (0-indexed) as header
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { 
        defval: null, 
        range: 5 
      });
      return sheetData;
    } else {
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
      return sheetData;
    }
  } catch (error) {
    console.error(`Error reading Excel file ${filePath}:`, error);
    return [];
  }
}

export function processPopulationData(data: any[]): PopulationData[] {
  if (!data || data.length === 0) {
    return [];
  }
  
  // Helper function to safely parse numbers
  const parseNum = (val: any): number => {
    if (val === null || val === undefined || val === '') return 0;
    const num = parseFloat(String(val));
    return isNaN(num) ? 0 : num;
  };
  
  const result: PopulationData[] = [];
  
  // Column naming: {lecz}_{type}_{zone}_{source}_{year}
  // e.g., 5_U_I_GP_90 = 5m LECZ, Urban, Inside delta, GP, 1990
  //      10_R_O_GP_00 = 10m LECZ, Rural, Outside delta, GP, 2000
  
  data.forEach((row: any) => {
    const country = (row.CountryName || row['CountryName'] || '').trim();
    
    if (!country || country === 'CountryName' || country === '') {
      return; // Skip header rows and invalid entries
    }
    
    // Process each year
    const years = [1990, 2000, 2015];
    const yearSuffixes = ['90', '00', '15'];
    
    years.forEach((year, idx) => {
      const suffix = yearSuffixes[idx];
      
      // Total population (not zone-specific)
      const totalPopKey = ` gpw_unpop${year} `;
      const totalPop = parseNum(row[totalPopKey]);
      
      // Process different LECZ zones (5m and 10m)
      ['5', '10'].forEach((lecz) => {
        const lecz05 = lecz === '5';
        const lecz10 = lecz === '10';
        
        // Process Urban, Rural, and Quasi-Urban
        ['U', 'R', 'Q'].forEach((popType) => {
          // Process Inside delta and Outside delta
          ['I', 'O'].forEach((zone) => {
            const delta = zone === 'I';
            const colKey = `${lecz}_${popType}_${zone}_GP_${suffix}`;
            const value = parseNum(row[colKey]);
            
            if (value > 0) {
              const entry: PopulationData = {
                country,
                year,
                lecz05,
                lecz10,
                delta,
                ...row, // Include all original fields
              };
              
              // Set population type
              if (popType === 'U') {
                entry.urbanPopulation = value;
              } else if (popType === 'R') {
                entry.ruralPopulation = value;
              } else if (popType === 'Q') {
                entry.quasiUrbanPopulation = value;
              }
              
              // Calculate total for this entry
              entry.totalPopulation = (entry.urbanPopulation || 0) + 
                                    (entry.ruralPopulation || 0) + 
                                    (entry.quasiUrbanPopulation || 0);
              
              result.push(entry);
            }
          });
        });
      });
      
      // Also add total population entry (aggregate)
      if (totalPop > 0) {
        result.push({
          country,
          year,
          totalPopulation: totalPop,
          ...row,
        });
      }
    });
  });
  
  return result.filter(d => d.country && d.year > 0);
}

