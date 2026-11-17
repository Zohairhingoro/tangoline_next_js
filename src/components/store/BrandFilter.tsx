"use client";

import { useState } from "react";

export type BrandFilterOption = {
  filter: string;
  label: React.ReactNode;
  id?: string;
};

export function BrandFilter({
  options,
  initialActive = "all",
  className = "brand-filter-container",
}: {
  options: BrandFilterOption[];
  initialActive?: string;
  className?: string;
}) {
  const [active, setActive] = useState(initialActive);

  const applyFilter = (filter: string) => {
    setActive(filter);
    document.querySelectorAll<HTMLElement>(".product-item-col").forEach((item) => {
      const filters = (item.dataset.brandFilters ?? "").split(/\s+/).filter(Boolean);
      const visible =
        filter === "all" || filters.includes(`brand-${filter}`) || item.id === filter;
      item.style.display = visible ? "" : "none";
    });
  };

  return (
    <div className={className}>
      {options.map((option) => (
        <button
          type="button"
          key={option.filter}
          className={`brand-btn brand-filter-btn ${active === option.filter ? "active" : ""}`}
          data-filter={option.filter}
          id={option.id}
          onClick={() => applyFilter(option.filter)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
