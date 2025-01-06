import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './kbbPercentage.css';

export const KBBPercentage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(20);
  const svgRef = useRef();

  // Fetch data from our API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/pitcher-stats?sort_by=k_minus_bb&order=desc');
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create the D3 visualization
  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    // Get top N pitchers
    const displayData = data.slice(0, displayCount);

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 100, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
      .range([0, width])
      .domain(displayData.map(d => d.name))
      .padding(0.2);

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([
        Math.min(0, d3.min(displayData, d => d.k_minus_bb)),  // Include negative values
        Math.max(50, d3.max(displayData, d => d.k_minus_bb))
      ]);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em')
      .style('font-size', '12px');

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(10).tickFormat(d => `${d}%`));

    // Add a zero line
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(0))
      .attr('y2', y(0))
      .attr('stroke', '#666')
      .attr('stroke-dasharray', '4')
      .attr('stroke-width', 1);

    // Add bars
    svg.selectAll('rect')
      .data(displayData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.name))
      .attr('y', d => d.k_minus_bb >= 0 ? y(d.k_minus_bb) : y(0))
      .attr('width', x.bandwidth())
      .attr('height', d => Math.abs(y(d.k_minus_bb) - y(0)))
      .attr('fill', d => {
        // Color based on value and pitcher type
        if (d.type === 'S') {
          return d.k_minus_bb >= 0 ? '#4CAF50' : '#f44336';  // Green for positive, Red for negative
        } else {
          return d.k_minus_bb >= 0 ? '#81C784' : '#E57373';  // Lighter shades for relievers
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        
        // Add tooltip
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', x(d.name) + x.bandwidth() / 2)
          .attr('y', y(Math.max(0, d.k_minus_bb)) - 5)
          .attr('text-anchor', 'middle')
          .text(`${d.k_minus_bb}% (${d.type === 'S' ? 'Starter' : 'Reliever'})`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        svg.selectAll('.tooltip').remove();
      });

    // Add labels
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('K-BB%');

  }, [data, displayCount]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="kbb-percentage">
      <h2>K-BB%</h2>
      <div className="controls">
        <label>
          Show top:
          <select 
            value={displayCount} 
            onChange={(e) => setDisplayCount(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};