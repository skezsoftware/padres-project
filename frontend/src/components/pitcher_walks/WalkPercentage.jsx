import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './walkPercentage.css';

export const WalkPercentage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(20);
  const svgRef = useRef();

  // Fetch data from our API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/pitcher-stats?sort_by=walk_pct&order=asc');  // Note: asc to show lowest walk% first
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
      .domain([0, Math.max(100, d3.max(displayData, d => d.walk_pct))]);

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

    // Add bars
    svg.selectAll('rect')
      .data(displayData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.walk_pct))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.walk_pct))
      .attr('fill', d => d.type === 'S' ? '#9C27B0' : '#E91E63')  // Different colors from other charts
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        
        // Add tooltip
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', x(d.name) + x.bandwidth() / 2)
          .attr('y', y(d.walk_pct) - 5)
          .attr('text-anchor', 'middle')
          .text(`${d.walk_pct}% (${d.type === 'S' ? 'Starter' : 'Reliever'})`);
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
      .text('Walk Percentage');

  }, [data, displayCount]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="walk-percentage">
      <h2>Pitcher Walk Percentages</h2>
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