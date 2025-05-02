import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import TooltipIcon from '../Common/TooltipIcon';

const RevenueChart = ({ isDarkMode, customers, commissionsPaid }) => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    months: [],
    revenue: [],
    commissions: []
  });

  useEffect(() => {
    // Instead of using last 12 months, use current year
    const currentYear = new Date().getFullYear();
    
    // Generate all months for the current year
    const months = [];
    const revenue = Array(12).fill(0);
    const commissions = Array(12).fill(0);

    // Generate January through December
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1);
      months.push(date.toLocaleString('default', { month: 'short' }));
    }

    // Process finalized customers revenue
    const finalizedCustomers = customers.filter(c => c.status === 'Finalized');
    finalizedCustomers.forEach(customer => {
      if (!customer.build_date) return;
      
      const customerDate = new Date(customer.build_date);
      // Only process customers from current year
      if (customerDate.getFullYear() === currentYear) {
        const monthIndex = customerDate.getMonth(); // 0-11 for Jan-Dec
        revenue[monthIndex] += Number(customer.total_job_price || 0);
      }
    });

    // Process commissions by build_date
    commissionsPaid.forEach(commission => {
      if (!commission.build_date) return;
      
      const commissionDate = new Date(commission.build_date);
      // Only process commissions from current year
      if (commissionDate.getFullYear() === currentYear) {
        const monthIndex = commissionDate.getMonth(); // 0-11 for Jan-Dec
        commissions[monthIndex] += Number(commission.commission_amount || 0);
      }
    });

    setChartData({ months, revenue, commissions });
  }, [customers, commissionsPaid]);

  useEffect(() => {
    if (chartRef.current && chartData.months.length > 0) {
      const chart = echarts.init(chartRef.current);
      const textColor = isDarkMode ? '#e5e7eb' : '#666';
      const axisLineColor = isDarkMode ? '#374151' : '#e5e7eb';
      const splitLineColor = isDarkMode ? '#1f2937' : '#f3f4f6';

      const option = {
        animation: false,
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDarkMode ? '#374151' : '#fff',
          borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
          textStyle: { color: textColor }
        },
        legend: {
          data: ['Revenue', 'Commissions'],
          textStyle: { color: textColor }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.months,
          axisLine: { lineStyle: { color: axisLineColor } },
          axisLabel: { color: textColor },
          splitLine: { lineStyle: { color: splitLineColor } }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: axisLineColor } },
          axisLabel: { 
            color: textColor,
            formatter: (value) => {
              return value >= 1000 ? `$${value/1000}K` : `$${value}`;
            }
          },
          splitLine: { lineStyle: { color: splitLineColor } }
        },
        series: [
          {
            name: 'Revenue',
            type: 'line',
            smooth: true,
            symbolSize: 8,
            data: chartData.revenue,
            itemStyle: { color: '#3B82F6' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)' },
                { offset: 1, color: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0)' }
              ])
            }
          },
          {
            name: 'Commissions',
            type: 'line',
            smooth: true,
            symbolSize: 8,
            data: chartData.commissions,
            itemStyle: { color: '#10B981' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: isDarkMode ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.2)' },
                { offset: 1, color: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0)' }
              ])
            }
          }
        ]
      };

      chart.setOption(option);
      window.addEventListener('resize', chart.resize);
      return () => window.removeEventListener('resize', chart.resize);
    }
  }, [isDarkMode, chartData]);

  return (
    <div className="w-full relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Revenue & Commission Trends
        </h3>
        <TooltipIcon content="Shows monthly revenue from finalized projects and paid commissions over the last 12 months" />
      </div>
      <div ref={chartRef} style={{ height: '400px' }}></div>
    </div>
  );
};

export default RevenueChart;
