import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api';

const EarningsChart = ({ userData }) => {
  const { isDarkMode } = useDarkMode();
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const allCommissions = await Api.getAllCommissions();
        const userId = userData?.id;

        if (!userId || !allCommissions) return;

        // Filter commissions for the current user
        const userCommissions = allCommissions.filter(commission => 
          commission.user_id === userId
        );

        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        const currentYear = new Date().getFullYear();

        // Group commissions by month for current year
        const monthlyEarnings = Array(12).fill(0);
        userCommissions.forEach(commission => {
          const date = new Date(commission.build_date);
          if (date.getFullYear() === currentYear) {
            monthlyEarnings[date.getMonth()] += Number(commission.commission_amount || 0);
          }
        });

        // Create and configure chart
        const chartDom = document.getElementById('earnings-chart');
        if (!chartDom) return;

        const myChart = echarts.init(chartDom);
        setChartInstance(myChart);

        const option = {
          tooltip: {
            trigger: 'axis',
            formatter: function(params) {
              const value = params[0].value.toFixed(2);
              return `${params[0].name}<br/>
                      <i class="fas fa-dollar-sign"></i> ${value.toLocaleString('en-US')}`;
            }
          },
          xAxis: {
            type: 'category',
            data: months,
            axisLabel: {
              color: isDarkMode ? '#9CA3AF' : '#4B5563',
              interval: window.innerWidth < 640 ? 2 : 0,
              rotate: window.innerWidth < 640 ? 45 : 0,
              fontSize: window.innerWidth < 640 ? 10 : 12
            },
            axisLine: {
              lineStyle: {
                color: isDarkMode ? '#4B5563' : '#E5E7EB'
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              color: isDarkMode ? '#9CA3AF' : '#4B5563',
              formatter: (value) => `$${value.toLocaleString('en-US')}`,
              fontSize: window.innerWidth < 640 ? 10 : 12
            },
            splitLine: {
              lineStyle: {
                color: isDarkMode ? '#374151' : '#E5E7EB'
              }
            }
          },
          series: [{
            name: 'Monthly Earnings',
            data: monthlyEarnings,
            type: 'line',
            smooth: true,
            symbolSize: 8,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)'
              }, {
                offset: 1,
                color: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
              }])
            },
            itemStyle: {
              color: '#3B82F6'
            }
          }]
        };

        myChart.setOption(option);

        // Handle resize
        const handleResize = () => {
          myChart.resize();
        };

        window.addEventListener('resize', handleResize);
        return () => {
          myChart.dispose();
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error('Error fetching commission data:', error);
      }
    };

    fetchCommissions();
  }, [userData, isDarkMode]);

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-lg shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Earnings Overview
        </h3>
        <div className="relative group">
          <i className="fas fa-info-circle text-gray-400 hover:text-gray-500 cursor-help"></i>
          <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 right-0">
            Shows your commission earnings from finalized customers by month for the current year
          </div>
        </div>
      </div>
      <div id="earnings-chart" className="w-full" style={{ height: '300px' }}></div>
    </div>
  );
};

export default EarningsChart;