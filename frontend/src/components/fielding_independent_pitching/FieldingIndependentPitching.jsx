import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./fieldingIndependentPitching.css";

export const FieldingIndependentPitching = ({ teamId, filters }) => {
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
          sort_by: "fip",
          order: "asc",
          min_innings: "0.1", // Minimum innings requirement
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
          // Filter out any records where FIP is undefined, null, or infinite
          const validData = result.data.filter(
            (d) =>
              d.fip !== undefined &&
              d.fip !== null &&
              isFinite(d.fip) &&
              d.innings_pitched > 0
          );
          setData(validData);
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

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 150, left: 200 };
    const width = 1000 - margin.left - margin.right;
    const height = 650 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Color scale (inverted since lower FIP is better)
    const colorScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.fip), d3.max(data, (d) => d.fip)])
      .range(["#0b5394", "#cfe2f3"]); // Dark blue to light blue (inverted)

    // Scales with adjusted x domain for negative values
    const x = d3
      .scaleLinear()
      .domain([
        Math.min(
          0,
          d3.min(data, (d) => d.fip)
        ),
        d3.max(data, (d) => d.fip),
      ])
      .range([0, width]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, height])
      .padding(0.1);

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .style("font-size", "18px")
      .style("font-weight", "500")
      .style("font-family", "Arial");

    // Y axis
    svg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "18px")
      .style("font-weight", "500")
      .style("font-family", "Arial")
      .style("text-anchor", "end");

    // Background colors for above/below MLB average
    const mlbAverage = 4.08;

    // Background rectangle for below average (light red) - right side
    svg
      .append("rect")
      .attr("x", x(mlbAverage))
      .attr("y", 0)
      .attr("width", width - x(mlbAverage))
      .attr("height", height)
      .attr("fill", "#ffebeb") // Very light red
      .attr("opacity", 0.4);

    // Background rectangle for above average (light green) - left side
    svg
      .append("rect")
      .attr(
        "x",
        x(
          Math.min(
            0,
            d3.min(data, (d) => d.fip)
          )
        )
      ) // Start from minimum FIP value
      .attr("y", 0)
      .attr(
        "width",
        x(mlbAverage) -
          x(
            Math.min(
              0,
              d3.min(data, (d) => d.fip)
            )
          )
      )
      .attr("height", height)
      .attr("fill", "#ebffeb") // Very light green
      .attr("opacity", 0.4);

    // Bars
    svg
      .selectAll("rect.bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => y(d.name))
      .attr("x", (d) => x(Math.min(0, d.fip)))
      .attr("width", (d) => Math.abs(x(d.fip) - x(0)))
      .attr("height", y.bandwidth())
      .style("fill", (d) => colorScale(d.fip))
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.8);

        // Calculate position to ensure visibility
        const boxHeight = 70;
        const boxWidth = 200;
        const xPosition = x(d.fip) + 10;
        const yPosition = y(d.name);

        // Adjust xPosition if too close to right edge
        const adjustedXPosition =
          xPosition + boxWidth > width
            ? xPosition - boxWidth - 20 // Move box to left side of bar
            : xPosition; // Keep on right side

        // Background rectangle
        svg
          .append("rect")
          .attr("class", "text-background")
          .attr("x", adjustedXPosition)
          .attr("y", yPosition + y.bandwidth() / 2 - boxHeight / 2)
          .attr("width", boxWidth)
          .attr("height", boxHeight)
          .attr("fill", "white")
          .attr("opacity", 0.95)
          .attr("rx", 5)
          .style("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))");

        // Highlighted name
        svg
          .append("text")
          .attr("class", "highlight-name")
          .attr("x", adjustedXPosition + boxWidth / 2)
          .attr("y", yPosition + y.bandwidth() / 2 - 10)
          .attr("text-anchor", "middle")
          .style("font-size", "20px")
          .style("font-weight", "bold")
          .text(d.name);

        // FIP and type
        svg
          .append("text")
          .attr("class", "value-label")
          .attr("x", adjustedXPosition + boxWidth / 2)
          .attr("y", yPosition + y.bandwidth() / 2 + 15)
          .attr("text-anchor", "middle")
          .style("font-size", "18px")
          .style("font-weight", "bold")
          .text(`${d.fip.toFixed(2)} (${d.type})`);
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
      .attr("x1", x(mlbAverage))
      .attr("x2", x(mlbAverage))
      .attr("y1", 0)
      .attr("y2", height)
      .style("stroke", "#000000")
      .style("stroke-width", 3)
      .style("stroke-dasharray", "10,10");

    // MLB average label
    svg
      .append("text")
      .attr("x", x(mlbAverage))
      .attr("y", -10) // Position above the graph
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "500")
      .style("font-family", "Arial")
      .text("MLB Average (4.08)");
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      className="fip-chart"
      style={{ textAlign: "center" }}
    >
      <h2>Fielding Independent Pitching (FIP)</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};
