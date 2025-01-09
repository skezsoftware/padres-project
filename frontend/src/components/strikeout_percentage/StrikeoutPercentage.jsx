import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./strikeoutPercentage.css";

export const StrikeoutPercentage = ({ teamId, filters }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const svgRef = useRef();

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams({
          team: teamId,
          sort_by: "strikeout_pct",
          order: "desc",
          ...(filters?.startDate && { start_date: filters.startDate }),
          ...(filters?.endDate && { end_date: filters.endDate }),
          ...(filters?.minPitches && { min_pitches: filters.minPitches }),
          ...(filters?.maxPitches && { max_pitches: filters.maxPitches }),
          ...(filters?.minBatters && { min_batters: filters.minBatters }),
          ...(filters?.maxBatters && { max_batters: filters.maxBatters }),
          ...(filters?.pitcherType !== "all" && {
            pitcher_type: filters.pitcherType,
          }),
        });

        const response = await fetch(
          `http://localhost:8000/api/v1/pitcher-stats?${queryParams}`
        );
        const result = await response.json();
        if (result.success) {
          setData(result.data.slice(0, 20)); // Default to top 20
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId, filters]);

  // D3 visualization
  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 140, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.name))
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        0,
        Math.min(100, Math.ceil(d3.max(data, (d) => d.strikeout_pct) * 1.1)),
      ]);

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.2em")
      .style("font-size", "18px")
      .style("font-weight", "500")
      .style("font-family", "Arial");

    // Y axis
    svg
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(10)
          .tickFormat((d) => `${d}%`)
      )
      .selectAll("text")
      .style("font-size", "18px")
      .style("font-weight", "500")
      .style("font-family", "Arial");

    // Color gradient
    const colorScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.strikeout_pct),
        d3.max(data, (d) => d.strikeout_pct),
      ])
      .range(["#cfe2f3", "#0b5394"]);

    // Background colors
    const mlbAverage = 22.6;

    // Background rectangle for below average
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", y(mlbAverage))
      .attr("width", width)
      .attr("height", height - y(mlbAverage))
      .attr("fill", "#ffebeb") // Very light red
      .attr("opacity", 0.4);

    // Background rectangle for above average
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", y(mlbAverage))
      .attr("fill", "#ebffeb") // Very light green
      .attr("opacity", 0.4);

    // Bars
    svg
      .selectAll("rect.bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.name))
      .attr("y", (d) => y(d.strikeout_pct))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.strikeout_pct))
      .style("fill", (d) => colorScale(d.strikeout_pct))
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.8);

        // Calculate position
        const boxHeight = 60;
        const boxWidth = 180; // Increased width
        const yPosition = Math.max(y(d.strikeout_pct) - 70, 10); // Ensure minimum distance from top

        // Background rectangle for text
        svg
          .append("rect")
          .attr("class", "text-background")
          .attr("x", x(d.name) + x.bandwidth() / 2 - boxWidth / 2)
          .attr("y", yPosition)
          .attr("width", boxWidth)
          .attr("height", boxHeight)
          .attr("fill", "white")
          .attr("opacity", 0.95) // Slightly more opaque
          .attr("rx", 5)
          .style("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))");

        // Highlighted name
        svg
          .append("text")
          .attr("class", "highlight-name")
          .attr("x", x(d.name) + x.bandwidth() / 2)
          .attr("y", yPosition + 25) // Adjusted positioning
          .attr("text-anchor", "middle")
          .style("font-size", "18px")
          .style("font-weight", "bold")
          .text(d.name);

        // Percentage and type
        svg
          .append("text")
          .attr("class", "value-label")
          .attr("x", x(d.name) + x.bandwidth() / 2)
          .attr("y", yPosition + 45) // Adjusted positioning
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("font-weight", "bold")
          .text(`${d.strikeout_pct.toFixed(1)}% (${d.type})`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1);
        svg.selectAll(".value-label").remove();
        svg.selectAll(".highlight-name").remove();
        svg.selectAll(".text-background").remove();
      });

    // MLB average line
    svg
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(mlbAverage))
      .attr("y2", y(mlbAverage))
      .style("stroke", "#000000")
      .style("stroke-width", 3)
      .style("stroke-dasharray", "10,10");

    // MLB average label
    svg
      .append("text")
      .attr("x", width)
      .attr("y", y(mlbAverage) - 5)
      .attr("text-anchor", "end")
      .style("font-size", "16px")
      .style("font-weight", "500")
      .style("font-family", "Arial")
      .text("MLB Average (22.6%)");
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="strikeout-percentage">
      <h2>Strikeout Percentage (K%)</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};
