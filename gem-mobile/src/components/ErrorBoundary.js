/**
 * GEM Mobile - Error Boundary Component
 * Issue #18: Prevent app crashes
 * Catches JavaScript errors and shows fallback UI
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AlertTriangle, RefreshCw, Home, ChevronLeft } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/tokens';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    this.setState({ errorInfo });

    // You can also log to an error reporting service here
    // e.g., Sentry, Firebase Crashlytics, etc.
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoBack = () => {
    const { navigation } = this.props;
    if (navigation?.goBack) {
      navigation.goBack();
    }
    this.handleRetry();
  };

  handleGoHome = () => {
    const { navigation } = this.props;
    if (navigation?.navigate) {
      navigation.navigate('Home');
    }
    this.handleRetry();
  };

  render() {
    if (this.state.hasError) {
      const { showDetails = false, fallback } = this.props;

      // Custom fallback component
      if (fallback) {
        return fallback({
          error: this.state.error,
          resetError: this.handleRetry,
        });
      }

      return (
        <View style={styles.container}>
          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <AlertTriangle size={64} color={COLORS.error} />
          </View>

          {/* Error Title */}
          <Text style={styles.title}>Đã xảy ra lỗi</Text>

          {/* Error Message */}
          <Text style={styles.message}>
            {this.state.error?.message || 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại.'}
          </Text>

          {/* Error Details (development only) */}
          {showDetails && this.state.error && (
            <ScrollView style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Chi tiết lỗi:</Text>
              <Text style={styles.detailsText}>
                {this.state.error.toString()}
              </Text>
              {this.state.errorInfo?.componentStack && (
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </ScrollView>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Retry Button */}
            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}
              activeOpacity={0.8}
            >
              <RefreshCw size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>

            {/* Go Back Button */}
            {this.props.navigation && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={this.handleGoBack}
                activeOpacity={0.8}
              >
                <ChevronLeft size={20} color={COLORS.textMuted} />
                <Text style={styles.secondaryButtonText}>Quay lại</Text>
              </TouchableOpacity>
            )}

            {/* Go Home Button */}
            {this.props.navigation && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={this.handleGoHome}
                activeOpacity={0.8}
              >
                <Home size={20} color={COLORS.textMuted} />
                <Text style={styles.secondaryButtonText}>Trang chủ</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Help Text */}
          <Text style={styles.helpText}>
            Nếu lỗi tiếp tục xảy ra, vui lòng khởi động lại ứng dụng hoặc liên hệ hỗ trợ.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with ErrorBoundary
 */
export const withErrorBoundary = (WrappedComponent, options = {}) => {
  return function ErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary {...options} navigation={props.navigation}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDarkest,
    padding: SPACING.xxl,
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  title: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },

  message: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },

  detailsContainer: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },

  detailsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },

  detailsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },

  stackText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginTop: SPACING.sm,
  },

  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },

  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFFFFF',
  },

  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  secondaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  helpText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ErrorBoundary;
