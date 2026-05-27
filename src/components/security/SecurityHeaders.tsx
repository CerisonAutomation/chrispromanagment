// Security Headers Component
// Implements OWASP A05: Security Misconfiguration remediation
// Adds comprehensive security headers via React Helmet

import { Helmet } from 'react-helmet-async';
import { SecurityHeaders as SecurityHeadersUtil } from '@/lib/security/security-middleware';

interface SecurityHeadersProps {
  customCSP?: string;
  enabled?: boolean;
}

export function SecurityHeaders({ customCSP, enabled = true }: SecurityHeadersProps) {
  if (!enabled) {
    return null;
  }

  const headers = SecurityHeadersUtil.getHeaders();
  const csp = customCSP || headers['Content-Security-Policy'];

  return (
    <Helmet>
      {/* Content Security Policy */}
      <meta httpEquiv="Content-Security-Policy" content={csp} />
      
      {/* Strict Transport Security */}
      <meta
        httpEquiv="Strict-Transport-Security"
        content={headers['Strict-Transport-Security']}
      />
      
      {/* X-Frame-Options */}
      <meta httpEquiv="X-Frame-Options" content={headers['X-Frame-Options']} />
      
      {/* X-Content-Type-Options */}
      <meta
        httpEquiv="X-Content-Type-Options"
        content={headers['X-Content-Type-Options']}
      />
      
      {/* X-XSS-Protection */}
      <meta httpEquiv="X-XSS-Protection" content={headers['X-XSS-Protection']} />
      
      {/* Referrer-Policy */}
      <meta name="referrer" content={headers['Referrer-Policy']} />
      
      {/* Permissions-Policy */}
      <meta httpEquiv="Permissions-Policy" content={headers['Permissions-Policy']} />
      
      {/* Cross-Origin-Opener-Policy */}
      <meta
        httpEquiv="Cross-Origin-Opener-Policy"
        content={headers['Cross-Origin-Opener-Policy']}
      />
      
      {/* Cross-Origin-Embedder-Policy */}
      <meta
        httpEquiv="Cross-Origin-Embedder-Policy"
        content={headers['Cross-Origin-Embedder-Policy']}
      />
    </Helmet>
  );
}

export default SecurityHeaders;
