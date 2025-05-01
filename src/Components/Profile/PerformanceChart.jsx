import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Api from '../../Api';

const PerformanceChart = () => {
  const { isDarkMode } = useDarkMode();
  const [chartInstance, setChartInstance] = useState(null);
  const [lastSync, setLastSync] = useState(Date.now());

  useEffect(() => {
    const handleSync = () => setLastSync(Date.now());
    window.addEventListener('customerSync', handleSync);
    return () => window.removeEventListener('customerSync', handleSync);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData?.user?.id) return;

        const userRole = userData.user.role;
        const isSupplementRole = userRole === 'Supplementer' || userRole === 'Supplement Manager';
        const isAffiliateRole = userRole === 'Affiliate';

        // Get all commissions
        const allCommissions = await Api.getAllCommissions();
        
        // Filter commissions for current user and year
        const currentYear = new Date().getFullYear();
        const userCommissions = allCommissions.filter(comm => {
          const buildDate = new Date(comm.build_date);
          return comm.user_id === userData.user.id && 
                 buildDate.getFullYear() === currentYear;
        });

        // Initialize monthly data structure
        const monthlyData = Array(12).fill().map(() => ({
          revenue: 0,
          margin: 0,
          commission: 0,
          customerIds: new Set()
        }));

        // Process commissions and fetch customer data
        for (const commission of userCommissions) {
          const buildDate = new Date(commission.build_date);
          const month = buildDate.getMonth();

          // Add commission amount
          monthlyData[month].commission += Number(commission.commission_amount || 0);
          
          // Skip customer data fetch for affiliate roles
          if (isAffiliateRole) continue;
          
          // Only fetch customer data if we haven't processed this customer yet
          if (!monthlyData[month].customerIds.has(commission.customer_id)) {
            try {
              const customer = await Api.getCustomer(commission.customer_id);
              if (customer) {
                if (isSupplementRole) {
                  // Calculate margin for supplementer roles
                  const margin = Number(customer.total_job_price || 0) - 
                               Number(customer.initial_scope_price || 0);
                  monthlyData[month].margin += margin;
                } else {
                  // Calculate revenue for other roles
                  monthlyData[month].revenue += Number(customer.total_job_price || 0);
                }
                monthlyData[month].customerIds.add(commission.customer_id);
              }
            } catch (err) {
              console.error(`Error fetching customer ${commission.customer_id}:`, err);
            }
          }
        }

        // Set up chart
        const chartDom = document.getElementById('performance-chart');
        if (!chartDom) return;

        const chart = echarts.init(chartDom, isDarkMode ? 'dark' : undefined);
        setChartInstance(chart);

        const option = {
          animation: false,
          tooltip: {
            trigger: 'axis',
            formatter: function(params) {
              let result = `${params[0].name}<br/>`;
              
              if (isAffiliateRole) {
                const commission = params[0].value.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                });
                result += `Commission: ${commission}`;
              } else {
                params.forEach(param => {
                  const value = param.value.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  });
                  result += `${param.seriesName}: ${value}<br/>`;
                });
              }
              return result;
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            axisLabel: {
              color: isDarkMode ? '#9CA3AF' : '#4B5563'
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: value => `$${value.toLocaleString()}`,
              color: isDarkMode ? '#9CA3AF' : '#4B5563'
            }
          },
          series: isAffiliateRole ? [
            {
              name: 'Commission',
              type: 'line',
              data: monthlyData.map(d => d.commission),
              itemStyle: { color: '#10B981' }
            }
          ] : [
            {
              name: isSupplementRole ? 'Margin Added' : 'Revenue',
              type: 'bar',
              data: monthlyData.map(d => isSupplementRole ? d.margin : d.revenue),
              itemStyle: { color: '#3B82F6' }
            },
            {
              name: 'Commission',
              type: 'line',
              data: monthlyData.map(d => d.commission),
              itemStyle: { color: '#10B981' }
            }
          ]
        };

        chart.setOption(option);
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
      }
    };

    fetchData();

    return () => {
      if (chartInstance) {
        chartInstance.dispose();
      }
    };
  }, [isDarkMode, lastSync]);

  // Update the chart theme when isDarkMode changes
  useEffect(() => {
    if (chartInstance) {
      chartInstance.setOption({
        backgroundColor: 'transparent',
        textStyle: {
          color: isDarkMode ? '#9CA3AF' : '#4B5563'
        },
        xAxis: {
          axisLabel: {
            color: isDarkMode ? '#9CA3AF' : '#4B5563'
          }
        },
        yAxis: {
          axisLabel: {
            color: isDarkMode ? '#9CA3AF' : '#4B5563'
          }
        }
      });
    }
  }, [isDarkMode, chartInstance]);

  return (
    <div className={`${isDarkMode ? 'bg-gray-700 bg-opacity-90' : 'bg-white bg-opacity-95'} p-6 rounded-lg shadow backdrop-blur-sm`}>
      <h3 className={`text-lg font-medium mb-4 text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        Performance
      </h3>
      <div id="performance-chart" style={{ height: '400px' }} />
    </div>
  );
};

export default PerformanceChart;