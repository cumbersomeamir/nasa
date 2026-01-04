import * as XLSX from 'xlsx';
import fs from 'fs';

export interface SSPData {
  publicationYear?: number;
  authors?: string;
  title?: string;
  journal?: string;
  abstract?: string;
  url?: string;
  affiliationCountry?: string;
  caseStudyArea?: string;
  caseStudyCountries?: string;
  theme?: string;
  mainObjective?: string;
  iavFocus?: string;
  ssps?: number;
  ssp1?: boolean;
  ssp2?: boolean;
  ssp3?: boolean;
  ssp4?: boolean;
  ssp5?: boolean;
  rcps?: string;
  climateScenarios?: string;
  mainMethod?: string;
  methodForSSPs?: string;
  derivedFromSSPs?: string;
  topDownBottomUp?: string;
  iiasaVariablesUsed?: string;
  stakeholderInvolvement?: string;
  stakeholderMethod?: string;
  mainModelType?: string;
  mainModelName?: string;
  climateModel?: string;
  sourceOfClimateData?: string;
  qualitative?: string;
  temporalExtent?: string;
  [key: string]: any;
}

export function readSSPData(filePath: string): SSPData[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets['Citations'];
    
    if (!worksheet) {
      console.warn('Citations sheet not found');
      return [];
    }
    
    // Use row 3 (0-indexed) as header row
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null, range: 3 });
    const result: SSPData[] = [];
    
    data.forEach((row: any) => {
      const year = parseInt(String(row['Publication Year'] || ''));
      if (isNaN(year)) return; // Skip rows without valid year
      
      const processed: SSPData = {
        publicationYear: year,
        authors: row['Authors'] || row['Authors'] || '',
        title: row['Title'] || '',
        journal: row['Journal'] || '',
        abstract: row['Abstract'] || '',
        url: row['URL'] || '',
        affiliationCountry: row['Affiliation first author (country)'] || '',
        caseStudyArea: row['Case study area'] || '',
        caseStudyCountries: row['Case study countries'] || '',
        theme: row['Theme'] || '',
        mainObjective: row['Main objective of the study'] || '',
        iavFocus: row['IAV/other focus'] || '',
        ssps: parseInt(String(row['SSPs'] || '0')) || 0,
        ssp1: row['SSP1'] === 'x' || row['SSP1'] === 'X' || row['SSP1'] === true,
        ssp2: row['SSP2'] === 'x' || row['SSP2'] === 'X' || row['SSP2'] === true,
        ssp3: row['SSP3'] === 'x' || row['SSP3'] === 'X' || row['SSP3'] === true,
        ssp4: row['SSP4'] === 'x' || row['SSP4'] === 'X' || row['SSP4'] === true,
        ssp5: row['SSP5'] === 'x' || row['SSP5'] === 'X' || row['SSP5'] === true,
        rcps: row['RCPs'] || '',
        climateScenarios: row['Climate scenarios'] || '',
        mainMethod: row['Main method of the study'] || '',
        methodForSSPs: row['Main method for developing extended SSPs'] || '',
        derivedFromSSPs: row['Derived from extended SSPs [Y - which one / N]'] || '',
        topDownBottomUp: row['Top-down, bottom-up, combined'] || '',
        iiasaVariablesUsed: row['Were variables from IIASA SSP used? [YES]; If so, what variables of the IIASA SSP database where used?'] || '',
        stakeholderInvolvement: row['Direct stakeholder involvement for the study [Y/N]'] || '',
        stakeholderMethod: row['Stakeholder involvement method in the study [Which one /N]'] || '',
        mainModelType: row['Main model type [Which type / None]'] || '',
        mainModelName: row['Main model name [Which model or "No name" / NA]'] || '',
        climateModel: row['Climate model'] || '',
        sourceOfClimateData: row['Source of climate data'] || '',
        qualitative: row['Qualitative [N = Narratives; E = Elements / None]'] || '',
        temporalExtent: row['Temporal extent'] || '',
        ...row, // Include all other fields
      };
      
      result.push(processed);
    });
    
    return result;
  } catch (error) {
    console.error(`Error reading SSP data:`, error);
    return [];
  }
}

