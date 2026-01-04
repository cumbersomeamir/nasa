'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { NRPIData, CHIData } from '@/lib/nrpiDataReader';

interface NRPIDashboardProps {
  nrpiData: NRPIData[];
  chiData: CHIData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function NRPIDashboard({ nrpiData, chiData }: NRPIDashboardProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMetric, setSelectedMetric] = useState<'nrpi' | 'chi' | 'mortality' | 'infrastructure'>('chi');

  // Get available years from data
  const nrpiYears = useMemo(() => {
    return Array.from(new Set(nrpiData.map(d => d.year))).sort();
  }, [nrpiData]);

  const chiYears = useMemo(() => {
    return Array.from(new Set(chiData.map(d => d.year))).sort();
  }, [chiData]);

  const allYears = useMemo(() => {
    return Array.from(new Set([...nrpiYears, ...chiYears])).sort();
  }, [nrpiYears, chiYears]);

  // Filter data based on selected year
  const filteredNRPI = useMemo(() => {
    if (selectedYear === 'all') return nrpiData;
    return nrpiData.filter(d => d.year === selectedYear);
  }, [nrpiData, selectedYear]);

  const filteredCHI = useMemo(() => {
    if (selectedYear === 'all') return chiData;
    return chiData.filter(d => d.year === selectedYear);
  }, [chiData, selectedYear]);

  // Latest year data
  const latestYear = useMemo(() => {
    return Math.max(...allYears);
  }, [allYears]);

  const latestCHI = useMemo(() => {
    return chiData.filter(d => d.year === latestYear);
  }, [chiData, latestYear]);

  const latestNRPI = useMemo(() => {
    return nrpiData.filter(d => d.year === latestYear);
  }, [nrpiData, latestYear]);

  // Top countries by NRPI (latest year)
  const topNRPI = useMemo(() => {
    return latestNRPI
      .map(d => ({ country: d.country, nrpi: d.nrpi || 0 }))
      .sort((a, b) => b.nrpi - a.nrpi)
      .slice(0, 15);
  }, [latestNRPI]);

  // Top countries by CHI (latest year)
  const topCHI = useMemo(() => {
    return latestCHI
      .map(d => ({ country: d.country, chi: d.childHealthIndex || 0 }))
      .sort((a, b) => b.chi - a.chi)
      .slice(0, 15);
  }, [latestCHI]);

  // Worst child mortality rates (latest year)
  const worstMortality = useMemo(() => {
    return latestCHI
      .filter(d => d.childMortalityRate !== undefined)
      .map(d => ({ country: d.country, mortality: d.childMortalityRate || 0 }))
      .sort((a, b) => b.mortality - a.mortality)
      .slice(0, 15);
  }, [latestCHI]);

  // NRPI trends over time
  const nrpiTrends = useMemo(() => {
    const countryMap = new Map<string, any>();
    
    nrpiData.forEach(d => {
      if (!countryMap.has(d.country)) {
        countryMap.set(d.country, { country: d.country });
      }
      countryMap.get(d.country)[d.year] = d.nrpi;
    });
    
    return Array.from(countryMap.values()).slice(0, 10);
  }, [nrpiData]);

  // CHI trends over time (aggregated)
  const chiTrends = useMemo(() => {
    const trends: any[] = [];
    chiYears.forEach(year => {
      const yearData = chiData.filter(d => d.year === year);
      const avgCHI = yearData.reduce((sum, d) => sum + (d.childHealthIndex || 0), 0) / yearData.length;
      const avgMortality = yearData.reduce((sum, d) => sum + (d.childMortalityRate || 0), 0) / yearData.length;
      const avgWater = yearData.reduce((sum, d) => sum + (d.waterAccess || 0), 0) / yearData.length;
      const avgSanitation = yearData.reduce((sum, d) => sum + (d.sanitationAccess || 0), 0) / yearData.length;
      
      trends.push({
        year,
        avgCHI,
        avgMortality,
        avgWater,
        avgSanitation,
      });
    });
    return trends;
  }, [chiData, chiYears]);

  // Correlation: NRPI vs CHI (latest year)
  const correlationData = useMemo(() => {
    const latestNRPIMap = new Map(latestNRPI.map(d => [d.country, d.nrpi || 0]));
    return latestCHI
      .filter(d => d.childHealthIndex !== undefined && latestNRPIMap.has(d.country))
      .map(d => ({
        country: d.country,
        nrpi: latestNRPIMap.get(d.country) || 0,
        chi: d.childHealthIndex || 0,
        mortality: d.childMortalityRate || 0,
      }))
      .slice(0, 50);
  }, [latestCHI, latestNRPI]);

  // Average metrics (latest year)
  const avgMetrics = useMemo(() => {
    if (latestCHI.length === 0) return null;
    
    return {
      avgCHI: latestCHI.reduce((sum, d) => sum + (d.childHealthIndex || 0), 0) / latestCHI.length,
      avgMortality: latestCHI.reduce((sum, d) => sum + (d.childMortalityRate || 0), 0) / latestCHI.length,
      avgWater: latestCHI.reduce((sum, d) => sum + (d.waterAccess || 0), 0) / latestCHI.length,
      avgSanitation: latestCHI.reduce((sum, d) => sum + (d.sanitationAccess || 0), 0) / latestCHI.length,
      avgNRPI: latestNRPI.reduce((sum, d) => sum + (d.nrpi || 0), 0) / latestNRPI.length,
    };
  }, [latestCHI, latestNRPI]);

  // Countries with best improvement in CHI (2010-2022)
  const bestImprovers = useMemo(() => {
    const countryMap = new Map<string, { country: string; startCHI?: number; endCHI?: number }>();
    
    chiData.forEach(d => {
      if (!countryMap.has(d.country)) {
        countryMap.set(d.country, { country: d.country });
      }
      const entry = countryMap.get(d.country)!;
      if (d.year === 2010 && d.childHealthIndex !== undefined) {
        entry.startCHI = d.childHealthIndex;
      }
      if (d.year === latestYear && d.childHealthIndex !== undefined) {
        entry.endCHI = d.childHealthIndex;
      }
    });
    
    return Array.from(countryMap.values())
      .filter(d => d.startCHI !== undefined && d.endCHI !== undefined)
      .map(d => ({
        country: d.country,
        improvement: (d.endCHI || 0) - (d.startCHI || 0),
      }))
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 15);
  }, [chiData, latestYear]);

  // Infrastructure vs Mortality scatter
  const infrastructureMortality = useMemo(() => {
    return latestCHI
      .filter(d => d.waterAccess !== undefined && d.sanitationAccess !== undefined && d.childMortalityRate !== undefined)
      .map(d => ({
        country: d.country,
        infrastructure: ((d.waterAccess || 0) + (d.sanitationAccess || 0)) / 2,
        mortality: d.childMortalityRate || 0,
      }));
  }, [latestCHI]);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Filters & Controls</h2>
          <p className="text-gray-600 text-sm">
            Filter the data by year or focus on specific metrics. The Natural Resource Protection Index (NRPI) 
            measures how well countries protect their natural resources, while the Child Health Index (CHI) 
            measures child health outcomes including mortality rates and access to water and sanitation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Years</option>
              {allYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Metric Focus</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="chi">Child Health Index</option>
              <option value="nrpi">Natural Resource Protection</option>
              <option value="mortality">Child Mortality</option>
              <option value="infrastructure">Water & Sanitation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Insights ({latestYear})</h2>
        {avgMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-1">Avg. Child Health Index</div>
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {avgMetrics.avgCHI.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Out of 100</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <div className="text-sm text-gray-600 mb-1">Avg. Child Mortality</div>
              <div className="text-2xl font-bold text-red-700 mb-1">
                {avgMetrics.avgMortality.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Deaths per 1000 live births</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="text-sm text-gray-600 mb-1">Avg. Water Access</div>
              <div className="text-2xl font-bold text-green-700 mb-1">
                {avgMetrics.avgWater.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Population with access</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <div className="text-sm text-gray-600 mb-1">Avg. Sanitation Access</div>
              <div className="text-2xl font-bold text-purple-700 mb-1">
                {avgMetrics.avgSanitation.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Population with access</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <div className="text-sm text-gray-600 mb-1">Avg. NRPI Score</div>
              <div className="text-2xl font-bold text-orange-700 mb-1">
                {avgMetrics.avgNRPI.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Resource protection index</div>
            </div>
          </div>
        )}
      </div>

      {/* Child Health Index Trends */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Child Health Index Trends (2010-2022)</h2>
          <p className="text-gray-600 text-sm">
            The <strong>Child Health Index (CHI)</strong> is a composite measure that combines child mortality rates, 
            water access, and sanitation access. Higher scores indicate better child health outcomes. 
            This chart shows how average CHI scores have improved globally over time, demonstrating progress in child health.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chiTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="avgCHI" stroke="#3b82f6" fill="#3b82f6" name="Average CHI" />
            <Area type="monotone" dataKey="avgWater" stroke="#10b981" fill="#10b981" name="Water Access %" />
            <Area type="monotone" dataKey="avgSanitation" stroke="#8b5cf6" fill="#8b5cf6" name="Sanitation Access %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Child Mortality Trends */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Child Mortality Rate Trends</h2>
          <p className="text-gray-600 text-sm">
            <strong>Child Mortality Rate (CMR)</strong> measures deaths of children under 5 years old per 1,000 live births. 
            Lower rates indicate better child health outcomes. This chart shows the global average mortality rate decreasing over time, 
            indicating significant progress in reducing child deaths worldwide.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chiTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avgMortality" stroke="#ef4444" strokeWidth={2} name="Avg. Child Mortality Rate" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Countries by CHI */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 15 Countries by Child Health Index ({latestYear})</h2>
          <p className="text-gray-600 text-sm">
            Countries ranked by their Child Health Index scores. Higher scores indicate better child health outcomes, 
            including lower mortality rates and better access to clean water and sanitation facilities.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topCHI} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="country" type="category" width={150} />
            <Tooltip formatter={(value: number) => value.toFixed(1)} />
            <Bar dataKey="chi" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Worst Child Mortality */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Countries with Highest Child Mortality Rates ({latestYear})</h2>
          <p className="text-gray-600 text-sm">
            These countries face the greatest challenges in child health, with the highest mortality rates. 
            This highlights regions that need urgent attention and resources to improve child health outcomes.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={worstMortality} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="country" type="category" width={150} />
            <Tooltip formatter={(value: number) => `${value.toFixed(1)} per 1000`} />
            <Bar dataKey="mortality" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Countries by NRPI */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 15 Countries by Natural Resource Protection Index ({latestYear})</h2>
          <p className="text-gray-600 text-sm">
            The <strong>Natural Resource Protection Index (NRPI)</strong> measures how well countries protect their natural resources 
            (forests, water, biodiversity, etc.). Higher scores indicate better resource protection. 
            Countries with high NRPI scores demonstrate strong environmental stewardship.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topNRPI} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="country" type="category" width={150} />
            <Tooltip formatter={(value: number) => value.toFixed(1)} />
            <Bar dataKey="nrpi" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Correlation: NRPI vs CHI */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Natural Resource Protection vs Child Health Index</h2>
          <p className="text-gray-600 text-sm">
            This scatter plot explores the relationship between <strong>Natural Resource Protection (NRPI)</strong> and 
            <strong> Child Health Index (CHI)</strong>. Countries in the top-right corner have both strong resource protection 
            and good child health outcomes, suggesting a potential positive relationship between environmental protection and health.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={correlationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nrpi" name="NRPI" label={{ value: 'Natural Resource Protection Index', position: 'insideBottom', offset: -5 }} />
            <YAxis dataKey="chi" name="CHI" label={{ value: 'Child Health Index', angle: -90, position: 'insideLeft' }} />
            <ZAxis dataKey="mortality" range={[50, 400]} name="Mortality" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: any) => value.toFixed(1)} />
            <Legend />
            <Scatter name="Countries" dataKey="chi" fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Infrastructure vs Mortality */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Infrastructure Access vs Child Mortality ({latestYear})</h2>
          <p className="text-gray-600 text-sm">
            This scatter plot shows the relationship between average infrastructure access (water + sanitation) and child mortality rates. 
            Countries with better infrastructure access typically have lower child mortality rates, demonstrating the critical importance 
            of clean water and sanitation facilities for child health.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={infrastructureMortality}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="infrastructure" name="Infrastructure" label={{ value: 'Avg. Infrastructure Access (%)', position: 'insideBottom', offset: -5 }} />
            <YAxis dataKey="mortality" name="Mortality" label={{ value: 'Child Mortality Rate', angle: -90, position: 'insideLeft' }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: any) => typeof value === 'number' ? value.toFixed(1) : value} />
            <Legend />
            <Scatter name="Countries" dataKey="mortality" fill="#ef4444" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Best Improvers */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 15 Countries with Greatest CHI Improvement (2010-2022)</h2>
          <p className="text-gray-600 text-sm">
            These countries have made the most progress in improving child health outcomes over the past 12 years. 
            The improvement is measured as the change in Child Health Index scores from 2010 to 2022, showing countries 
            that have successfully implemented policies and programs to improve child health.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={bestImprovers} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="country" type="category" width={150} />
            <Tooltip formatter={(value: number) => `+${value.toFixed(1)}`} />
            <Bar dataKey="improvement" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

