import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // In production, we would log this to Crashlytics or Sentry here
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleSupport = () => {
    Linking.openURL('mailto:support@wfms.com?subject=App Crash Report');
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <AppText variant="h1" style={styles.title}>Oops!</AppText>
          <AppText variant="body" style={styles.subtitle}>
            Something went wrong. We are working on fixing it.
          </AppText>
          <PrimaryButton title="Try Again" onPress={this.handleReset} style={styles.button} />
          <PrimaryButton title="Contact Support" onPress={this.handleSupport} style={styles.supportButton} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  title: {
    color: '#EF4444',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
  supportButton: {
    width: '100%',
    backgroundColor: '#6B7280',
  },
});
