import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './kbbRatio.css';

export const KBBRatio = ({ teamId, filters }) => {
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
          sort_by: 'k_bb_ratio',
          order: 'desc',
          ...(filters?.startDate && { start_date: filters.startDate }),
          ...(filters?.endDate && { end_date: filters.endDate }),
          ...(filters?.minPitches && { min_pitches: filters.minPitches }),
          ...(filters?.maxPitches && { max_pitches: filters.maxPitches }),
          ...(filters?.minBatters && { min_batters: filters.minBatters }),
          ...(filters?.maxBatters && { max_batters: filters.maxBatters }),
          ...(filters?.pitcherType !== 'all' && { pitcher_type: filters.pitcherType })
        });

        const response = await fetch(`http://localhost:8000/api/v1/pitcher-stats?${queryParams}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data.slice(0, 20)); // Default to top 20
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
  }, [teamId, filters]);

  // Create the D3 visualization
  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 190, left: 70 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create color scale (higher K/BB ratio is better)
    const colorScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.k_bb_ratio), d3.max(data, d => d.k_bb_ratio)])
      .range(['#cfe2f3', '#0b5394']); // Light blue to dark blue

    // Create scales
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.name))
      .padding(0.2);

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d.k_bb_ratio)]);

    // First create the background colors (should be first, behind everything)
    const mlbAverage = 2.76;
    
    // Add background rectangle for below average (light red)
    svg.append('rect')
      .attr('x', 0)
      .attr('y', y(mlbAverage))
      .attr('width', width)
      .attr('height', height - y(mlbAverage))
      .attr('fill', '#ffebeb')  // Very light red
      .attr('opacity', 0.4);

    // Add background rectangle for above average (light green)
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', y(mlbAverage))
      .attr('fill', '#ebffeb')  // Very light green
      .attr('opacity', 0.4);

    // Then add the axes (on top of background, behind bars)
    // Add X axis with improved styling
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .style('font-size', '18px')
      .style('font-weight', '500')
      .style('font-family', 'Arial');

    // Add Y axis with improved styling
    svg.append('g')
      .call(d3.axisLeft(y)
        .ticks(10))
      .selectAll('text')
      .style('font-size', '18px')
      .style('font-weight', '500')
      .style('font-family', 'Arial');

    // Then add the bars (on top of background and axes)
    svg.selectAll('rect.bar')  // Added class 'bar' to differentiate from background rects
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.k_bb_ratio))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.k_bb_ratio))
      .style('fill', d => colorScale(d.k_bb_ratio))
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 0.8);
        
        // Calculate position to ensure visibility
        const boxHeight = 70;
        const boxWidth = 200;
        const xPosition = x(d.name) + x.bandwidth() / 2;
        
        // Adjust xPosition if too close to right edge
        const adjustedXPosition = xPosition + boxWidth/2 > width ? 
          xPosition - boxWidth - 20 : // Move box to left side of bar
          xPosition - boxWidth/2;     // Center on bar
        
        // Add background rectangle
        svg.append('rect')
          .attr('class', 'text-background')
          .attr('x', adjustedXPosition)
          .attr('y', Math.max(y(d.k_bb_ratio) - 70, 10))
          .attr('width', boxWidth)
          .attr('height', boxHeight)
          .attr('fill', 'white')
          .attr('opacity', 0.95)
          .attr('rx', 5)
          .style('filter', 'drop-shadow(0px 2px 3px rgba(0,0,0,0.2))');

        // Add highlighted name
        svg.append('text')
          .attr('class', 'highlight-name')
          .attr('x', adjustedXPosition + boxWidth/2)
          .attr('y', Math.max(y(d.k_bb_ratio) - 45, 35))
          .attr('text-anchor', 'middle')
          .style('font-size', '20px')
          .style('font-weight', 'bold')
          .text(d.name);

        // Add ratio and type
        svg.append('text')
          .attr('class', 'value-label')
          .attr('x', adjustedXPosition + boxWidth/2)
          .attr('y', Math.max(y(d.k_bb_ratio) - 20, 60))
          .attr('text-anchor', 'middle')
          .style('font-size', '18px')
          .style('font-weight', 'bold')
          .text(`${d.k_bb_ratio.toFixed(2)} (${d.type})`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 1);
        svg.selectAll('.value-label').remove();
        svg.selectAll('.highlight-name').remove();
        svg.selectAll('.text-background').remove();
      });

    // Finally add the MLB average line (on top of everything)
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(mlbAverage))
      .attr('y2', y(mlbAverage))
      .style('stroke', '#000000')
      .style('stroke-width', 3)
      .style('stroke-dasharray', '10,10');

    // Add MLB average label
    svg.append('text')
      .attr('x', width)
      .attr('y', y(mlbAverage) - 5)
      .attr('text-anchor', 'end')
      .style('font-size', '16px')
      .style('font-weight', '500')
      .style('font-family', 'Arial')
      .text('MLB Average (2.76)');

  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="kbb-ratio" style={{ textAlign: 'center' }}>
      <h2>Strikeout to Walk Ratio (K/BB)</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};