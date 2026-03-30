/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Select from "react-select";
import { bangladeshLocations } from "../../utils/bangladeshLocations";

function LocationSelector({ 
  selectedDivision, 
  selectedDistrict, 
  selectedUpazila,
  onDivisionChange,
  onDistrictChange,
  onUpazilaChange,
  className = "",
  showUpazila = true 
}) {
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);

  // Memoize formatOptions to prevent recreation
  const formatOptions = useCallback((items) => {
    return items.map(item => ({
      value: item.value,
      label: item.name,
    }));
  }, []);

  // Get selected option object
  const getSelectedOption = useCallback((value, options) => {
    return options.find(opt => opt.value === value) || null;
  }, []);

  // Initialize divisions once
  useEffect(() => {
    const formattedDivisions = formatOptions(bangladeshLocations.divisions);
    setDivisions(formattedDivisions);
  }, [formatOptions]);

  // Update districts when division changes
  useEffect(() => {
    let isMounted = true;
    
    if (selectedDivision && bangladeshLocations.districts[selectedDivision]) {
      const districtOptions = formatOptions(bangladeshLocations.districts[selectedDivision]);
      if (isMounted) {
        setDistricts(districtOptions);
      }
    } else {
      if (isMounted) {
        setDistricts([]);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [selectedDivision, formatOptions]);

  // Update upazilas when district changes
  useEffect(() => {
    let isMounted = true;
    
    if (selectedDistrict && bangladeshLocations.upazilas[selectedDistrict]) {
      const upazilaOptions = formatOptions(bangladeshLocations.upazilas[selectedDistrict]);
      if (isMounted) {
        setUpazilas(upazilaOptions);
      }
    } else {
      if (isMounted) {
        setUpazilas([]);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [selectedDistrict, formatOptions]);

  // Handle division change
  const handleDivisionChange = useCallback((option) => {
    const newDivision = option?.value || "";
    onDivisionChange(newDivision);
    // Reset district and upazila
    onDistrictChange("");
    onUpazilaChange("");
  }, [onDivisionChange, onDistrictChange, onUpazilaChange]);

  // Handle district change
  const handleDistrictChange = useCallback((option) => {
    const newDistrict = option?.value || "";
    onDistrictChange(newDistrict);
    // Reset upazila
    onUpazilaChange("");
  }, [onDistrictChange, onUpazilaChange]);

  // Handle upazila change
  const handleUpazilaChange = useCallback((option) => {
    onUpazilaChange(option?.value || "");
  }, [onUpazilaChange]);

  // Memoize selected values to prevent unnecessary re-renders
  const selectedDivisionOption = useMemo(() => {
    return getSelectedOption(selectedDivision, divisions);
  }, [selectedDivision, divisions, getSelectedOption]);

  const selectedDistrictOption = useMemo(() => {
    return getSelectedOption(selectedDistrict, districts);
  }, [selectedDistrict, districts, getSelectedOption]);

  const selectedUpazilaOption = useMemo(() => {
    return getSelectedOption(selectedUpazila, upazilas);
  }, [selectedUpazila, upazilas, getSelectedOption]);

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#3B82F6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.2)" : "none",
      borderRadius: "0.5rem",
      padding: "0.125rem 0",
      "&:hover": {
        borderColor: "#3B82F6",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#f3f4f6" : "white",
      color: state.isSelected ? "#3B82F6" : "#374151",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#e5e7eb",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 50,
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Division Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Division *
        </label>
        <Select
          options={divisions}
          value={selectedDivisionOption}
          onChange={handleDivisionChange}
          placeholder="Select Division"
          isClearable
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* District Select - Only show if division selected */}
      {selectedDivision && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            District *
          </label>
          <Select
            options={districts}
            value={selectedDistrictOption}
            onChange={handleDistrictChange}
            placeholder="Select District"
            isClearable
            styles={customStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      )}

      {/* Upazila/Thana Select - Only show if district selected and showUpazila is true */}
      {showUpazila && selectedDistrict && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upazila / Thana *
          </label>
          <Select
            options={upazilas}
            value={selectedUpazilaOption}
            onChange={handleUpazilaChange}
            placeholder="Select Upazila / Thana"
            isClearable
            styles={customStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      )}
    </div>
  );
}

export default LocationSelector;