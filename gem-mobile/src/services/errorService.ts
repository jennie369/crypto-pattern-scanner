// src/services/errorService.ts
// Error Tracking Service for Bug Detection
// GEMRAL AI BRAIN - Phase 4

import { Platform } from 'react-native';
import { supabase } from './supabase';
import DeviceInfo from 'react-native-device-info';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ErrorReport {
  errorType: 'js_error' | 'api_error' | 'network_error' | 'render_error';
  errorMessage: string;
  errorName?: string;
  errorStack?: string;
  screenName?: string;
  componentName?: string;
  actionName?: string;
  metadata?: Record<string, any>;
  requestData?: Record<string, any>;
  responseData?: Record<string, any>;
  severity?: 'warning' | 'error' | 'critical';
  isHandled?: boolean;
}

export interface ErrorPattern {
  errorHash: string;
  errorType: string;
  errorMessageTemplate: string;
  occurrenceCount: number;
  affectedUsersCount: number;
  severity: string;
  status: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface ErrorDashboard {
  totalErrors: number;
  uniquePatterns: number;
  affectedUsers: number;
  criticalCount: number;
  byType: Record<string, number>;
  topErrors: ErrorPattern[];
  trend: Array<{ date: string; count: number }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

let currentUserId: string | null = null;
let cachedAppVersion: string | null = null;

const setCurrentUserId = (userId: string | null) => {
  currentUserId = userId;
};

const getAppVersion = async (): Promise<string> => {
  if (cachedAppVersion) return cachedAppVersion;

  try {
    cachedAppVersion = await DeviceInfo.getVersion();
  } catch {
    cachedAppVersion = '1.0.0';
  }

  return cachedAppVersion;
};

// ═══════════════════════════════════════════════════════════════════════════
// ERROR REPORTING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Report an error to the tracking system
 */
const reportError = async (report: ErrorReport): Promise<string | null> => {
  try {
    const appVersion = await getAppVersion();

    const { data, error } = await supabase.rpc('report_error', {
      p_user_id: currentUserId,
      p_error_type: report.errorType,
      p_error_message: report.errorMessage,
      p_error_name: report.errorName || null,
      p_error_stack: report.errorStack || null,
      p_screen_name: report.screenName || null,
      p_component_name: report.componentName || null,
      p_action_name: report.actionName || null,
      p_metadata: report.metadata || {},
      p_device_type: Platform.OS,
      p_app_version: appVersion,
      p_severity: report.severity || 'error',
      p_is_handled: report.isHandled || false,
    });

    if (error) {
      console.error('[ErrorService] Report error failed:', error);
      return null;
    }

    console.log('[ErrorService] Error reported:', data);
    return data;
  } catch (err) {
    console.error('[ErrorService] Report error exception:', err);
    return null;
  }
};

/**
 * Report a JavaScript error
 */
const reportJSError = async (
  error: Error,
  context?: {
    screenName?: string;
    componentName?: string;
    actionName?: string;
    metadata?: Record<string, any>;
  }
): Promise<string | null> => {
  return reportError({
    errorType: 'js_error',
    errorMessage: error.message,
    errorName: error.name,
    errorStack: error.stack,
    screenName: context?.screenName,
    componentName: context?.componentName,
    actionName: context?.actionName,
    metadata: context?.metadata,
    isHandled: true,
  });
};

/**
 * Report an API error
 */
const reportAPIError = async (
  url: string,
  status: number,
  errorMessage: string,
  context?: {
    requestData?: Record<string, any>;
    responseData?: Record<string, any>;
    screenName?: string;
  }
): Promise<string | null> => {
  return reportError({
    errorType: 'api_error',
    errorMessage: `API ${status}: ${errorMessage}`,
    errorName: `HTTP_${status}`,
    screenName: context?.screenName,
    metadata: {
      url,
      status,
    },
    requestData: context?.requestData,
    responseData: context?.responseData,
    severity: status >= 500 ? 'critical' : 'error',
  });
};

/**
 * Report a network error
 */
const reportNetworkError = async (
  url: string,
  errorMessage: string,
  context?: {
    screenName?: string;
    actionName?: string;
  }
): Promise<string | null> => {
  return reportError({
    errorType: 'network_error',
    errorMessage,
    errorName: 'NetworkError',
    screenName: context?.screenName,
    actionName: context?.actionName,
    metadata: { url },
  });
};

/**
 * Report a render/component error
 */
const reportRenderError = async (
  error: Error,
  componentName: string,
  errorInfo?: { componentStack?: string }
): Promise<string | null> => {
  return reportError({
    errorType: 'render_error',
    errorMessage: error.message,
    errorName: error.name,
    errorStack: error.stack,
    componentName,
    metadata: {
      componentStack: errorInfo?.componentStack,
    },
    severity: 'critical',
    isHandled: true,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════════════════════════════════════

let isGlobalHandlerSetup = false;

/**
 * Setup global error handlers
 */
const setupGlobalErrorHandler = (): void => {
  if (isGlobalHandlerSetup) return;

  // Handle uncaught JS errors
  const originalHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
    // Report to our system
    reportError({
      errorType: 'js_error',
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack,
      severity: isFatal ? 'critical' : 'error',
      isHandled: false,
      metadata: { isFatal },
    });

    // Call original handler
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });

  // Handle unhandled promise rejections
  const rejectionTracker = require('promise/setimmediate/rejection-tracking');
  rejectionTracker.enable({
    allRejections: true,
    onUnhandled: (id: number, error: Error) => {
      reportError({
        errorType: 'js_error',
        errorMessage: error?.message || 'Unhandled Promise Rejection',
        errorName: 'UnhandledRejection',
        errorStack: error?.stack,
        severity: 'error',
        isHandled: false,
        metadata: { rejectionId: id },
      });
    },
  });

  isGlobalHandlerSetup = true;
  console.log('[ErrorService] Global error handler setup complete');
};

// ═══════════════════════════════════════════════════════════════════════════
// ERROR DASHBOARD (Admin only)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get error dashboard statistics
 */
const getErrorDashboard = async (days: number = 7): Promise<ErrorDashboard | null> => {
  try {
    const { data, error } = await supabase.rpc('get_error_dashboard', {
      p_days: days,
    });

    if (error) {
      console.error('[ErrorService] Get dashboard error:', error);
      return null;
    }

    return {
      totalErrors: data?.total_errors || 0,
      uniquePatterns: data?.unique_patterns || 0,
      affectedUsers: data?.affected_users || 0,
      criticalCount: data?.critical_count || 0,
      byType: data?.by_type || {},
      topErrors: (data?.top_errors || []).map((e: any) => ({
        errorHash: e.error_hash,
        errorType: e.error_type,
        errorMessageTemplate: e.error_message_template,
        occurrenceCount: e.occurrence_count,
        affectedUsersCount: e.affected_users_count,
        severity: e.severity,
        status: e.status,
        firstSeenAt: e.first_seen_at,
        lastSeenAt: e.last_seen_at,
      })),
      trend: data?.trend || [],
    };
  } catch (err) {
    console.error('[ErrorService] Get dashboard failed:', err);
    return null;
  }
};

/**
 * Get error pattern details
 */
const getErrorPatternDetails = async (errorHash: string): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('get_error_pattern_details', {
      p_error_hash: errorHash,
    });

    if (error) {
      console.error('[ErrorService] Get pattern details error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[ErrorService] Get pattern details failed:', err);
    return null;
  }
};

/**
 * Update error pattern status
 */
const updateErrorPatternStatus = async (
  errorHash: string,
  status: 'new' | 'investigating' | 'identified' | 'fixing' | 'fixed' | 'wont_fix',
  notes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ai_error_patterns')
      .update({
        status,
        notes,
        updated_at: new Date().toISOString(),
        ...(status === 'fixed' ? { fixed_at: new Date().toISOString() } : {}),
      })
      .eq('error_hash', errorHash);

    if (error) {
      console.error('[ErrorService] Update status error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[ErrorService] Update status failed:', err);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: API WRAPPER WITH ERROR TRACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wrap a fetch call with automatic error tracking
 */
const trackedFetch = async (
  url: string,
  options?: RequestInit,
  context?: { screenName?: string }
): Promise<Response> => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      await reportAPIError(
        url,
        response.status,
        response.statusText,
        {
          screenName: context?.screenName,
          requestData: options?.body ? JSON.parse(options.body as string) : undefined,
        }
      );
    }

    return response;
  } catch (error) {
    await reportNetworkError(
      url,
      error instanceof Error ? error.message : 'Unknown network error',
      context
    );
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const errorService = {
  // Configuration
  setCurrentUserId,

  // Reporting
  reportError,
  reportJSError,
  reportAPIError,
  reportNetworkError,
  reportRenderError,

  // Global handler
  setupGlobalErrorHandler,

  // Dashboard (Admin)
  getErrorDashboard,
  getErrorPatternDetails,
  updateErrorPatternStatus,

  // Helpers
  trackedFetch,
};

export default errorService;
