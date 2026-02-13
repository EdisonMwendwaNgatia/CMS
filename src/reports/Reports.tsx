/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { fetchReportData, exportToExcel, exportToPDF } from './reportService';
import type { ReportType, ReportFilters, DateRange, ReportData } from './reportTypes';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('members');
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'month',
    status: 'all',
    entityType: 'all',
    ministry: 'all',
    family: 'all',
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const containerStyle = {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const headerStyle = {
    marginBottom: '30px',
  };

  const titleStyle = {
    color: '#2c3e50',
    fontSize: '2rem',
    margin: '0 0 10px 0',
    fontWeight: '600',
  };

  const subtitleStyle = {
    color: '#7f8c8d',
    fontSize: '1rem',
    margin: 0,
  };

  const controlsCardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  };

  const controlsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  };

  const controlGroupStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  };

  const labelStyle = {
    fontWeight: '600',
    color: '#4b5563',
    fontSize: '0.9rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  };

  const selectStyle = {
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s',
    outline: 'none',
  };

  const inputStyle = {
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.3s',
    outline: 'none',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap' as const,
  };

  const generateButtonStyle = {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '14px 30px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const exportButtonStyle = {
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const exportPdfButtonStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const summaryCardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  };

  const summaryGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  };

  const summaryItemStyle = {
    textAlign: 'center' as const,
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  };

  const summaryValueStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#3498db',
    marginBottom: '5px',
  };

  const summaryLabelStyle = {
    color: '#7f8c8d',
    fontSize: '0.9rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  };

  const tableContainerStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    overflowX: 'auto' as const,
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
  };

  const tableHeaderStyle = {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    textAlign: 'left' as const,
    color: '#2c3e50',
    fontWeight: '600',
    borderBottom: '2px solid #e5e7eb',
  };

  const tableCellStyle = {
    padding: '12px 15px',
    borderBottom: '1px solid #e5e7eb',
    color: '#34495e',
  };

  const errorStyle = {
    backgroundColor: '#fee',
    color: '#e74c3c',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderLeft: '4px solid #e74c3c',
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchReportData(selectedReport, filters);
      setReportData(data);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!reportData) return;
    
    const filename = `${reportData.type}_report_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(reportData, filename);
  };

  const handleExportPDF = () => {
    if (!reportData) return;
    
    const filename = `${reportData.type}_report_${new Date().toISOString().split('T')[0]}`;
    exportToPDF(reportData, filename);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setFilters({ ...filters, dateRange: range });
    
    if (range !== 'custom') {
      const today = new Date();
      let startDate = new Date();
      
      switch (range) {
        case 'today':
          startDate = today;
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(today.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(today.getFullYear() - 1);
          break;
      }
      
      setFilters({
        ...filters,
        dateRange: range,
        startDate: startDate.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      });
    }
  };

  const renderSummaryStats = () => {
    if (!reportData) return null;

    const summary = reportData.summary;
    
    return (
      <div style={summaryGridStyle}>
        <div style={summaryItemStyle}>
          <div style={summaryValueStyle}>{summary.totalRecords}</div>
          <div style={summaryLabelStyle}>Total Records</div>
        </div>
        
        {summary.activeRecords !== undefined && (
          <div style={summaryItemStyle}>
            <div style={{ ...summaryValueStyle, color: '#2ecc71' }}>{summary.activeRecords}</div>
            <div style={summaryLabelStyle}>Active</div>
          </div>
        )}
        
        {summary.newRecords !== undefined && (
          <div style={summaryItemStyle}>
            <div style={{ ...summaryValueStyle, color: '#f39c12' }}>{summary.newRecords}</div>
            <div style={summaryLabelStyle}>New</div>
          </div>
        )}
        
        {summary.attendanceRate !== undefined && (
          <div style={summaryItemStyle}>
            <div style={{ ...summaryValueStyle, color: '#9b59b6' }}>{summary.attendanceRate}%</div>
            <div style={summaryLabelStyle}>Attendance Rate</div>
          </div>
        )}
        
        {summary.averageAge !== undefined && (
          <div style={summaryItemStyle}>
            <div style={summaryValueStyle}>{summary.averageAge}</div>
            <div style={summaryLabelStyle}>Average Age</div>
          </div>
        )}
        
        {summary.genderBreakdown && (
          <div style={summaryItemStyle}>
            <div style={summaryValueStyle}>
              {summary.genderBreakdown.male}/{summary.genderBreakdown.female}
            </div>
            <div style={summaryLabelStyle}>M/F Ratio</div>
          </div>
        )}
      </div>
    );
  };

  const renderEntityBreakdown = () => {
    if (!reportData?.summary.entityBreakdown || reportData.type !== 'attendance') return null;

    return (
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Attendance by Type</h4>
        <div style={summaryGridStyle}>
          {Object.entries(reportData.summary.entityBreakdown).map(([type, data]: [string, any]) => (
            <div key={type} style={summaryItemStyle}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#3498db', marginBottom: '5px' }}>
                {type}
              </div>
              <div style={{ fontSize: '1rem', color: '#2c3e50' }}>
                {data.attended}/{data.members}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: data.rate >= 70 ? '#2ecc71' : data.rate >= 50 ? '#f39c12' : '#e74c3c' }}>
                {data.rate}%
              </div>
              <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                {data.count} events
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDataTable = () => {
    if (!reportData || reportData.data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
          No data available for the selected filters.
        </div>
      );
    }

    const columns = getTableColumns(reportData.type);
    const rows = formatTableRows(reportData.data, reportData.type);

    return (
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} style={tableHeaderStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell: any, cellIndex: number) => (
                  <td key={cellIndex} style={tableCellStyle}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getTableColumns = (type: ReportType): string[] => {
    const baseColumns = ['#'];
    
    switch (type) {
      case 'members':
        return [...baseColumns, 'Membership No.', 'Full Name', 'Gender', 'Email', 'Phone', 'Status', 'Marital Status', 'Occupation'];
      case 'visitors':
        return [...baseColumns, 'Full Name', 'Gender', 'Email', 'Phone', 'Status', 'Baptized'];
      case 'families':
        return [...baseColumns, 'Family Name', 'Address', 'Members Count'];
      case 'attendance':
        return [...baseColumns, 'Date', 'Entity', 'Type', 'Present', 'Total', 'Rate'];
      case 'ministries':
        return [...baseColumns, 'Ministry Name', 'Leader', 'Meeting', 'Location', 'Members'];
      default:
        return baseColumns;
    }
  };

  const formatTableRows = (data: any[], type: ReportType): any[][] => {
    return data.map((item, index) => {
      const row = [index + 1];
      
      switch (type) {
        case 'members':
          return [
            ...row,
            item.membershipNumber || 'N/A',
            item.fullName,
            item.gender,
            item.email,
            item.phone,
            item.status,
            item.maritalStatus || 'N/A',
            item.occupation || 'N/A',
          ];
        case 'visitors':
          return [
            ...row,
            item.fullName,
            item.gender,
            item.email,
            item.phone,
            item.status,
            item.baptism?.date ? 'Yes' : 'No',
          ];
        case 'families':
          return [
            ...row,
            item.familyName,
            item.address || 'N/A',
            item.members?.length || 0,
          ];
        case 'attendance':
          return [
            ...row,
            new Date(item.meetingDate).toLocaleDateString(),
            item.entityName,
            item.entityType,
            item.totalAttended || 0,
            item.totalMembers || 0,
            item.attendanceRate ? `${item.attendanceRate}%` : '0%',
          ];
        case 'ministries':
          return [
            ...row,
            item.name,
            item.leaderName,
            `${item.meetingDay || ''} ${item.meetingTime || ''}`.trim() || 'Not scheduled',
            item.meetingLocation || 'N/A',
            item.memberCount || 0,
          ];
        default:
          return row;
      }
    });
  };

  return (
    <div style={containerStyle}>
      <style>{keyframes}</style>
      
      <div style={headerStyle}>
        <h1 style={titleStyle}>Reports</h1>
        <p style={subtitleStyle}>Generate and export comprehensive church reports</p>
      </div>

      {/* Controls Card */}
      <div style={controlsCardStyle}>
        <div style={controlsGridStyle}>
          <div style={controlGroupStyle}>
            <label style={labelStyle}>Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as ReportType)}
              style={selectStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3498db'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            >
              <option value="members">Members Report</option>
              <option value="visitors">Visitors Report</option>
              <option value="families">Families Report</option>
              <option value="attendance">Attendance Report</option>
              <option value="ministries">Ministries Report</option>
            </select>
          </div>

          <div style={controlGroupStyle}>
            <label style={labelStyle}>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value as DateRange)}
              style={selectStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3498db'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {filters.dateRange === 'custom' && (
            <>
              <div style={controlGroupStyle}>
                <label style={labelStyle}>Start Date</label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => {
                    setCustomDateRange({ ...customDateRange, startDate: e.target.value });
                    setFilters({ ...filters, startDate: e.target.value });
                  }}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3498db'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div style={controlGroupStyle}>
                <label style={labelStyle}>End Date</label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => {
                    setCustomDateRange({ ...customDateRange, endDate: e.target.value });
                    setFilters({ ...filters, endDate: e.target.value });
                  }}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3498db'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
            </>
          )}

          {selectedReport === 'members' && (
            <div style={controlGroupStyle}>
              <label style={labelStyle}>Member Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={selectStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3498db'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <option value="all">All Statuses</option>
                <option value="full_member">Full Member</option>
                <option value="new_member">New Member</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}

          {selectedReport === 'attendance' && (
            <div style={controlGroupStyle}>
              <label style={labelStyle}>Entity Type</label>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                style={selectStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3498db'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <option value="all">All Types</option>
                <option value="ministry">Ministries</option>
                <option value="service">Services</option>
                <option value="cell_group">Cell Groups</option>
              </select>
            </div>
          )}
        </div>

        <div style={buttonGroupStyle}>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            style={{
              ...generateButtonStyle,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#2980b9';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#3498db';
            }}
          >
            {loading ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}></span>
                Generating...
              </>
            ) : (
              <>
                <span>📊</span>
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={errorStyle}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Report Results */}
      {reportData && (
        <>
          {/* Export Buttons */}
          <div style={{ ...buttonGroupStyle, marginBottom: '20px' }}>
            <button
              onClick={handleExportExcel}
              style={exportButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2ecc71'}
            >
              <span>📊</span>
              Export to Excel
            </button>
            <button
              onClick={handleExportPDF}
              style={exportPdfButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
            >
              <span>📄</span>
              Export to PDF
            </button>
          </div>

          {/* Summary Stats */}
          <div style={summaryCardStyle}>
            <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Report Summary</h3>
            {renderSummaryStats()}
            
            {/* Entity Breakdown for Attendance */}
            {renderEntityBreakdown()}
          </div>

          {/* Data Table */}
          {renderDataTable()}
        </>
      )}
    </div>
  );
};

export default Reports;