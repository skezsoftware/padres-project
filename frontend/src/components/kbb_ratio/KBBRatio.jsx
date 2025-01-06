import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './kbbRatio.css';

export const KbbRatio = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(20);
  const svgRef = useRef();

  // Fetch data from our API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/pitcher-stats?sort_by=k_bb_ratio&order=desc');
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

    d3.select(svgRef.current).selectAll('*').remove();

    const displayData = data.slice(0, displayCount);

    const margin = { top: 20, right: 30, bottom: 100, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(displayData.map(d => d.name))
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(displayData, d => d.k_bb_ratio) * 1.1])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.selectAll('bars')
      .data(displayData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.k_bb_ratio))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.k_bb_ratio))
      .attr('fill', d => d.type === 'S' ? '#2F241D' : '#A2AAB0')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', x(d.name) + x.bandwidth() / 2)
          .attr('y', y(d.k_bb_ratio) - 5)
          .attr('text-anchor', 'middle')
          .text(`${d.k_bb_ratio} (${d.type === 'S' ? 'Starter' : 'Reliever'})`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        svg.selectAll('.tooltip').remove();
      });

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('K/BB Ratio');

  }, [data, displayCount]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="kbb-ratio">
      <h2>K/BB Ratio</h2>
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