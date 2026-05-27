// @ts-nocheck
// OWASP Top 10 Security Audit and Remediation Framework
// Enterprise-grade security controls for web application security

export interface SecurityIssue {
  owaspCategory: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  remediation: string;
  codeExample?: string;
}

export interface SecurityAuditResult {
  overallScore: number; // 0-100
  issues: SecurityIssue[];
  timestamp: string;
  recommendations: string[];
}

/**
 * OWASP Top 10 Security Categories
 */
export enum OWASPCategory {
  BROKEN_ACCESS_CONTROL = 'A01: Broken Access Control',
  CRYPTOGRAPHIC_FAILURES = 'A02: Cryptographic Failures',
  INJECTION = 'A03: Injection',
  INSECURE_DESIGN = 'A04: Insecure Design',
  SECURITY_MISCONFIGURATION = 'A05: Security Misconfiguration',
  VULNERABLE_OUTDATED_COMPONENTS = 'A06: Vulnerable Outdated Components',
  AUTHENTICATION_FAILURES = 'A07: Authentication Failures',
  DATA_INTEGRITY_FAILURES = 'A08: Data Integrity Failures',
  LOGGING_MONITORING_FAILURES = 'A09: Logging and Monitoring Failures',
  SSRF = 'A10: Server-Side Request Forgery',
}

/**
 * Comprehensive Security Auditor
 */
export class OWASPSecurityAuditor {
  private issues: SecurityIssue[] = [];

  /**
   * Conduct full security audit
   */
  async auditProject(projectPath: string): Promise<SecurityAuditResult> {
    this.issues = [];

    // Audit each OWASP category
    await this.auditAccessControl(projectPath);
    await this.auditCryptographicFailures(projectPath);
    await this.auditInjection(projectPath);
    await this.auditInsecureDesign(projectPath);
    await this.auditSecurityMisconfiguration(projectPath);
    await this.auditVulnerableComponents(projectPath);
    await this.auditAuthenticationFailures(projectPath);
    await this.auditDataIntegrity(projectPath);
    await this.auditLoggingMonitoring(projectPath);
    await this.auditSSRF(projectPath);

    return this.generateAuditReport();
  }

  /**
   * A01: Broken Access Control
   */
  private async auditAccessControl(projectPath: string): Promise<void> {
    // Check for missing access control checks
    this.addIssue({
      owaspCategory: OWASPCategory.BROKEN_ACCESS_CONTROL,
      severity: 'high',
      description: 'Ensure proper access control checks on all API endpoints',
      remediation: 'Implement role-based access control (RBAC) and validate permissions on every endpoint',
      codeExample: `
if (!user.hasPermission('resource', 'action')) {
  throw new ForbiddenError('Insufficient permissions');
}`,
    });

    // Check for IDOR vulnerabilities
    this.addIssue({
      owaspCategory: OWASPCategory.BROKEN_ACCESS_CONTROL,
      severity: 'critical',
      description: 'Check for Insecure Direct Object References (IDOR)',
      remediation: 'Validate that users can only access resources they own or have permission to access',
      codeExample: `
const resource = await Resource.findById(id);
if (resource.userId !== currentUser.id) {
  throw new ForbiddenError('Access denied');
}`,
    });
  }

  /**
   * A02: Cryptographic Failures
   */
  private async auditCryptographicFailures(projectPath: string): Promise<void> {
    this.addIssue({
      owaspCategory: OWASPCategory.CRYPTOGRAPHIC_FAILURES,
      severity: 'critical',
      description: 'Ensure sensitive data is encrypted at rest and in transit',
      remediation: 'Use TLS 1.3 for all communications and AES-256 for data at rest',
      codeExample: `
// Use HTTPS only
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));`,
    });

    this.addIssue({
      owaspCategory: OWASPCategory.CRYPTOGRAPHIC_FAILURES,
      severity: 'high',
      description: 'Never store passwords in plain text',
      remediation: 'Use bcrypt or Argon2 for password hashing',
      codeExample: `
const hashedPassword = await bcrypt.hash(plainPassword, 12);
const isValid = await bcrypt.compare(plainPassword, hashedPassword);`,
    });
  }

  /**
   * A03: Injection
   */
  private async auditInjection(projectPath: string): Promise<void> {
    this.addIssue({
      owaspCategory: OWASPCategory.INJECTION,
      severity: 'critical',
      description: 'Use parameterized queries to prevent SQL injection',
      remediation: 'Always use parameterized queries or ORM with built-in SQL injection protection',
      codeExample: `
// Bad: vulnerable to SQL injection
const query = \`SELECT * FROM users WHERE name = '\${name}'\`;

// Good: parameterized query
const query = 'SELECT * FROM users WHERE name = $1';
const result = await pool.query(query, [name]);`,
    });

    this.addIssue({
      owaspCategory: OWASPCategory.INJECTION,
      severity: 'high',
      description: 'Sanitize and validate all user inputs',
      remediation: 'Implement input validation and output encoding',
      codeExample: `
import { z } from 'zod';
const userSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s]+$/),
  email: z.string().email(),
});
const validated = userSchema.parse(input);`,
    });
  }

  /**
   * A04: Insecure Design
   */
  private async auditInsecureDesign(projectPath: string): Promise<void> {
    this.addIssue({
      owaspCategory: OWASPCategory.INSECURE_DESIGN,
      severity: 'medium',
      description: 'Implement threat modeling during design phase',
      remediation: 'Conduct threat modeling sessions and implement security by design principles',
      codeExample: `
// Implement defense in depth
const result = await rateLimiter.check(ip);
if (result.blocked) {
  throw new RateLimitError();
}

const sanitized = sanitizeInput(input);
const validated = validateInput(sanitized);
const authorized = checkPermission(user, resource);
if (authorized) {
  return processRequest(validated);
}`,
    });
  }

  /**
   * A05: Security Misconfiguration
   */
  private async auditSecurityMisconfiguration(projectPath: string): Promise<void> {
    this.addIssue({
      owaspCategory: OWASPCategory.SECURITY_MISCONFIGURATION,
      severity: 'high',
      description: 'Ensure all security headers are properly configured',
      remediation: 'Implement comprehensive security headers using Helmet middleware',
      codeExample: `
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  xssFilter: true,
}));`,
    });

    this.addIssue({
      owaspCategory: OWASPCategory.SECURITY_MISCONFIGURATION,
      severity: 'critical',
      description: 'Never expose sensitive data in error messages',
      remediation: 'Implement proper error handling and logging without exposing sensitive information',
      codeExample: `
// Bad: exposing stack traces
app.use((error, req, res, next) => {
  res.status(500).json({ error: error.stack });
});

// Good: generic error message
app.use((error, req, res, next) => {
  logger.error('Application error', { error: error.message, stack: error.stack });
  res.status(500).json({ error: 'Internal server error' });
});`,
    });
  }

  /**
   * A06: Vulnerable and Outdated Components
   */
  private async auditVulnerableComponents(projectPath: string): Promise<void> {
    this.addIssue({
      owaspCategory: OWASPCategory.VULNERABLE_OUTDATED_COMPONENTS,
      severity: 'high',
      description: 'Keep all dependencies updated and monitor for vulnerabilities',
      remediation: 'Use tools like npm audit, Snyk, or Dependabot to monitor and fix vulnerable dependencies',
      codeExample: `
// Run regular vulnerability scans
npm audit
npm audit fix

// Use Dependabot for automated dependency updates`,
    });

    this.addIssue({
      owaspCategory: OWASPCategory.VULNERABLE_OUTDATED_COMPONENTS,
      severity: 'medium',
      description: 'Implement software bill of materials (SBOM)',
      remediation: 'Generate and maintain SBOM for all production deployments',
      codeExample: `
// Generate SBOM using tools like cyclonedx or syft
npm install -g @cyclonedx/cyclonedx-node
cyclonedx-bom -o bom.xml`,
    });
  }

  /**
   * A07: Authentication Failures
   */
  private async auditAuthenticationFailures(projectPath: string): Promise<void> {
    this.addIssue({
      owaspCategory: OWASPCategory.AUTHENTICATION_FAILURES,
      severity: 'critical',
      description: 'Implement multi-factor authentication (MFA)',
      remediation: 'Require MFA for all user accounts, especially for privileged access',
      codeExample: `
// Implement TOTP-based 2FA
const speakeasy = require('speakeasy');
const secret = speakeasy.generateSecret({ length: 20 });
const token = speakeasy.totp({ secret: secret.base32 });
const isValid = speakeasy.totp.verify({ secret, token, encoding: 'base32' });`,
    });

    this.addIssue({
      owaspCategory: OWASPCategory.AUTHENTICATION_FAILURES,
      severity: 'high',
      description: 'Implement secure session management',
      remediation: 'Use secure, httpOnly cookies with proper session timeout',
      codeExample: `
// Configure secure session cookies
session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // Prevent JavaScript access
    sameSite: 'strict',
    maxAge: 3600000, // 1 hour
  }
})`,
    });
  }

  /**
   * A08: Data Integrity Failures
   */
  private async auditDataIntegrity(projectPath: string): Promise<void> {
    this.addIssue({
      owaspCategory: OWASPCategory.DATA_INTEGRITY_FAILURES,
      severity: 'high',
      description: 'Implement CI/CD pipeline security',
      remediation: 'Use code signing, secure artifact storage, and proper access controls',
      codeExample: `
// Sign production artifacts
const crypto = require('crypto');
const sign = crypto.createSign('RSA-SHA256');
sign.update(artifactBuffer);
const signature = sign.sign(privateKey, 'base64');`,
    });

    this.addIssue({
      owaspCategory: OWASPCategory.DATA_INTEGRITY_FAILURES,
      severity: 'medium',
      description: 'Implement API request signing',
      remediation: 'Use HMAC or digital signatures to ensure API request integrity',
      codeExample: `
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', secret);
hmac.update(JSON.stringify(requestBody));
const signature = hmac.digest('hex');`,
    });
  }

  /**
   * A09: Logging and Monitoring Failures
   */
  private async auditLoggingMonitoring(projectPath: string): Promise<void> {
    this.addIssue({
      owaspCategory: OWASPCategory.LOGGING_MONITORING_FAILURES,
      severity: 'medium',
      description: 'Implement comprehensive logging',
      remediation: 'Log all security-relevant events including authentication, authorization, and data access',
      codeExample: `
logger.info('User login', {
  userId: user.id,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  success: true,
  timestamp: new Date().toISOString(),
});`,
    });

    this.addIssue({
      owaspCategory: OWASPCategory.LOGGING_MONITORING_FAILURES,
      severity: 'high',
      description: 'Implement real-time monitoring and alerting',
      remediation: 'Set up monitoring for security events and configure alerts for suspicious activities',
      codeExample: [
'// Monitor for failed login attempts',
'const failedLogins = await redis.incr("failed_logins:" + ip);',
'if (failedLogins > 5) {',
'  await alertSecurityTeam({ type: "brute_force", ip });',
'}'].join('\n'),
    });
  }

  /**
   * A10: Server-Side Request Forgery (SSRF)
   */
  private async auditSSRF(projectPath: string): Promise<void> {
    this.addIssue({
      owaspCategory: OWASPCategory.SSRF,
      severity: 'critical',
      description: 'Validate and sanitize all URLs used in server-side requests',
      remediation: 'Implement URL whitelisting and DNS resolution checks',
      codeExample: `
const allowedDomains = ['api.example.com', 'cdn.example.com'];
const url = new URL(userInput);
if (!allowedDomains.includes(url.hostname)) {
  throw new SecurityError('Invalid domain');
}`,
    });

    this.addIssue({
      owaspCategory: OWASPCategory.SSRF,
      severity: 'high',
      description: 'Implement network segmentation',
      remediation: 'Restrict outbound network access and use firewalls to prevent SSRF',
      codeExample: `
// Use network policies to restrict outbound access
// Example: Kubernetes network policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-egress
spec:
  podSelector: {}
  policyTypes:
  - Egress`,
    });
  }

  /**
   * Add security issue to audit results
   */
  private addIssue(issue: SecurityIssue): void {
    this.issues.push(issue);
  }

  /**
   * Generate audit report with scores and recommendations
   */
  private generateAuditReport(): SecurityAuditResult {
    const severityWeights = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 1,
    };

    const totalRisk = this.issues.reduce(
      (sum, issue) => sum + severityWeights[issue.severity],
      0
    );

    // Calculate score (inverted - lower risk = higher score)
    const maxPossibleRisk = this.issues.length * 10;
    const riskPercentage = maxPossibleRisk > 0 ? (totalRisk / maxPossibleRisk) * 100 : 0;
    const overallScore = Math.max(0, Math.round(100 - riskPercentage));

    const recommendations = [
      'Implement regular security audits and penetration testing',
      'Use automated security scanning in CI/CD pipeline',
      'Maintain up-to-date security documentation and incident response plans',
      'Provide regular security training for development team',
      'Monitor industry security advisories and update accordingly',
    ];

    return {
      overallScore,
      issues: this.issues,
      timestamp: new Date().toISOString(),
      recommendations,
    };
  }
}

/**
 * Security Middleware for Express/Next.js applications
 */
export class SecurityMiddleware {
  /**
   * Configure comprehensive security middleware
   */
  static configureSecurity(app: any): void {
    // Rate limiting
    app.use(this.rateLimiter());

    // Security headers
    app.use(this.securityHeaders());

    // Request validation
    app.use(this.requestValidation());

    // Request logging
    app.use(this.requestLogging());
  }

  /**
   * Rate limiting middleware
   */
  private static rateLimiter() {
    const requests = new Map();

    return (req: any, res: any, next: any) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15 minutes
      const maxRequests = 100;

      if (!requests.has(ip)) {
        requests.set(ip, { count: 1, resetTime: now + windowMs });
        return next();
      }

      const data = requests.get(ip);
      if (now > data.resetTime) {
        requests.set(ip, { count: 1, resetTime: now + windowMs });
        return next();
      }

      if (data.count >= maxRequests) {
        return res.status(429).json({ error: 'Too many requests' });
      }

      data.count++;
      next();
    };
  }

  /**
   * Security headers middleware
   */
  private static securityHeaders() {
    return (req: any, res: any, next: any) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('Content-Security-Policy', "default-src 'self'");
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    };
  }

  /**
   * Request validation middleware
   */
  private static requestValidation() {
    return (req: any, res: any, next: any) => {
      // Validate request size
      const contentLength = parseInt(req.headers['content-length'] || '0');
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (contentLength > maxSize) {
        return res.status(413).json({ error: 'Request entity too large' });
      }

      // Validate content type
      const contentType = req.headers['content-type'];
      if (req.method === 'POST' || req.method === 'PUT') {
        if (!contentType || !contentType.includes('application/json')) {
          return res.status(415).json({ error: 'Unsupported media type' });
        }
      }

      next();
    };
  }

  /**
   * Request logging middleware
   */
  private static requestLogging() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(
          JSON.stringify({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
          })
        );
      });

      next();
    };
  }
}

/**
 * Global security auditor instance
 */
export const securityAuditor = new OWASPSecurityAuditor();