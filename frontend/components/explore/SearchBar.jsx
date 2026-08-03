'use client';

import React, { useState } from 'react';

/**
 * SearchBar: Collapsible filters search bar that expands on click.
 */
export default function SearchBar({ onSearch, onClear }) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [tag, setTag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const tags = tag ? [tag] : [];
    if (onSearch) {
      onSearch({
        search,
        city,
        area,
        category,
        budget,
        tags
      });
    }
  };

  const handleClear = () => {
    setSearch('');
    setCity('');
    setArea('');
    setCategory('');
    setBudget('');
    setTag('');
    if (onClear) onClear();
  };

  return (
    <div className="w-full bg-[#111622] border border-border rounded-xl p-4.5 text-left shadow-low space-y-4">
      
      {/* Collapsed top bar */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="flex justify-between items-center cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">🔍</span>
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            {expanded ? 'Hide Search Filters' : 'Search & Filter Venues'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-border/40 animate-fade-in">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            
            {/* Search Keyword */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase" htmlFor="search-keyword">
                Keyword
              </label>
              <input
                id="search-keyword"
                type="text"
                placeholder="Cafe, roastery..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2.5 bg-secondary/15 border border-border rounded text-[10px] text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase" htmlFor="search-city">
                City
              </label>
              <input
                id="search-city"
                type="text"
                placeholder="Pune, Mumbai..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-secondary/15 border border-border rounded text-[10px] text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Area */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase" htmlFor="search-area">
                District / Area
              </label>
              <input
                id="search-area"
                type="text"
                placeholder="Koregaon Park..."
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-2.5 bg-secondary/15 border border-border rounded text-[10px] text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase" htmlFor="search-category">
                Category
              </label>
              <input
                id="search-category"
                type="text"
                placeholder="Cafe, Bookstore..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-secondary/15 border border-border rounded text-[10px] text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Budget */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase" htmlFor="search-budget">
                Max Spend (₹)
              </label>
              <input
                id="search-budget"
                type="text"
                placeholder="500..."
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-2.5 bg-secondary/15 border border-border rounded text-[10px] text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Tag */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase" htmlFor="search-tag">
                Vibe / Tag
              </label>
              <input
                id="search-tag"
                type="text"
                placeholder="Cozy, Romantic..."
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full p-2.5 bg-secondary/15 border border-border rounded text-[10px] text-foreground focus:outline-none focus:border-primary"
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 border border-border bg-[#111622] rounded text-[10px] font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              Clear Filters
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded text-[10px] font-bold hover:opacity-90 active:scale-[0.98] transition cursor-pointer shadow-low"
            >
              Apply Search
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
export { SearchBar };
