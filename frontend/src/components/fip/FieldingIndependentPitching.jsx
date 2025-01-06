import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './fieldingIndependentPitching.css';

export const FieldingIndependentPitching = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(20);
  const svgRef = useRef();

  // Fetch data from our API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/pitcher-stats?sort_by=fip&order=asc');
        const result = await response.json();
        if (result.success) {
          setData(result.data.filter(d => d.fip !== null));
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

  // Update the D3 visualization
  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const displayData = data.slice(0, displayCount);

    // Adjust margins to accommodate longer names on the y-axis
    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Swap x and y scales for horizontal orientation
    const y = d3.scaleBand()
      .range([0, height])
      .domain(displayData.map(d => d.name))
      .padding(0.1);

    const x = d3.scaleLinear()
      .domain([0, d3.max(displayData, d => d.fip) * 1.1])
      .range([0, width]);

    // Add y-axis (now showing names)
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.5em')
      .attr('dy', '.35em');

    // Add x-axis at the bottom
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Create horizontal bars
    svg.selectAll('bars')
      .data(displayData)
      .enter()
      .append('rect')
      .attr('y', d => y(d.name))
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', d => x(d.fip))
      .attr('fill', d => d.type === 'Starter' ? '#2F241D' : '#A2AAB0')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', x(d.fip) + 5)
          .attr('y', y(d.name) + y.bandwidth() / 2)
          .attr('dy', '.35em')
          .text(`${d.fip.toFixed(2)} (${d.type})`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        svg.selectAll('.tooltip').remove();
      });

    // Add x-axis label
    svg.append('text')
      .attr('transform', `translate(${width/2},${height + 35})`)
      .style('text-anchor', 'middle')
      .text('FIP');

  }, [data, displayCount]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="fip-chart">
      <h2>Fielding Independent Pitching (FIP)</h2>
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
