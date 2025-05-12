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
        legend: {
          orient: 'horizontal',
          top: '0%',
          left: 'center',
          width: '100%',
          itemGap: 20,
          textStyle: {
            color: textColor,
            fontSize: 12
          },
          formatter: function(name) {
            const item = leadData.find(d => d.name === name);
            return `${name}: ${item.value}`;
          },
          itemWidth: 12,
          itemHeight: 12,
          grid: {
            left: '10%',
            right: '10%',
            containLabel: true
          },
          // Arrange items in 2 columns
          data: leadData.reduce((acc, item, index) => {
            const column = Math.floor(index / Math.ceil(leadData.length / 2));
            if (!acc[column]) acc[column] = [];
            acc[column].push(item.name);
            return acc;
          }, []).flat()
        },
        series: [{
          name: 'Lead Sources',
          type: 'pie',
          radius: ['25%', '55%'],
          center: ['50%', '60%'], // Moved down to accommodate legend
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: isDarkMode ? '#1f2937' : '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{d}%',
            color: textColor,
            fontSize: 12
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10,
            lineStyle: {
              color: isDarkMode ? '#4b5563' : '#d1d5db'
            }
          },
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

  return (
    <div className="h-[450px] w-full">
      <div ref={chartRef} className="h-full w-full" />
    </div>
  );
};

export default LeadChart;