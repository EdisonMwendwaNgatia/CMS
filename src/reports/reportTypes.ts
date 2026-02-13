/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Member } from '../members/memberTypes';
import type { Visitor } from '../visitors/visitorTypes';
import type { Family } from '../families/familyTypes';
import type { AttendanceRecord } from '../attendance/attendanceTypes';
import type { Ministry } from '../ministries/ministryTypes';

export type ReportType = 'members' | 'visitors' | 'families' | 'attendance' | 'ministries';
export type ReportFormat = 'pdf' | 'excel';
export type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface ReportFilters {
  dateRange: DateRange;
  startDate?: string;
  endDate?: string;
  status?: string;
  ministry?: string;
  entityType?: string;
  family?: string;
}

export type ReportRow = Member | Visitor | Family | AttendanceRecord | Ministry;

export interface ReportData {
  type: ReportType;
  generatedAt: string;
  filters: ReportFilters;
  summary: ReportSummary;
  data: ReportRow[];
  charts?: ChartData[];
}

export interface ReportSummary {
  totalRecords: number;
  activeRecords?: number;
  newRecords?: number;
  attendanceRate?: number;
  averageAge?: number;
  genderBreakdown?: {
    male: number;
    female: number;
    other: number;
  };
  statusBreakdown?: Record<string, any>;
  entityBreakdown?: Record<string, { count: number; members: number; attended: number; rate: number }>;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
}

export interface ExportOptions {
  filename: string;
  format: ReportFormat;
  includeCharts: boolean;
  includeSummary: boolean;
  orientation?: 'portrait' | 'landscape';
}