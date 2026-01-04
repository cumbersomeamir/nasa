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
  ComposedChart,
} from 'recharts';
import { CropData } from '@/lib/cropDataReader';

interface CropDashboardProps {
  data: CropData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function CropDashboard({ data }: CropDashboardProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<'production' | 'yield' | 'hectares'>('production');

  const crops = useMemo(() => {
    return Array.from(new Set(data.map(d => d.crop).filter(c => c))).sort();
  }, [data]);

  const years = useMemo(() => {
    return Array.from(new Set(data.map(d => d.year).filter(y => y && y > 0))).sort();
  }, [data]);

  const countries = useMemo(() => {
    return Array.from(new Set(data.map(d => d.country).filter(c => c))).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = data;
    
    if (selectedYear !== 'all') {
      filtered = filtered.filter(d => d.year === selectedYear);
    }
    
    if (selectedCrop !== 'all') {
      filtered = filtered.filter(d => d.crop === selectedCrop);
    }
    
    return filtered;
  }, [data, selectedYear, selectedCrop]);

  // Production trends over time (aggregated by year)
  const productionTrends = useMemo(() => {
    const trends: any[] = [];
    const yearMap = new Map<number, { wheat: number; maize: number; total: number }>();
    
    data.forEach(d => {
      if (d.year && d.production && d.production > 0) {
        if (!yearMap.has(d.year)) {
          yearMap.set(d.year, { wheat: 0, maize: 0, total: 0 });
        }
        const entry = yearMap.get(d.year)!;
        entry.total += d.production;
        if (d.crop === 'wheat') entry.wheat += d.production;
        if (d.crop === 'maize') entry.maize += d.production;
      }
    });
    
    Array.from(yearMap.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([year, values]) => {
        trends.push({ year, ...values });
      });
    
    return trends;
  }, [data]);

  // Yield trends over time (aggregated by year)
  const yieldTrends = useMemo(() => {
    const trends: any[] = [];
    const yearMap = new Map<number, { wheat: number[]; maize: number[]; wheatCount: number; maizeCount: number }>();
    
    data.forEach(d => {
      if (d.year && d.yield && d.yield > 0) {
        if (!yearMap.has(d.year)) {
          yearMap.set(d.year, { wheat: [], maize: [], wheatCount: 0, maizeCount: 0 });
        }
        const entry = yearMap.get(d.year)!;
        if (d.crop === 'wheat') {
          entry.wheat.push(d.yield);
          entry.wheatCount++;
        }
        if (d.crop === 'maize') {
          entry.maize.push(d.yield);
          entry.maizeCount++;
        }
      }
    });
    
    Array.from(yearMap.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([year, values]) => {
        const avgWheat = values.wheat.length > 0 
          ? values.wheat.reduce((sum, y) => sum + y, 0) / values.wheat.length 
          : 0;
        const avgMaize = values.maize.length > 0 
          ? values.maize.reduce((sum, y) => sum + y, 0) / values.maize.length 
          : 0;
        trends.push({ 
          year, 
          avgWheat: avgWheat > 0 ? avgWheat : undefined,
          avgMaize: avgMaize > 0 ? avgMaize : undefined,
        });
      });
    
    return trends.filter(t => t.avgWheat || t.avgMaize);
  }, [data]);

  // Top countries by production (latest year with substantial data)
  const topCountriesByProduction = useMemo(() => {
    // Find the most recent year with substantial data (at least 10 countries)
    let selectedYear = Math.max(...years);
    for (let year = Math.max(...years); year >= Math.min(...years); year--) {
      const yearData = data.filter(d => d.year === year && d.production && d.production > 0);
      const uniqueCountries = new Set(yearData.map(d => d.country).filter(c => c)).size;
      if (uniqueCountries >= 10) {
        selectedYear = year;
        break;
      }
    }
    
    const latestData = data.filter(d => d.year === selectedYear && d.production && d.production > 0);
    
    const countryMap = new Map<string, number>();
    latestData.forEach(d => {
      if (d.country && d.production) {
        countryMap.set(d.country, (countryMap.get(d.country) || 0) + d.production);
      }
    });
    
    return {
      year: selectedYear,
      data: Array.from(countryMap.entries())
        .map(([country, total]) => ({ country, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 15)
    };
  }, [data, years]);

  // Top countries by yield (latest year with substantial data)
  const topCountriesByYield = useMemo(() => {
    // Find the most recent year with substantial data (at least 10 countries)
    let selectedYear = Math.max(...years);
    for (let year = Math.max(...years); year >= Math.min(...years); year--) {
      const yearData = data.filter(d => d.year === year && d.yield && d.yield > 0);
      const uniqueCountries = new Set(yearData.map(d => d.country).filter(c => c)).size;
      if (uniqueCountries >= 10) {
        selectedYear = year;
        break;
      }
    }
    
    const latestData = data.filter(d => d.year === selectedYear && d.yield && d.yield > 0);
    
    const countryMap = new Map<string, { sum: number; count: number }>();
    latestData.forEach(d => {
      if (d.country && d.yield) {
        const entry = countryMap.get(d.country) || { sum: 0, count: 0 };
        entry.sum += d.yield;
        entry.count++;
        countryMap.set(d.country, entry);
      }
    });
    
    return {
      year: selectedYear,
      data: Array.from(countryMap.entries())
        .map(([country, { sum, count }]) => ({ country, avgYield: sum / count }))
        .sort((a, b) => b.avgYield - a.avgYield)
        .slice(0, 15)
    };
  }, [data, years]);

  // Crop distribution (by total production)
  const cropDistribution = useMemo(() => {
    const cropMap = new Map<string, number>();
    data.forEach(d => {
      if (d.crop && d.production && d.production > 0) {
        cropMap.set(d.crop, (cropMap.get(d.crop) || 0) + d.production);
      }
    });
    
    return Array.from(cropMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  // Production by crop over time
  const productionByCropOverTime = useMemo(() => {
    const cropYearMap = new Map<string, Map<number, number>>();
    
    data.forEach(d => {
      if (d.crop && d.year && d.production && d.production > 0) {
        if (!cropYearMap.has(d.crop)) {
          cropYearMap.set(d.crop, new Map());
        }
        const yearMap = cropYearMap.get(d.crop)!;
        yearMap.set(d.year, (yearMap.get(d.year) || 0) + d.production);
      }
    });
    
    const yearSet = new Set<number>();
    cropYearMap.forEach(yearMap => {
      yearMap.forEach((_, year) => yearSet.add(year));
    });
    
    const yearArray = Array.from(yearSet).sort();
    const cropsList = Array.from(cropYearMap.keys()).filter(c => ['wheat', 'maize'].includes(c));
    
    return yearArray.map(year => {
      const entry: any = { year };
      cropsList.forEach(crop => {
        const yearMap = cropYearMap.get(crop);
        if (yearMap && yearMap.has(year)) {
          entry[crop] = yearMap.get(year)! / 1000000; // Convert to millions
        }
      });
      return entry;
    }).filter(e => e.wheat || e.maize);
  }, [data]);

  // Yield by crop over time
  const yieldByCropOverTime = useMemo(() => {
    const cropYearMap = new Map<string, Map<number, { sum: number; count: number }>>();
    
    data.forEach(d => {
      if (d.crop && d.year && d.yield && d.yield > 0) {
        if (!cropYearMap.has(d.crop)) {
          cropYearMap.set(d.crop, new Map());
        }
        const yearMap = cropYearMap.get(d.crop)!;
        const entry = yearMap.get(d.year) || { sum: 0, count: 0 };
        entry.sum += d.yield;
        entry.count++;
        yearMap.set(d.year, entry);
      }
    });
    
    const yearSet = new Set<number>();
    cropYearMap.forEach(yearMap => {
      yearMap.forEach((_, year) => yearSet.add(year));
    });
    
    const yearArray = Array.from(yearSet).sort();
    const cropsList = Array.from(cropYearMap.keys()).filter(c => ['wheat', 'maize'].includes(c));
    
    return yearArray.map(year => {
      const entry: any = { year };
      cropsList.forEach(crop => {
        const yearMap = cropYearMap.get(crop);
        if (yearMap && yearMap.has(year)) {
          const { sum, count } = yearMap.get(year)!;
          if (count > 0) {
            entry[crop] = sum / count;
          }
        }
      });
      return entry;
    }).filter(e => e.wheat || e.maize);
  }, [data]);

  // Key metrics
  const keyMetrics = useMemo(() => {
    const totalProduction = data.reduce((sum, d) => sum + (d.production || 0), 0);
    const avgYield = data.filter(d => d.yield && d.yield > 0).reduce((sum, d) => sum + (d.yield || 0), 0) / 
                     data.filter(d => d.yield && d.yield > 0).length;
    const totalHectares = data.reduce((sum, d) => sum + (d.hectares || 0), 0);
    const latestYear = Math.max(...years);
    const latestData = data.filter(d => d.year === latestYear);
    const latestProduction = latestData.reduce((sum, d) => sum + (d.production || 0), 0);
    const latestAvgYield = latestData.filter(d => d.yield && d.yield > 0).reduce((sum, d) => sum + (d.yield || 0), 0) / 
                          latestData.filter(d => d.yield && d.yield > 0).length;
    
    return {
      totalRecords: data.length,
      totalProduction: totalProduction / 1000000, // Millions of tonnes
      avgYield,
      totalHectares: totalHectares / 1000000, // Millions of hectares
      latestYear,
      latestProduction: latestProduction / 1000000,
      latestAvgYield,
      uniqueCrops: crops.length,
      uniqueCountries: countries.length,
      yearRange: `${Math.min(...years)}-${Math.max(...years)}`,
    };
  }, [data, years, crops, countries]);

  // Production growth rates (by decade)
  const productionGrowthByDecade = useMemo(() => {
    const decadeMap = new Map<number, { start: number; end: number }>();
    
    const firstYear = Math.min(...years);
    const lastYear = Math.max(...years);
    
    for (let decadeStart = Math.floor(firstYear / 10) * 10; decadeStart < lastYear; decadeStart += 10) {
      const decadeEnd = Math.min(decadeStart + 9, lastYear);
      const startYear = decadeStart;
      const endYear = decadeEnd;
      
      const startData = data.filter(d => d.year === startYear && d.production && d.production > 0);
      const endData = data.filter(d => d.year === endYear && d.production && d.production > 0);
      
      const startTotal = startData.reduce((sum, d) => sum + (d.production || 0), 0);
      const endTotal = endData.reduce((sum, d) => sum + (d.production || 0), 0);
      
      if (startTotal > 0 && endTotal > 0) {
        decadeMap.set(decadeStart, { start: startTotal, end: endTotal });
      }
    }
    
    return Array.from(decadeMap.entries())
      .map(([decade, { start, end }]) => ({
        decade: `${decade}-${decade + 9}`,
        growthRate: ((end - start) / start) * 100,
        start: start / 1000000,
        end: end / 1000000,
      }))
      .sort((a, b) => parseInt(a.decade) - parseInt(b.decade));
  }, [data, years]);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Filters & Controls</h2>
          <p className="text-gray-600 text-sm">
            Filter the crop statistics by year, crop type, or focus on specific metrics (production, yield, or area). 
            This dataset contains historical crop statistics from 1900-2017 covering wheat, maize, and other crops 
            across multiple countries, providing insights into agricultural trends over the 20th century.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Years</option>
              {years.filter((_, i) => i % 10 === 0 || i === years.length - 1).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Crops</option>
              {crops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
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
              <option value="production">Production</option>
              <option value="yield">Yield</option>
              <option value="hectares">Area (Hectares)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Insights at a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Total Records</div>
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {keyMetrics.totalRecords.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Data points</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Total Production</div>
            <div className="text-2xl font-bold text-green-700 mb-1">
              {keyMetrics.totalProduction.toFixed(0)}M
            </div>
            <div className="text-xs text-gray-500">Million tonnes (all years)</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 mb-1">Avg. Yield</div>
            <div className="text-2xl font-bold text-purple-700 mb-1">
              {keyMetrics.avgYield.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">Tonnes per hectare</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
            <div className="text-sm text-gray-600 mb-1">Year Range</div>
            <div className="text-2xl font-bold text-orange-700 mb-1">
              {keyMetrics.yearRange}
            </div>
            <div className="text-xs text-gray-500">{keyMetrics.latestYear - Math.min(...years)} years</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <div className="text-sm text-gray-600 mb-1">Countries</div>
            <div className="text-2xl font-bold text-indigo-700 mb-1">
              {keyMetrics.uniqueCountries}
            </div>
            <div className="text-xs text-gray-500">Crops: {keyMetrics.uniqueCrops}</div>
          </div>
        </div>
      </div>

      {/* Global Production Trends */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Production Trends Over Time</h2>
          <p className="text-gray-600 text-sm">
            This chart shows global crop production trends from {Math.min(...years)} to {Math.max(...years)}. 
            <strong> Production</strong> is measured in tonnes (total crop output). The chart shows how global 
            agricultural production has evolved over more than a century, reflecting technological advances, 
            agricultural expansion, and changes in farming practices.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={productionTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(1)}M tonnes`} />
            <Legend />
            <Area type="monotone" dataKey="wheat" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Wheat" />
            <Area type="monotone" dataKey="maize" stackId="1" stroke="#10b981" fill="#10b981" name="Maize" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Yield Trends */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Crop Yield Trends Over Time</h2>
          <p className="text-gray-600 text-sm">
            <strong>Yield</strong> measures crop output per unit area (tonnes per hectare), indicating agricultural 
            productivity. Higher yields indicate more efficient farming practices, better crop varieties, improved 
            irrigation, and technological advances. This chart shows average yield trends for wheat and maize, 
            demonstrating the "Green Revolution" and other agricultural improvements over the 20th century.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={yieldTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)} tonnes/ha`} />
            <Legend />
            <Line type="monotone" dataKey="avgWheat" stroke="#3b82f6" strokeWidth={2} name="Avg. Wheat Yield" />
            <Line type="monotone" dataKey="avgMaize" stroke="#10b981" strokeWidth={2} name="Avg. Maize Yield" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Countries by Production */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 15 Countries by Production ({topCountriesByProduction.year})</h2>
          <p className="text-gray-600 text-sm">
            This chart shows the top producing countries for all crops in {topCountriesByProduction.year}, the most recent year with substantial data. 
            <strong> Production</strong> represents the total crop output in tonnes. Countries with high production 
            are major agricultural producers, playing crucial roles in global food security.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topCountriesByProduction.data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="country" type="category" width={150} />
            <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(1)}M tonnes`} />
            <Bar dataKey="total" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Countries by Yield */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 15 Countries by Average Yield ({topCountriesByYield.year})</h2>
          <p className="text-gray-600 text-sm">
            This chart shows countries with the highest average crop yields (tonnes per hectare) in {topCountriesByYield.year}, the most recent year with substantial data. 
            High-yield countries typically have advanced agricultural technologies, favorable climates, efficient 
            irrigation systems, and modern farming practices. Yield is a key indicator of agricultural efficiency.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topCountriesByYield.data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="country" type="category" width={150} />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)} tonnes/ha`} />
            <Bar dataKey="avgYield" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Crop Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Production Distribution by Crop Type</h2>
          <p className="text-gray-600 text-sm">
            This chart shows the total production share of different crop types across all years in the dataset. 
            Understanding crop distribution helps identify which crops are most important globally and how production 
            is distributed across different crop types.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cropDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
              >
                {cropDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(1)}M tonnes`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {cropDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{(item.total / 1000000).toFixed(1)}M</div>
                  <div className="text-sm text-gray-500">tonnes</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production by Crop Over Time */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wheat vs Maize Production Over Time</h2>
          <p className="text-gray-600 text-sm">
            This comparison chart shows production trends for wheat and maize over time. Both are major staple crops 
            globally. Understanding their relative production helps track shifts in agricultural focus, dietary preferences, 
            and crop choices over the 20th century.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={productionByCropOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}M tonnes`} />
            <Legend />
            <Area type="monotone" dataKey="wheat" fill="#3b82f6" stroke="#3b82f6" name="Wheat" />
            <Area type="monotone" dataKey="maize" fill="#10b981" stroke="#10b981" name="Maize" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Yield by Crop Over Time */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wheat vs Maize Yield Trends Over Time</h2>
          <p className="text-gray-600 text-sm">
            This chart compares yield trends (productivity per hectare) for wheat and maize over time. Both crops 
            show significant yield improvements over the 20th century, reflecting agricultural technology advances, 
            improved crop varieties, better farming practices, and increased use of fertilizers and irrigation.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={yieldByCropOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)} tonnes/ha`} />
            <Legend />
            <Line type="monotone" dataKey="wheat" stroke="#3b82f6" strokeWidth={2} name="Wheat Yield" />
            <Line type="monotone" dataKey="maize" stroke="#10b981" strokeWidth={2} name="Maize Yield" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Production Growth by Decade */}
      {productionGrowthByDecade.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Production Growth Rates by Decade</h2>
            <p className="text-gray-600 text-sm">
              This chart shows production growth rates by decade, calculated as the percentage change from the start 
              to the end of each decade. Positive growth rates indicate expanding agricultural production, while 
              negative rates indicate declines. This helps identify periods of rapid agricultural expansion or contraction.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={productionGrowthByDecade}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="decade" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Bar dataKey="growthRate" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

