import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export const ScatterPlot = ({
  data,
  pitchType,
  usage,
  avgVelo,
  avgSpin,
  isHighest,
  color,
}) => {
  console.log("ScatterPlot props:", {
    data,
    pitchType,
    usage,
    avgVelo,
    avgSpin,
  });

  const svgRef = useRef();
  const width = 250;
  const height = 320;
  const margin = { top: 15, right: 15, bottom: 50, left: 30 };

  useEffect(() => {
    if (!data) return;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("style", "display: block; margin: auto;");

    // Clear previous content
    svg.selectAll("*").remove();

    const xScale = d3
      .scaleLinear()
      .domain([2, -2])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([-1.5, 5])
      .range([height - margin.bottom, margin.top]);

    // Density heatmap
    const densityData = d3
      .contourDensity()
      .x((d) => xScale(d.plate_x))
      .y((d) => yScale(d.plate_z))
      .size([width, height])
      .bandwidth(15)(data);

    // Heatmap
    svg
      .append("g")
      .selectAll("path")
      .data(densityData)
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("fill", "rgba(0, 0, 255, 0.05)");

    // Strike zone
    svg
      .append("rect")
      .attr("x", xScale(0.851))
      .attr("y", yScale(3.5))
      .attr("width", xScale(-0.851) - xScale(0.851))
      .attr("height", yScale(1.5) - yScale(3.5))
      .attr("stroke", "black")
      .attr("fill", "none");

    // Home plate
    const homeplatePath = d3.path();
    homeplatePath.moveTo(xScale(0), yScale(-0.4)); // Bottom point
    homeplatePath.lineTo(xScale(0.708), yScale(0)); // Right diagonal
    homeplatePath.lineTo(xScale(0.708), yScale(0.4)); // Right vertical
    homeplatePath.lineTo(xScale(-0.708), yScale(0.4)); // Top horizontal
    homeplatePath.lineTo(xScale(-0.708), yScale(0)); // Left vertical
    homeplatePath.closePath(); // Back to bottom point

    svg
      .append("path")
      .attr("d", homeplatePath)
      .attr("stroke", "black")
      .attr("fill", "#e0e0e0")
      .attr("opacity", 0.5);

    // Scatter points
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.plate_x))
      .attr("cy", (d) => yScale(d.plate_z))
      .attr("r", 3)
      .attr("fill", "rgba(255, 0, 0, 0.5)");
  }, [data, pitchType, usage, avgVelo, avgSpin]);

  return (
    <div className={`scatter-plot-container ${isHighest ? "highest" : ""}`}>
      <div className="pitch-info">
        <h3 className="pitch-percentage" style={{ color: color }}>
          {pitchType} ({usage}%)
        </h3>
        <p className="pitch-stats">Average Velocity: {avgVelo} mph</p>
        <p className="pitch-stats">Average Spin Rate: {avgSpin} rpm</p>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};
