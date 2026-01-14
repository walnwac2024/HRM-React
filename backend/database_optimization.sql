-- Database Performance Optimization Script
-- Run this SQL to add indexes for frequently queried fields

-- ============================================
-- EMPLOYEES TABLE INDEXES
-- ============================================

-- Index for employee code lookups (used in search)
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);

-- Index for name searches
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(full_name);

-- Index for department filtering
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);

-- Index for designation filtering
CREATE INDEX IF NOT EXISTS idx_employees_designation ON employees(designation);

-- Index for station filtering
CREATE INDEX IF NOT EXISTS idx_employees_station ON employees(station);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- Index for active/inactive filtering
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_employees_dept_status ON employees(department, status, is_active);

-- ============================================
-- ATTENDANCE TABLE INDEXES
-- ============================================

-- Index for employee attendance lookups
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- Composite index for employee + date queries
CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance(employee_id, date);

-- Index for check-in/out time queries
CREATE INDEX IF NOT EXISTS idx_attendance_checkin ON attendance(check_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_checkout ON attendance(check_out_time);

-- ============================================
-- LEAVE APPLICATIONS TABLE INDEXES
-- ============================================

-- Index for employee leave lookups
CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_applications(employee_id);

-- Index for leave type filtering
CREATE INDEX IF NOT EXISTS idx_leave_type ON leave_applications(leave_type_id);

-- Index for status filtering (pending, approved, rejected)
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_applications(status);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_leave_start_date ON leave_applications(start_date);
CREATE INDEX IF NOT EXISTS idx_leave_end_date ON leave_applications(end_date);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_leave_emp_status ON leave_applications(employee_id, status);

-- ============================================
-- NEWS TABLE INDEXES
-- ============================================

-- Index for created_at (for sorting by date)
CREATE INDEX IF NOT EXISTS idx_news_created ON news(created_at DESC);

-- Index for author lookups
CREATE INDEX IF NOT EXISTS idx_news_author ON news(author_id);

-- ============================================
-- APPROVALS TABLE INDEXES
-- ============================================

-- Index for approver lookups
CREATE INDEX IF NOT EXISTS idx_approvals_approver ON approvals(approver_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);

-- Composite index for pending approvals by user
CREATE INDEX IF NOT EXISTS idx_approvals_user_status ON approvals(approver_id, status);

-- ============================================
-- PERFORMANCE TIPS
-- ============================================

-- After creating indexes, analyze tables for query optimization
ANALYZE employees;
ANALYZE attendance;
ANALYZE leave_applications;
ANALYZE news;
ANALYZE approvals;

-- To check if indexes are being used, run:
-- EXPLAIN SELECT * FROM employees WHERE department = 'IT' AND status = 'Active';
