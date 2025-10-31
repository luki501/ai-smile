import React, { useState, useEffect } from "react";
import { z } from "zod";
import { getSymptomsSchema } from "../lib/symptoms/symptoms.validators";
import { Constants } from "../db/database.types";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type Filters = z.infer<typeof getSymptomsSchema>;

interface SymptomsFilterProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters: Filters;
}

const SymptomsFilter: React.FC<SymptomsFilterProps> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filters);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters, onFilterChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value || undefined };

      if (name === "occurred_at_gte" && value) {
        const date = new Date(value);
        date.setHours(0, 0, 0, 0);
        newFilters.occurred_at_gte = date.toISOString();
      }

      if (name === "occurred_at_lte" && value) {
        const date = new Date(value);
        date.setHours(23, 59, 59, 999);
        newFilters.occurred_at_lte = date.toISOString();
      }

      return newFilters;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value || undefined }));
  };

  const handleReset = () => {
    const defaultFilters = getSymptomsSchema.parse({});
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="p-4 mb-4 bg-gray-50 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="occurred_at_gte">From</Label>
          <Input
            type="date"
            id="occurred_at_gte"
            name="occurred_at_gte"
            value={filters.occurred_at_gte?.split("T")[0] || ""}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="occurred_at_lte">To</Label>
          <Input
            type="date"
            id="occurred_at_lte"
            name="occurred_at_lte"
            value={filters.occurred_at_lte?.split("T")[0] || ""}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="symptom_type">Symptom Type</Label>
          <Select
            name="symptom_type"
            value={filters.symptom_type}
            onValueChange={(value) => handleSelectChange("symptom_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {Constants.public.Enums.symptom_type_enum.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="body_part">Body Part</Label>
          <Select
            name="body_part"
            value={filters.body_part}
            onValueChange={(value) => handleSelectChange("body_part", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select part" />
            </SelectTrigger>
            <SelectContent>
              {Constants.public.Enums.body_part_enum.map((part) => (
                <SelectItem key={part} value={part}>
                  {part}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleReset} variant="outline">
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default SymptomsFilter;
