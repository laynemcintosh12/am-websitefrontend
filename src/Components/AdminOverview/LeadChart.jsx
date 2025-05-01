import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

const LeadChart = ({ isDarkMode, customers }) => {
  const chartRef = useRef(null);
  const [leadData, setLeadData] = useState([]);
  const [colorMap] = useState(new Map());

  // Dynamic color generator with predefined colors
  const getNextColor = (source) => {
    const colors = isDarkMode ? [
      '#60a5fa', '#4ade80', '#fcd34d', '#f87171', '#a78bfa', 
      '#818cf8', '#fb923c', '#38bdf8', '#2dd4bf', '#facc15',
      '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'
    ] : [
      '#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8B5CF6', 
      '#4A154B', '#F97316', '#0EA5E9', '#14B8A6', '#EAB308',
      '#EC4899', '#6D28D9', '#0891B2', '#059669', '#D97706'
    ];
    
    if (!colorMap.has(source)) {
      colorMap.set(source, colors[colorMap.size % colors.length]);
    }
    return colorMap.get(source);
  };

  useEffect(() => {
    if (customers?.length > 0) {
      // Group and sort lead sources
      const leadSourceMap = customers.reduce((acc, customer) => {
        const source = customer.lead_source || 'Other';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      const sortedData = Object.entries(leadSourceMap)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({
          name,
          value,
          itemStyle: {
            color: getNextColor(name)
          }
        }));

      setLeadData(sortedData);
    }
  }, [customers, isDarkMode]);

  useEffect(() => {
    if (chartRef.current && leadData.length > 0) {
      const chart = echarts.init(chartRef.current);
      const textColor = isDarkMode ? '#e5e7eb' : '#666';
      
      const option = {
        animation: false,
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `${params.name}<br/>Leads: ${params.value} (${params.percent.toFixed(1)}%)`;
          },
          backgroundColor: isDarkMode ? '#374151' : '#fff',
          borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
          textStyle: { color: textColor }
        },
        series: [{
          name: 'Lead Sources',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: isDarkMode ? '#1f2937' : '#fff',
            borderWidth: 2
          },
          label: { show: false },
          labelLine: { show: false },
          emphasis: {
            scale: true,
            scaleSize: 12,
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: leadData
        }]
      };

      chart.setOption(option);
      
      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose();
      };
    }
  }, [isDarkMode, leadData]);

  return <div ref={chartRef} style={{ height: '450px' }}></div>;
};

export default LeadChart;