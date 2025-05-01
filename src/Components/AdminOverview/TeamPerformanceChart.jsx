import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import Api from '../../Api';

const TeamPerformanceChart = ({ isDarkMode, processedTeams }) => {
  const chartRef = useRef(null);
  const [performanceData, setPerformanceData] = useState({
    teams: [],
    revenue: [],
    customers: []
  });

  useEffect(() => {
    if (processedTeams?.length) {
      setPerformanceData({
        teams: processedTeams.map(team => team.name),
        revenue: processedTeams.map(team => team.revenue),
        customers: processedTeams.map(team => team.customerCount)
      });
    }
  }, [processedTeams]);

  useEffect(() => {
    if (chartRef.current && performanceData.teams.length > 0) {
      const chart = echarts.init(chartRef.current);
      const textColor = isDarkMode ? '#e5e7eb' : '#666';
      const axisLineColor = isDarkMode ? '#374151' : '#e5e7eb';
      const splitLineColor = isDarkMode ? '#1f2937' : '#f3f4f6';

      const option = {
        animation: false,
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: isDarkMode ? '#374151' : '#fff',
          borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
          textStyle: { color: textColor },
          formatter: function(params) {
            const revenue = params[0].value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            });
            const customers = params[1].value;
            return `${params[0].name}<br/>
                    Revenue: ${revenue}<br/>
                    Customers: ${customers}`;
          }
        },
        legend: {
          data: ['Revenue', 'Customers'],
          textStyle: { color: textColor }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: performanceData.teams,
          axisLabel: { 
            rotate: 30,
            color: textColor,
            interval: 0
          },
          axisLine: { lineStyle: { color: axisLineColor } }
        }],
        yAxis: [
          {
            type: 'value',
            name: 'Revenue',
            axisLabel: {
              color: textColor,
              formatter: function(value) {
                return value >= 1000000 
                  ? `$${value/1000000}M` 
                  : `$${value/1000}K`;
              }
            },
            axisLine: { lineStyle: { color: axisLineColor } },
            splitLine: { lineStyle: { color: splitLineColor } }
          },
          {
            type: 'value',
            name: 'Customers',
            axisLabel: { color: textColor },
            axisLine: { lineStyle: { color: axisLineColor } },
            splitLine: { show: false }
          }
        ],
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            data: performanceData.revenue,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: isDarkMode ? '#818cf8' : '#6366F1' },
                { offset: 1, color: isDarkMode ? '#4f46e5' : '#4338ca' }
              ])
            },
            barWidth: '30%'
          },
          {
            name: 'Active Customers',
            type: 'line',
            yAxisIndex: 1,
            data: performanceData.customers,
            itemStyle: { color: '#10B981' },
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 3,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: isDarkMode ? '#34d399' : '#10B981' },
                { offset: 1, color: isDarkMode ? '#059669' : '#047857' }
              ])
            }
          }
        ]
      };

      chart.setOption(option);
      
      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose();
      };
    }
  }, [isDarkMode, performanceData]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="relative group">
          <i className="fas fa-info-circle text-gray-400 hover:text-gray-500 cursor-help"></i>
          <div className="absolute z-10 w-72 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            Shows revenue from finalized projects and active customer count by team
          </div>
        </div>
      </div>
      <div ref={chartRef} style={{ height: '400px' }}></div>
    </div>
  );
};

export default TeamPerformanceChart;
