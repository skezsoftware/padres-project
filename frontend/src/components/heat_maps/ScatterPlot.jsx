import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export const ScatterPlot = ({ data, pitchType, usage, avgVelo, avgSpin }) => {
  console.log("ScatterPlot props:", { data, pitchType, usage, avgVelo, avgSpin });

  const svgRef = useRef()
  const width = 300
  const height = 300
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }

  useEffect(() => {
    if (!data) return

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('style', 'display: block; margin: auto;')

    // Clear previous content
    svg.selectAll('*').remove()

    const xScale = d3.scaleLinear()
      .domain([2, -2])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain([0, 5])
      .range([height - margin.bottom, margin.top])

    // Create a density heatmap
    const densityData = d3.contourDensity()
      .x(d => xScale(d.plate_x))
      .y(d => yScale(d.plate_z))
      .size([width, height])
      .bandwidth(15)
      (data);

    // Add heatmap
    svg.append('g')
      .selectAll('path')
      .data(densityData)
      .enter()
      .append('path')
      .attr('d', d3.geoPath())
      .attr('fill', 'rgba(0, 0, 255, 0.05)');

    // Draw strike zone
    svg.append('rect')
      .attr('x', xScale(0.83))
      .attr('y', yScale(3.5))
      .attr('width', xScale(-0.83) - xScale(0.83))
      .attr('height', yScale(1.5) - yScale(3.5))
      .attr('stroke', 'black')
      .attr('fill', 'none');

    // Add scatter points
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.plate_x))
      .attr('cy', d => yScale(d.plate_z))
      .attr('r', 3)
      .attr('fill', 'rgba(255, 0, 0, 0.5)');

  }, [data, pitchType, usage, avgVelo, avgSpin])

  return (
    <div className="scatter-plot-container">
      <div className="pitch-info">
        <h3 className="pitch-type">{pitchType} ({usage}%)</h3>
        <p className="pitch-stats">{avgVelo} mph | {avgSpin} rpm</p>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
}
