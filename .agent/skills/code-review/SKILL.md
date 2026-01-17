---
name: code-review
description: Comprehensive code review for healthcare and medical software applications. Use when the user asks to review code, audit security, check code quality, perform code analysis, or validate healthcare software compliance. Covers security vulnerabilities (XSS, injection, auth), FHIR/HL7 medical data handling, accessibility, performance, and best practices.
---

# Code Review Skill

Perform structured code reviews for healthcare software with emphasis on security, compliance, and code quality.

## Review Process

1. **Scan** - Read the target files to understand scope
2. **Analyze** - Check against review categories below
3. **Report** - Document findings with severity levels
4. **Fix** - Propose or implement corrections

## Review Categories

### 1. Security (Critical)

| Check | Description |
|-------|-------------|
| **XSS** | All dynamic content must use `escapeHtml()` or equivalent |
| **Injection** | Validate/sanitize all user inputs, use parameterized queries |
| **Auth** | Verify OAuth2/SMART token handling, secure storage |
| **CORS** | Proper CORS headers, no wildcard in production |
| **Secrets** | No hardcoded credentials, API keys in environment variables |

### 2. Healthcare Compliance

| Check | Description |
|-------|-------------|
| **PHI Handling** | Patient data encrypted in transit (HTTPS) and at rest |
| **Audit Logging** | Log access to patient data with timestamps |
| **FHIR Validation** | Validate FHIR resources against R4 schemas |
| **Consent** | Check for proper consent flows before data access |

### 3. Code Quality

| Check | Description |
|-------|-------------|
| **Dead Code** | Remove unused variables, functions, imports |
| **Error Handling** | All async operations wrapped in try/catch |
| **Type Safety** | Prefer typed parameters, validate at boundaries |
| **Naming** | Descriptive, consistent naming conventions |

### 4. Performance

| Check | Description |
|-------|-------------|
| **Bundle Size** | Minimize dependencies, tree-shake unused code |
| **Lazy Loading** | Defer non-critical resources |
| **Caching** | Appropriate cache headers for static assets |
| **Pagination** | Use _count and _page for FHIR queries |

### 5. Accessibility

| Check | Description |
|-------|-------------|
| **Contrast** | WCAG AA contrast ratios (4.5:1 text, 3:1 UI) |
| **Keyboard** | All interactive elements keyboard accessible |
| **Screen Reader** | Semantic HTML, ARIA labels where needed |

## Severity Levels

| Level | Symbol | Action Required |
|-------|--------|-----------------|
| Critical | 🔴 | Must fix before production |
| Warning | 🟡 | Should fix, may cause issues |
| Info | 🟢 | Suggested improvement |

## Report Format

```markdown
## Code Review Report

### Summary
- Files reviewed: N
- Critical: N | Warning: N | Info: N

### 🔴 Critical Issues
| # | Location | Issue | Fix |
|---|----------|-------|-----|

### 🟡 Warnings
| # | Location | Issue | Suggestion |
|---|----------|-------|------------|

### 🟢 Suggestions
| # | Location | Suggestion |
|---|----------|------------|

### ✅ Verified Secure
- List of security checks passed
```

## Common Healthcare Patterns

### XSS Protection
```javascript
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}
```

### FHIR Request with Error Handling
```javascript
try {
    const patient = await client.request(`Patient/${patientId}`);
    // validate response
    if (!patient.resourceType === 'Patient') throw new Error('Invalid resource');
} catch (error) {
    console.error('FHIR Error:', error);
    // show user-friendly error, log details server-side
}
```

### Secure Token Storage
```javascript
// Never store tokens in localStorage for PHI apps
// Use httpOnly cookies or secure session storage with short TTL
sessionStorage.setItem('token', token); // Only for non-PHI
```
