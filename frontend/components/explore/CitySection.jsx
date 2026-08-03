'use client';

import React from 'react';

/**
 * CitySection: Displays district links for Pune and Mumbai.
 */
export default function CitySection({ onSelectDistrict }) {
  const citiesData = [
    {
      name: 'Pune',
      districts: ['Koregaon Park', 'Kothrud', 'Viman Nagar', 'Deccan', 'Aundh']
    },
    {
      name: 'Mumbai',
      districts: ['Bandra', 'Bandra West', 'Colaba', 'Juhu', 'Andheri']
    }
  ];

  return (
    <div className="w-full text-left space-y-4">
      <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
        Explore by City & Districts
      </h3>

      <div className="grid sm:grid-cols-2 gap-6">
        {citiesData.map((city) => (
          <div key={city.name} className="bg-[#111622] border border-border rounded-xl p-5 space-y-3 shadow-low">
            <h4 className="text-sm font-bold text-foreground">
              📍 {city.name}
            </h4>

            <div className="flex flex-wrap gap-2">
              {city.districts.map((d) => (
                <button
                  key={d}
                  onClick={() => onSelectDistrict && onSelectDistrict(city.name, d)}
                  className="text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/50 bg-[#1e2638] border border-border px-2.5 py-1.5 rounded transition cursor-pointer"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export { CitySection };
