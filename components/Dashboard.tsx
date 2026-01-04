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
} from 'recharts';
import { PopulationData } from '@/lib/excelReader';

interface DashboardProps {
  data: PopulationData[];
  summaryData: any[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Dashboard({ data, summaryData }: DashboardProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMetric, setSelectedMetric] = useState<'population' | 'area' | 'urbanization'>('population');
  const [showDeltaOnly, setShowDeltaOnly] = useState(false);
  const [showLECZOnly, setShowLECZOnly] = useState(false);

  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(data.map(d => d.year))).sort();
    return uniqueYears;
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = data;
    
    if (selectedYear !== 'all') {
      filtered = filtered.filter(d => d.year === selectedYear);
    }
    
    if (showDeltaOnly) {
      filtered = filtered.filter(d => d.delta === true);
    }
    
    if (showLECZOnly) {
      filtered = filtered.filter(d => d.lecz05 === true || d.lecz10 === true);
    }
    
    return filtered;
  }, [data, selectedYear, showDeltaOnly, showLECZOnly]);

  // Top countries by total population
  const topCountriesByPopulation = useMemo(() => {
    const countryTotals = filteredData.reduce((acc, d) => {
      if (!acc[d.country]) {
        acc[d.country] = 0;
      }
      acc[d.country] += d.totalPopulation || 0;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countryTotals)
      .map(([country, total]) => ({ country, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredData]);

  // Population trends over time
  const populationTrends = useMemo(() => {
    const trends = years.map(year => {
      const yearData = data.filter(d => d.year === year);
      return {
        year,
        total: yearData.reduce((sum, d) => sum + (d.totalPopulation || 0), 0),
        urban: yearData.reduce((sum, d) => sum + (d.urbanPopulation || 0), 0),
        rural: yearData.reduce((sum, d) => sum + (d.ruralPopulation || 0), 0),
        quasiUrban: yearData.reduce((sum, d) => sum + (d.quasiUrbanPopulation || 0), 0),
      };
    });
    return trends;
  }, [data, years]);

  // Urban vs Rural distribution
  const urbanRuralDistribution = useMemo(() => {
    const total = filteredData.reduce((sum, d) => sum + (d.totalPopulation || 0), 0);
    const urban = filteredData.reduce((sum, d) => sum + (d.urbanPopulation || 0), 0);
    const rural = filteredData.reduce((sum, d) => sum + (d.ruralPopulation || 0), 0);
    const quasiUrban = filteredData.reduce((sum, d) => sum + (d.quasiUrbanPopulation || 0), 0);
    
    return [
      { name: 'Urban', value: urban, percentage: ((urban / total) * 100).toFixed(1) },
      { name: 'Rural', value: rural, percentage: ((rural / total) * 100).toFixed(1) },
      { name: 'Quasi-Urban', value: quasiUrban, percentage: ((quasiUrban / total) * 100).toFixed(1) },
    ].filter(item => item.value > 0);
  }, [filteredData]);

  // Delta vs Non-Delta comparison
  const deltaComparison = useMemo(() => {
    const deltaData = data.filter(d => d.delta === true);
    const nonDeltaData = data.filter(d => d.delta !== true);
    
    return years.map(year => {
      const deltaYear = deltaData.filter(d => d.year === year);
      const nonDeltaYear = nonDeltaData.filter(d => d.year === year);
      
      return {
        year,
        delta: deltaYear.reduce((sum, d) => sum + (d.totalPopulation || 0), 0),
        nonDelta: nonDeltaYear.reduce((sum, d) => sum + (d.totalPopulation || 0), 0),
      };
    });
  }, [data, years]);

  // LECZ05 vs LECZ10 vs Non-LECZ
  const leczComparison = useMemo(() => {
    return years.map(year => {
      const yearData = data.filter(d => d.year === year);
      const lecz05 = yearData.filter(d => d.lecz05 === true);
      const lecz10 = yearData.filter(d => d.lecz10 === true && d.lecz05 !== true);
      const nonLecz = yearData.filter(d => d.lecz05 !== true && d.lecz10 !== true);
      
      return {
        year,
        lecz05: lecz05.reduce((sum, d) => sum + (d.totalPopulation || 0), 0),
        lecz10: lecz10.reduce((sum, d) => sum + (d.totalPopulation || 0), 0),
        nonLecz: nonLecz.reduce((sum, d) => sum + (d.totalPopulation || 0), 0),
      };
    });
  }, [data, years]);

  // Land area trends
  const landAreaTrends = useMemo(() => {
    return years.map(year => {
      const yearData = data.filter(d => d.year === year);
      return {
        year,
        totalLandArea: yearData.reduce((sum, d) => sum + (d.totalLandArea || 0), 0),
        builtUpArea: yearData.reduce((sum, d) => sum + (d.builtUpArea || 0), 0),
      };
    });
  }, [data, years]);

  // Urbanization rate by country (latest year)
  const urbanizationByCountry = useMemo(() => {
    const latestYear = Math.max(...years);
    const latestData = data.filter(d => d.year === latestYear);
    
    const countryRates = latestData.reduce((acc, d) => {
      if (!acc[d.country]) {
        acc[d.country] = { total: 0, urban: 0 };
      }
      acc[d.country].total += d.totalPopulation || 0;
      acc[d.country].urban += d.urbanPopulation || 0;
      return acc;
    }, {} as Record<string, { total: number; urban: number }>);

    return Object.entries(countryRates)
      .map(([country, { total, urban }]) => ({
        country,
        urbanizationRate: total > 0 ? ((urban / total) * 100) : 0,
      }))
      .sort((a, b) => b.urbanizationRate - a.urbanizationRate)
      .slice(0, 15);
  }, [data, years]);

  // Population growth rate (1990-2015)
  const populationGrowthRate = useMemo(() => {
    if (populationTrends.length < 2) return 0;
    const firstYear = populationTrends[0];
    const lastYear = populationTrends[populationTrends.length - 1];
    if (firstYear.total === 0) return 0;
    const totalGrowth = ((lastYear.total - firstYear.total) / firstYear.total) * 100;
    const yearsDiff = lastYear.year - firstYear.year;
    return totalGrowth / yearsDiff; // Annual growth rate
  }, [populationTrends]);

  // Risk indicator: Population in LECZ zones
  const leczRiskIndicator = useMemo(() => {
    const latestYear = Math.max(...years);
    const latestData = data.filter(d => d.year === latestYear);
    const totalPop = latestData.reduce((sum, d) => sum + (d.totalPopulation || 0), 0);
    const leczPop = latestData
      .filter(d => d.lecz05 === true || d.lecz10 === true)
      .reduce((sum, d) => sum + (d.totalPopulation || 0), 0);
    
    return {
      total: totalPop,
      atRisk: leczPop,
      percentage: totalPop > 0 ? ((leczPop / totalPop) * 100) : 0,
    };
  }, [data, years]);

  // Delta zone vulnerability
  const deltaVulnerability = useMemo(() => {
    const latestYear = Math.max(...years);
    const latestData = data.filter(d => d.year === latestYear);
    const totalPop = latestData.reduce((sum, d) => sum + (d.totalPopulation || 0), 0);
    const deltaPop = latestData
      .filter(d => d.delta === true)
      .reduce((sum, d) => sum + (d.totalPopulation || 0), 0);
    
    return {
      total: totalPop,
      inDelta: deltaPop,
      percentage: totalPop > 0 ? ((deltaPop / totalPop) * 100) : 0,
    };
  }, [data, years]);

  // Urbanization growth (1990-2015)
  const urbanizationGrowth = useMemo(() => {
    if (populationTrends.length < 2) return 0;
    const firstYear = populationTrends[0];
    const lastYear = populationTrends[populationTrends.length - 1];
    
    const firstUrbanRate = firstYear.total > 0 ? (firstYear.urban / firstYear.total) * 100 : 0;
    const lastUrbanRate = lastYear.total > 0 ? (lastYear.urban / lastYear.total) * 100 : 0;
    
    return lastUrbanRate - firstUrbanRate; // Percentage point increase
  }, [populationTrends]);

  // Top countries in LECZ zones
  const topCountriesInLECZ = useMemo(() => {
    const latestYear = Math.max(...years);
    const latestData = data.filter(d => d.year === latestYear && (d.lecz05 === true || d.lecz10 === true));
    
    const countryTotals = latestData.reduce((acc, d) => {
      if (!acc[d.country]) {
        acc[d.country] = 0;
      }
      acc[d.country] += d.totalPopulation || 0;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countryTotals)
      .map(([country, total]) => ({ country, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [data, years]);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Filters & Controls</h2>
          <p className="text-gray-600 text-sm">
            Use these filters to explore the data from different perspectives. Filter by year, focus on specific metrics, 
            or isolate data from delta zones and low-elevation coastal zones (LECZ) to understand vulnerability patterns.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metric Focus
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="population">Population</option>
              <option value="area">Land Area</option>
              <option value="urbanization">Urbanization</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="deltaOnly"
              checked={showDeltaOnly}
              onChange={(e) => setShowDeltaOnly(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="deltaOnly" className="ml-2 block text-sm text-gray-700">
              Delta Zones Only
              <span className="block text-xs text-gray-500 mt-0.5">River delta regions</span>
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="leczOnly"
              checked={showLECZOnly}
              onChange={(e) => setShowLECZOnly(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="leczOnly" className="ml-2 block text-sm text-gray-700">
              LECZ Zones Only
              <span className="block text-xs text-gray-500 mt-0.5">Low elevation coastal zones</span>
            </label>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Insights at a Glance</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Quick overview of the dataset based on your selected filters. These metrics help understand population distribution, 
          urbanization patterns, and climate vulnerability indicators.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Total Population</div>
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {(filteredData.reduce((sum, d) => sum + (d.totalPopulation || 0), 0) / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-gray-500">Based on selected filters</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Urban Population %</div>
            <div className="text-2xl font-bold text-green-700 mb-1">
              {urbanRuralDistribution.find(d => d.name === 'Urban')?.percentage || '0'}%
            </div>
            <div className="text-xs text-gray-500">Percentage in urban centers</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 mb-1">Total Land Area</div>
            <div className="text-2xl font-bold text-purple-700 mb-1">
              {(filteredData.reduce((sum, d) => sum + (d.totalLandArea || 0), 0) / 1000).toFixed(0)}K km²
            </div>
            <div className="text-xs text-gray-500">Square kilometers</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
            <div className="text-sm text-gray-600 mb-1">Built-up Area</div>
            <div className="text-2xl font-bold text-orange-700 mb-1">
              {(filteredData.reduce((sum, d) => sum + (d.builtUpArea || 0), 0) / 1000).toFixed(0)}K km²
            </div>
            <div className="text-xs text-gray-500">Human-made structures</div>
          </div>
        </div>
        
        {/* Additional Risk & Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <div className="text-sm text-gray-600 mb-1">Population at Risk (LECZ)</div>
            <div className="text-2xl font-bold text-red-700 mb-1">
              {leczRiskIndicator.percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {(leczRiskIndicator.atRisk / 1000000).toFixed(2)}M in low-elevation zones
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600 mb-1">Delta Zone Population</div>
            <div className="text-2xl font-bold text-yellow-700 mb-1">
              {deltaVulnerability.percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {(deltaVulnerability.inDelta / 1000000).toFixed(2)}M in delta regions
            </div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <div className="text-sm text-gray-600 mb-1">Avg. Annual Growth Rate</div>
            <div className="text-2xl font-bold text-indigo-700 mb-1">
              {populationGrowthRate.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500">1990-2015 population growth</div>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-500">
            <div className="text-sm text-gray-600 mb-1">Urbanization Increase</div>
            <div className="text-2xl font-bold text-pink-700 mb-1">
              +{urbanizationGrowth.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Percentage point increase (1990-2015)</div>
          </div>
        </div>
      </div>

      {/* Population Trends Over Time */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Population Trends (1990-2015)</h2>
          <p className="text-gray-600 text-sm">
            This chart shows how global population has changed over 25 years, broken down by settlement type. 
            <strong> Urban</strong> refers to cities and towns with dense populations; <strong>Rural</strong> refers to countryside areas; 
            <strong> Quasi-Urban</strong> represents transitional zones between urban and rural. 
            The stacked areas show the composition of total population, helping identify urbanization trends and population shifts.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={populationTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(2)}M`} />
            <Legend />
            <Area type="monotone" dataKey="total" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Total Population" />
            <Area type="monotone" dataKey="urban" stackId="1" stroke="#10b981" fill="#10b981" name="Urban" />
            <Area type="monotone" dataKey="rural" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Rural" />
            <Area type="monotone" dataKey="quasiUrban" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Quasi-Urban" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Urban vs Rural Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Urban vs Rural Population Distribution</h2>
          <p className="text-gray-600 text-sm">
            This visualization shows the proportion of population living in different settlement types based on your filters. 
            Understanding this distribution is crucial for planning infrastructure, services, and understanding how people live. 
            A higher urban percentage typically indicates more developed economies, while rural populations often depend more on agriculture.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={urbanRuralDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {urbanRuralDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(2)}M`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {urbanRuralDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{(item.value / 1000000).toFixed(2)}M</div>
                  <div className="text-sm text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Countries by Population */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 10 Countries by Total Population</h2>
          <p className="text-gray-600 text-sm">
            Countries ranked by total population based on your selected filters. This helps identify which nations 
            have the largest populations in the dataset, which is important for understanding global demographics and 
            resource allocation needs.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topCountriesByPopulation} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="country" type="category" width={150} />
            <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(2)}M`} />
            <Bar dataKey="total" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Delta vs Non-Delta Comparison */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Delta vs Non-Delta Population Comparison</h2>
          <p className="text-gray-600 text-sm">
            <strong>Delta zones</strong> are low-lying areas where rivers deposit sediment (like the Nile Delta, Ganges-Brahmaputra Delta). 
            These regions are often highly fertile and densely populated, but also highly vulnerable to sea-level rise and flooding. 
            This comparison shows how many people live in these at-risk delta regions versus other areas. 
            Understanding this helps prioritize climate adaptation efforts.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={deltaComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(2)}M`} />
            <Legend />
            <Bar dataKey="delta" fill="#10b981" name="Delta Zones" />
            <Bar dataKey="nonDelta" fill="#f59e0b" name="Non-Delta Zones" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LECZ Comparison */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Low Elevation Coastal Zone (LECZ) Population Distribution</h2>
          <p className="text-gray-600 text-sm">
            <strong>LECZ (Low Elevation Coastal Zone)</strong> represents areas at low elevations near the coast, vulnerable to sea-level rise. 
            <strong> LECZ 05</strong> includes areas at or below 5 meters elevation; <strong>LECZ 10</strong> includes areas at 5-10 meters elevation. 
            This chart shows population trends in these vulnerable zones versus higher elevations. 
            As sea levels rise due to climate change, populations in LECZ zones face increasing risks from flooding and storm surges. 
            Tracking these trends helps assess climate vulnerability and plan adaptation strategies.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={leczComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(2)}M`} />
            <Legend />
            <Line type="monotone" dataKey="lecz05" stroke="#ef4444" strokeWidth={2} name="LECZ 05 (≤5m)" />
            <Line type="monotone" dataKey="lecz10" stroke="#f59e0b" strokeWidth={2} name="LECZ 10 (5-10m)" />
            <Line type="monotone" dataKey="nonLecz" stroke="#10b981" strokeWidth={2} name="Non-LECZ (>10m)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Land Area Trends */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Land Use Trends: Total Area vs Built-up Area</h2>
          <p className="text-gray-600 text-sm">
            <strong>Total Land Area</strong> represents all available land, while <strong>Built-up Area</strong> shows land covered by 
            buildings, roads, and infrastructure. The gap between them represents undeveloped land (agriculture, forests, etc.). 
            Tracking built-up area growth indicates urbanization intensity and infrastructure development. 
            This helps understand how land is being used and how much natural land remains.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={landAreaTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${(value / 1000).toFixed(0)}K km²`} />
            <Legend />
            <Area type="monotone" dataKey="totalLandArea" stroke="#8b5cf6" fill="#8b5cf6" name="Total Land Area" />
            <Area type="monotone" dataKey="builtUpArea" stroke="#ec4899" fill="#ec4899" name="Built-up Area" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Urbanization Rate by Country */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 15 Countries by Urbanization Rate (2015)</h2>
          <p className="text-gray-600 text-sm">
            <strong>Urbanization Rate</strong> is the percentage of a country's population living in urban areas. 
            Higher rates indicate more developed, city-centered economies. Countries with rapid urbanization often experience 
            changes in infrastructure needs, resource consumption patterns, and social dynamics. 
            This ranking helps identify which nations have the most urbanized populations.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={urbanizationByCountry}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="country" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            <Bar dataKey="urbanizationRate" fill="#ec4899" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Countries in LECZ Zones */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 10 Countries with Population in LECZ Zones (2015)</h2>
          <p className="text-gray-600 text-sm">
            This chart identifies countries with the highest populations living in <strong>Low Elevation Coastal Zones (LECZ)</strong> - 
            areas at or below 10 meters elevation near the coast. These populations are particularly vulnerable to sea-level rise, 
            storm surges, and coastal flooding. Countries appearing high on this list face significant climate adaptation challenges 
            and may require substantial investment in coastal protection and adaptation measures.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topCountriesInLECZ} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="country" type="category" width={150} />
            <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(2)}M`} />
            <Bar dataKey="total" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

