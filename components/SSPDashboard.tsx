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
import { SSPData } from '@/lib/sspDataReader';

interface SSPDashboardProps {
  data: SSPData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function SSPDashboard({ data }: SSPDashboardProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedSSP, setSelectedSSP] = useState<'all' | 'SSP1' | 'SSP2' | 'SSP3' | 'SSP4' | 'SSP5'>('all');

  const years = useMemo(() => {
    return Array.from(new Set(data.map(d => d.publicationYear).filter(y => y))).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = data;
    
    if (selectedYear !== 'all') {
      filtered = filtered.filter(d => d.publicationYear === selectedYear);
    }
    
    if (selectedSSP !== 'all') {
      filtered = filtered.filter(d => {
        const sspKey = selectedSSP.toLowerCase() as keyof SSPData;
        return d[sspKey] === true;
      });
    }
    
    return filtered;
  }, [data, selectedYear, selectedSSP]);

  // Publication trends over time
  const publicationTrends = useMemo(() => {
    const trends: any[] = [];
    years.forEach(year => {
      const yearData = data.filter(d => d.publicationYear === year);
      trends.push({
        year,
        count: yearData.length,
        withStakeholder: yearData.filter(d => d.stakeholderInvolvement === 'Y').length,
        withoutStakeholder: yearData.filter(d => d.stakeholderInvolvement === 'N').length,
      });
    });
    return trends;
  }, [data, years]);

  // SSP usage patterns
  const sspUsage = useMemo(() => {
    return [
      { name: 'SSP1', count: data.filter(d => d.ssp1 === true).length },
      { name: 'SSP2', count: data.filter(d => d.ssp2 === true).length },
      { name: 'SSP3', count: data.filter(d => d.ssp3 === true).length },
      { name: 'SSP4', count: data.filter(d => d.ssp4 === true).length },
      { name: 'SSP5', count: data.filter(d => d.ssp5 === true).length },
    ].filter(item => item.count > 0);
  }, [data]);

  // RCP usage patterns
  const rcpUsage = useMemo(() => {
    const rcpMap: Record<string, number> = {};
    data.forEach(d => {
      if (d.rcps) {
        const rcps = String(d.rcps).split(/[;,\s]+/).filter(r => r);
        rcps.forEach(rcp => {
          const rcpKey = rcp.trim();
          if (rcpKey) {
            rcpMap[rcpKey] = (rcpMap[rcpKey] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(rcpMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [data]);

  // Theme distribution
  const themeDistribution = useMemo(() => {
    const themeMap: Record<string, number> = {};
    data.forEach(d => {
      if (d.theme) {
        const themes = String(d.theme).split(/[;,\/]+/).map(t => t.trim()).filter(t => t);
        themes.forEach(theme => {
          themeMap[theme] = (themeMap[theme] || 0) + 1;
        });
      }
    });
    return Object.entries(themeMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [data]);

  // Top journals
  const topJournals = useMemo(() => {
    const journalMap: Record<string, number> = {};
    data.forEach(d => {
      if (d.journal) {
        const journal = String(d.journal).trim();
        if (journal) {
          journalMap[journal] = (journalMap[journal] || 0) + 1;
        }
      }
    });
    return Object.entries(journalMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [data]);

  // Top countries studied
  const topCountries = useMemo(() => {
    const countryMap: Record<string, number> = {};
    data.forEach(d => {
      if (d.caseStudyCountries) {
        const countries = String(d.caseStudyCountries).split(/[;,\/]+/).map(c => c.trim()).filter(c => c);
        countries.forEach(country => {
          countryMap[country] = (countryMap[country] || 0) + 1;
        });
      }
    });
    return Object.entries(countryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [data]);

  // IAV focus distribution
  const iavFocus = useMemo(() => {
    const focusMap: Record<string, number> = {};
    data.forEach(d => {
      if (d.iavFocus) {
        const focus = String(d.iavFocus).trim();
        if (focus) {
          focusMap[focus] = (focusMap[focus] || 0) + 1;
        }
      }
    });
    return Object.entries(focusMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // Model type distribution
  const modelTypes = useMemo(() => {
    const modelMap: Record<string, number> = {};
    data.forEach(d => {
      if (d.mainModelType) {
        const model = String(d.mainModelType).trim();
        if (model && model !== 'None' && model !== 'NA') {
          modelMap[model] = (modelMap[model] || 0) + 1;
        }
      }
    });
    return Object.entries(modelMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [data]);

  // Top-down vs bottom-up
  const approachDistribution = useMemo(() => {
    const approachMap: Record<string, number> = {};
    data.forEach(d => {
      if (d.topDownBottomUp) {
        const approach = String(d.topDownBottomUp).trim();
        if (approach) {
          approachMap[approach] = (approachMap[approach] || 0) + 1;
        }
      }
    });
    return Object.entries(approachMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // Stakeholder involvement
  const stakeholderInvolvement = useMemo(() => {
    const yes = data.filter(d => d.stakeholderInvolvement === 'Y').length;
    const no = data.filter(d => d.stakeholderInvolvement === 'N').length;
    const unknown = data.length - yes - no;
    return [
      { name: 'Yes', value: yes },
      { name: 'No', value: no },
      { name: 'Unknown', value: unknown },
    ].filter(item => item.value > 0);
  }, [data]);

  // Number of SSPs used
  const sspCountDistribution = useMemo(() => {
    const countMap: Record<number, number> = {};
    data.forEach(d => {
      const count = d.ssps || 0;
      if (count > 0) {
        countMap[count] = (countMap[count] || 0) + 1;
      }
    });
    return Object.entries(countMap)
      .map(([count, num]) => ({ count: parseInt(count), num }))
      .sort((a, b) => a.count - b.count);
  }, [data]);

  // Top affiliation countries
  const topAffiliationCountries = useMemo(() => {
    const countryMap: Record<string, number> = {};
    data.forEach(d => {
      if (d.affiliationCountry) {
        const country = String(d.affiliationCountry).trim();
        if (country) {
          countryMap[country] = (countryMap[country] || 0) + 1;
        }
      }
    });
    return Object.entries(countryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [data]);

  // Key metrics
  const keyMetrics = useMemo(() => {
    return {
      totalPapers: data.length,
      avgSSPsPerPaper: data.reduce((sum, d) => sum + (d.ssps || 0), 0) / data.length,
      withStakeholder: data.filter(d => d.stakeholderInvolvement === 'Y').length,
      stakeholderPercentage: (data.filter(d => d.stakeholderInvolvement === 'Y').length / data.length) * 100,
      uniqueCountries: new Set(data.filter(d => d.caseStudyCountries).map(d => String(d.caseStudyCountries).split(/[;,\/]+/).map(c => c.trim())).flat()).size,
      uniqueJournals: new Set(data.filter(d => d.journal).map(d => String(d.journal).trim())).size,
    };
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Filters & Controls</h2>
          <p className="text-gray-600 text-sm">
            Filter the literature database by publication year or specific Shared Socioeconomic Pathway (SSP). 
            <strong> SSPs</strong> (Shared Socioeconomic Pathways) are scenarios describing alternative futures of socioeconomic 
            development, while <strong>RCPs</strong> (Representative Concentration Pathways) describe different climate futures. 
            This database tracks 155 papers (2014-2021) that extended global SSP narratives to sub-global scales.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publication Year</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">SSP Filter</label>
            <select
              value={selectedSSP}
              onChange={(e) => setSelectedSSP(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All SSPs</option>
              <option value="SSP1">SSP1 (Sustainability)</option>
              <option value="SSP2">SSP2 (Middle of the Road)</option>
              <option value="SSP3">SSP3 (Regional Rivalry)</option>
              <option value="SSP4">SSP4 (Inequality)</option>
              <option value="SSP5">SSP5 (Fossil-Fueled Development)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Insights at a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Total Papers</div>
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {keyMetrics.totalPapers}
            </div>
            <div className="text-xs text-gray-500">2014-2021 literature database</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Avg. SSPs per Paper</div>
            <div className="text-2xl font-bold text-green-700 mb-1">
              {keyMetrics.avgSSPsPerPaper.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Average number of SSPs used</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 mb-1">Stakeholder Involvement</div>
            <div className="text-2xl font-bold text-purple-700 mb-1">
              {keyMetrics.stakeholderPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">{keyMetrics.withStakeholder} papers with stakeholders</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
            <div className="text-sm text-gray-600 mb-1">Unique Countries Studied</div>
            <div className="text-2xl font-bold text-orange-700 mb-1">
              {keyMetrics.uniqueCountries}
            </div>
            <div className="text-xs text-gray-500">Case study countries</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <div className="text-sm text-gray-600 mb-1">Unique Journals</div>
            <div className="text-2xl font-bold text-indigo-700 mb-1">
              {keyMetrics.uniqueJournals}
            </div>
            <div className="text-xs text-gray-500">Publications across journals</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <div className="text-sm text-gray-600 mb-1">Filtered Papers</div>
            <div className="text-2xl font-bold text-red-700 mb-1">
              {filteredData.length}
            </div>
            <div className="text-xs text-gray-500">Based on selected filters</div>
          </div>
        </div>
      </div>

      {/* Publication Trends */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Publication Trends Over Time (2014-2021)</h2>
          <p className="text-gray-600 text-sm">
            This chart shows the number of papers published each year in the database. The growth in publications 
            demonstrates increasing interest in extending global SSP narratives to sub-global scales for climate 
            impact, adaptation, and vulnerability (CCIAV) assessments. The chart also shows stakeholder involvement trends.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={publicationTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="count" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Total Publications" />
            <Area type="monotone" dataKey="withStakeholder" stackId="1" stroke="#10b981" fill="#10b981" name="With Stakeholders" />
            <Area type="monotone" dataKey="withoutStakeholder" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Without Stakeholders" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* SSP Usage Patterns */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Shared Socioeconomic Pathway (SSP) Usage Patterns</h2>
          <p className="text-gray-600 text-sm">
            <strong>SSP1</strong> (Sustainability): Rapid development, low inequality, high environmental awareness. 
            <strong> SSP2</strong> (Middle of the Road): Moderate development, moderate inequality. 
            <strong> SSP3</strong> (Regional Rivalry): Slow development, high inequality, regional conflicts. 
            <strong> SSP4</strong> (Inequality): Slow development, high inequality within and between countries. 
            <strong> SSP5</strong> (Fossil-Fueled Development): Rapid development, low inequality, fossil-fuel intensive. 
            This chart shows how frequently each SSP scenario is used in the literature.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sspUsage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RCP Usage */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Representative Concentration Pathway (RCP) Usage</h2>
          <p className="text-gray-600 text-sm">
            <strong>RCPs</strong> (Representative Concentration Pathways) represent different greenhouse gas concentration 
            trajectories. RCP2.6 represents low emissions, RCP4.5 moderate emissions, RCP6.0 high emissions, and RCP8.5 
            very high emissions. This chart shows which RCP scenarios are most commonly used alongside SSPs in the literature.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={rcpUsage} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Theme Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Research Themes Distribution</h2>
          <p className="text-gray-600 text-sm">
            This chart shows the main research themes addressed in the literature. Many papers address multiple themes, 
            reflecting the interdisciplinary nature of climate impact, adaptation, and vulnerability assessments using SSPs.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={themeDistribution} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Journals */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 15 Journals Publishing SSP Research</h2>
          <p className="text-gray-600 text-sm">
            This chart identifies the journals that publish the most research on sub-global SSP extensions, 
            showing where this interdisciplinary research is being published.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topJournals} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={200} />
            <Tooltip />
            <Bar dataKey="count" fill="#ec4899" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Countries Studied */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 15 Countries Studied</h2>
          <p className="text-gray-600 text-sm">
            This chart shows which countries are most frequently used as case studies in sub-global SSP extensions. 
            Countries appearing frequently indicate regions where SSP-based climate assessments are most common.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topCountries} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* IAV Focus */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">IAV Focus Distribution</h2>
          <p className="text-gray-600 text-sm">
            <strong>IAV</strong> refers to Impact, Adaptation, and Vulnerability assessments. This chart shows 
            the primary focus areas of the studies - whether they focus on climate impacts, adaptation strategies, 
            vulnerability assessments, or other aspects.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={iavFocus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {iavFocus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {iavFocus.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.count}</div>
                  <div className="text-sm text-gray-500">{((item.count / data.length) * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stakeholder Involvement */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Stakeholder Involvement in Studies</h2>
          <p className="text-gray-600 text-sm">
            Stakeholder involvement is crucial for developing relevant sub-global SSP extensions. This chart shows 
            the proportion of studies that directly involved stakeholders in their research process, which helps 
            ensure scenarios are relevant to local contexts and decision-making.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stakeholderInvolvement}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stakeholderInvolvement.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {stakeholderInvolvement.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.value}</div>
                  <div className="text-sm text-gray-500">{((item.value / data.length) * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Types */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Model Types Used in Studies</h2>
          <p className="text-gray-600 text-sm">
            This chart shows the types of models used in SSP extension studies. Different model types (integrated assessment, 
            land use, climate, etc.) reflect the diverse methodological approaches used in climate impact assessments.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={modelTypes} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={200} />
            <Tooltip />
            <Bar dataKey="count" fill="#14b8a6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Approach Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top-Down vs Bottom-Up Approaches</h2>
          <p className="text-gray-600 text-sm">
            <strong>Top-down</strong> approaches start with global scenarios and scale down to local levels. 
            <strong> Bottom-up</strong> approaches build scenarios from local contexts upward. 
            <strong> Combined</strong> approaches integrate both methods. This chart shows the distribution of 
            methodological approaches used in SSP extensions.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={approachDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SSP Count Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Number of SSPs Used per Study</h2>
          <p className="text-gray-600 text-sm">
            This chart shows how many SSP scenarios are typically used in each study. Studies may use one SSP 
            (single scenario analysis) or multiple SSPs (comparative scenario analysis) to explore different future pathways.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sspCountDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="count" label={{ value: 'Number of SSPs', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Number of Studies', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="num" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Affiliation Countries */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 15 Countries by First Author Affiliation</h2>
          <p className="text-gray-600 text-sm">
            This chart shows which countries' researchers are leading SSP extension research, based on the 
            affiliation country of the first author. This reflects the geographic distribution of research activity 
            in this field.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topAffiliationCountries} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="count" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

