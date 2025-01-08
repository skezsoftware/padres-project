import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { StrikeoutPercentage } from "../pitcher_strikeouts/StrikeoutPercentage";
import { FirstPitchStrikes } from "../pitcher_fps/FirstPitchStrikes";
import { WalkPercentage } from "../pitcher_walks/WalkPercentage";
import { FieldingIndependentPitching } from "../fip/FieldingIndependentPitching";
import { KBBRatio } from "../kbb_ratio/KBBRatio";
import { getTeamColor } from "../../utils/teamColors";
import "./TeamDashboard.css";

export const TeamDashboard = () => {
  const { teamId } = useParams();
  const [activeChart, setActiveChart] = useState("strikeout");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    minPitches: "",
    maxPitches: "",
    minBatters: "",
    maxBatters: "",
    pitcherType: "all",
  });

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--team-color",
      getTeamColor(teamId)
    );
  }, [teamId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePitcherTypeChange = (type) => {
    setFilters((prev) => ({
      ...prev,
      pitcherType: type,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      minPitches: "",
      maxPitches: "",
      minBatters: "",
      maxBatters: "",
      pitcherType: "all",
    });
  };

  const getPitcherTypeForAPI = (type) => {
    switch (type) {
      case "starter":
        return "S";
      case "reliever":
        return "R";
      default:
        return "all";
    }
  };

  const handleDateChange = (date, field) => {
    setFilters(prev => ({
      ...prev,
      [field]: date ? date.toISOString().split('T')[0] : ""
    }));
  };

  const renderChart = () => {
    const apiFilters = {
      ...filters,
      pitcherType: getPitcherTypeForAPI(filters.pitcherType),
    };

    switch (activeChart) {
      case "strikeout":
        return <StrikeoutPercentage teamId={teamId} filters={apiFilters} />;
      case "firstPitch":
        return <FirstPitchStrikes teamId={teamId} filters={apiFilters} />;
      case "walk":
        return <WalkPercentage teamId={teamId} filters={apiFilters} />;
      case "fip":
        return (
          <FieldingIndependentPitching teamId={teamId} filters={apiFilters} />
        );
      case "kbb":
        return <KBBRatio teamId={teamId} filters={apiFilters} />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="team-header">
        <h1>{teamId} Pitching KPI'S</h1>
      </div>

      <div className="main-content">
        <div className="content-area">
          <div className="chart-selection">
            <button
              className={`chart-tab ${
                activeChart === "strikeout" ? "active" : ""
              }`}
              onClick={() => setActiveChart("strikeout")}
            >
              Strikeout %
            </button>
            <button
              className={`chart-tab ${
                activeChart === "firstPitch" ? "active" : ""
              }`}
              onClick={() => setActiveChart("firstPitch")}
            >
              First Pitch Strike %
            </button>
            <button
              className={`chart-tab ${activeChart === "walk" ? "active" : ""}`}
              onClick={() => setActiveChart("walk")}
            >
              Walk %
            </button>
            <button
              className={`chart-tab ${activeChart === "fip" ? "active" : ""}`}
              onClick={() => setActiveChart("fip")}
            >
              FIP
            </button>
            <button
              className={`chart-tab ${activeChart === "kbb" ? "active" : ""}`}
              onClick={() => setActiveChart("kbb")}
            >
              K/BB
            </button>
          </div>

          <div className="chart-container">{renderChart()}</div>
        </div>

        <div className="filters-section">
          <h3>Filters</h3>

          <div className="filter-group">
            <h4>Date Range</h4>
            <DatePicker
              selected={filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null}
              onChange={(date) => handleDateChange(date, 'startDate')}
              dateFormat="MM/dd/yyyy"
              placeholderText="Start Date"
              className="form-control"
              minDate={new Date('2024-07-01T00:00:00')}
              maxDate={new Date('2024-07-31T23:59:59')}
              showMonthYearPicker={false}
              showMonthDropdown={false}
              showYearDropdown={false}
              inline={false}
              fixedHeight
              peekNextMonth={false}
              shouldCloseOnSelect
              defaultValue={new Date('2024-07-01T00:00:00')}
              calendarStartYear={2024}
              calendarEndYear={2024}
              showPreviousMonths={false}
              showNextMonths={false}
              monthsShown={1}
              timeZone="UTC"
              renderCustomHeader={() => (
                <div style={{ margin: 10 }}>
                  <span>July 2024</span>
                </div>
              )}
            />
            <DatePicker
              selected={filters.endDate ? new Date(filters.endDate + 'T00:00:00') : null}
              onChange={(date) => handleDateChange(date, 'endDate')}
              dateFormat="MM/dd/yyyy"
              placeholderText="End Date"
              className="form-control"
              minDate={new Date('2024-07-01T00:00:00')}
              maxDate={new Date('2024-07-31T23:59:59')}
              showMonthYearPicker={false}
              showMonthDropdown={false}
              showYearDropdown={false}
              inline={false}
              fixedHeight
              peekNextMonth={false}
              shouldCloseOnSelect
              defaultValue={new Date('2024-07-01T00:00:00')}
              calendarStartYear={2024}
              calendarEndYear={2024}
              showPreviousMonths={false}
              showNextMonths={false}
              monthsShown={1}
              timeZone="UTC"
              renderCustomHeader={() => (
                <div style={{ margin: 10 }}>
                  <span>July 2024</span>
                </div>
              )}
            />
          </div>

          <div className="filter-group">
            <h4>Pitch Count</h4>
            <input
              type="number"
              name="minPitches"
              value={filters.minPitches}
              onChange={handleFilterChange}
              placeholder="Min Pitches"
            />
            <input
              type="number"
              name="maxPitches"
              value={filters.maxPitches}
              onChange={handleFilterChange}
              placeholder="Max Pitches"
            />
          </div>

          <div className="filter-group">
            <h4>Batters Faced</h4>
            <input
              type="number"
              name="minBatters"
              value={filters.minBatters}
              onChange={handleFilterChange}
              placeholder="Min Batters"
            />
            <input
              type="number"
              name="maxBatters"
              value={filters.maxBatters}
              onChange={handleFilterChange}
              placeholder="Max Batters"
            />
          </div>

          <div className="filter-group">
            <h4>Pitcher Type</h4>
            <div className="button-group">
              <button
                className={filters.pitcherType === "starter" ? "active" : ""}
                onClick={() => handlePitcherTypeChange("starter")}
              >
                Starter
              </button>
              <button
                className={filters.pitcherType === "reliever" ? "active" : ""}
                onClick={() => handlePitcherTypeChange("reliever")}
              >
                Reliever
              </button>
              <button
                className={filters.pitcherType === "all" ? "active" : ""}
                onClick={() => handlePitcherTypeChange("all")}
              >
                All
              </button>
            </div>
          </div>

          <button className="clear-button" onClick={handleClearFilters}>
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};
