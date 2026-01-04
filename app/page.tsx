import Link from "next/link";

export default function Home() {
  const datasets = [
    {
      id: "nasa-data-1",
      name: "LECZ Delta Urban-Rural Population and Land Area Estimates",
      description: "Country-level estimates of populations and land areas in river delta- and non-delta contexts (1990, 2000, 2014, 2015)",
    },
    {
      id: "nrpi-chi-2023-xlsx",
      name: "Natural Resource Protection and Child Health Indicators (2023)",
      description: "Natural Resource Protection Index (NRPI) and Child Health Indicators (CHI) including mortality rates, water access, and sanitation (2010-2022)",
    },
    {
      id: "ssp-sub-global-scenarios-xlsx",
      name: "Sub-Global Scenarios Extending Global SSP Narratives: Literature Database",
      description: "Literature database tracking 155 papers (2014-2021) extending Shared Socioeconomic Pathways (SSPs) to sub-global scales for climate assessments",
    },
    {
      id: "food-twentieth-century-crop-statistics-1900-2017-xlsx",
      name: "Twentieth Century Crop Statistics (1900-2017)",
      description: "Historical crop statistics for wheat, maize, and cereals including production (tonnes), yield (tonnes/ha), and area (hectares) across multiple countries",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            NASA Data Explorer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore NASA datasets with interactive visualizations and insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {datasets.map((dataset) => (
            <Link
              key={dataset.id}
              href={`/${dataset.id}`}
              className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200 hover:border-indigo-500"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {dataset.name}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {dataset.description}
                </p>
              </div>
              <div className="mt-4 flex items-center text-indigo-600 font-medium">
                Explore Dataset
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>More datasets coming soon...</p>
        </div>
      </div>
    </div>
  );
}

