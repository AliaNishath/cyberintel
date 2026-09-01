---
name: soc-product-engineering
description: "Use when improving CyberIntel user experience, reducing frontend or Express/MongoDB latency, or adding SOC capabilities such as alert triage, incident response, threat intelligence, evidence, playbooks, and analyst workflows. Preserve the existing React/Vite and Express/Mongoose architecture while delivering measurable, secure improvements."
argument-hint: "Describe the UX, performance, or SOC workflow to improve"
user-invocable: true
---

# SOC Product Engineering

## Outcome

Deliver a focused, production-minded improvement to CyberIntel that helps an analyst understand, decide, and act quickly. The change must preserve the existing application structure, use real platform data where available, and make security and performance behavior observable.

## When to Use

- Improve dashboard usability, navigation, accessibility, loading states, error recovery, or responsive behavior.
- Reduce slow API responses, excessive database work, duplicate requests, or frontend rendering lag.
- Add SOC features such as alert queues, severity and status management, incident timelines, analyst notes, evidence, assignments, playbooks, escalation, containment, or audit history.
- Extend existing threat, report, assistant, monitoring, or cyber-tool workflows without replacing working modules.

## Procedure

1. **Locate the owning path.** Start from the named screen, route, controller, model, or failing behavior. Read the nearest implementation and call sites, then state one falsifiable hypothesis about the cause or missing behavior. Identify one cheap check that could disconfirm it.
2. **Inspect the contract.** Trace the request from React component to route, middleware, controller, service, and Mongoose model. Reuse existing auth, JWT, error, response, and data-shaping patterns. Check whether the UI currently uses real MongoDB data or sample values before changing metrics.
3. **Choose the smallest vertical slice.** Keep changes close to the owning module. For a new SOC workflow, define the actor, asset or threat, state transitions, timestamps, and audit requirements before adding UI. Avoid introducing a second source of truth.
4. **Design the analyst experience.** Optimize for scanning and repeated action: clear severity, status, ownership, timestamps, filters, search, empty states, loading states, actionable errors, keyboard access, mobile behavior, and confirmation for destructive actions. Prefer existing Lucide icons and established visual language. Do not hide critical context behind decoration or overly dense controls.
5. **Make backend work bounded.** Use field projection, indexed filters, pagination or cursors, bounded date ranges, aggregation in MongoDB, and parallel independent queries where appropriate. Avoid unbounded `find()` calls, N+1 queries, repeated external calls, blocking loops, and sending unused fields. Add indexes only for demonstrated query patterns and preserve tenant/user authorization in every query.
6. **Protect SOC data.** Enforce authentication and least privilege at the route boundary. Admin-only mutations must remain admin-only in the UI and API. Validate query, path, and body inputs; avoid leaking secrets or sensitive evidence; record actor and transition timestamps for incident or alert mutations; and preserve safe error responses.
7. **Implement progressively.** Make the smallest edit that tests the hypothesis. After every substantive edit, run the narrowest available check before reading or changing adjacent areas. Keep existing APIs compatible unless the feature requires a versioned contract or coordinated frontend change.
8. **Measure the result.** For performance work, compare a before/after request or query path and verify response size, query count, and relevant render behavior when practical. For UX work, verify the primary analyst task, keyboard operation, responsive layout, and loading/error/empty states. For SOC workflows, verify valid and invalid transitions, authorization, persistence, and audit fields.
9. **Finish cleanly.** Run the relevant frontend build and backend checks available in the repository. Review the diff for unrelated changes, stale sample data, missing auth, inconsistent labels, and accidental public exposure. Update documentation only when the behavior or setup has changed.

## Decision Points

### UX issue

Fix the interaction and state model first. Add loading, empty, error, retry, and success feedback before tuning visual polish. If the issue is caused by data shape or API latency, follow the backend path instead of masking it with a spinner.

### Backend lag

Reproduce or inspect the slow path first. If the cost is database-bound, constrain and index the query. If it is network-bound, parallelize independent work or cache only data with a clear invalidation strategy. If it is payload or render-bound, reduce fields and request frequency. Do not add caching as a substitute for authorization or correctness.

### New SOC capability

Prefer extending the existing Threat, user, report, and dashboard concepts when they fit. Add a model or route only when the lifecycle, ownership, retention, or audit semantics cannot be represented safely by existing data. Define state transitions explicitly and reject invalid transitions server-side.

### External intelligence or AI

Keep external calls behind a service boundary with timeouts, bounded input, graceful degradation, and clear provenance. Never claim live or verified intelligence when the result is sample, stale, unavailable, or heuristic. Do not send passwords, tokens, or unnecessary personal data to external providers.

## Completion Checklist

- The named analyst workflow is faster or clearer and remains usable on desktop and mobile.
- Loading, empty, error, retry, and permission states are handled where relevant.
- API inputs are validated, responses are bounded, and authorization is enforced for reads and mutations.
- MongoDB work is bounded and uses appropriate projections, pagination, aggregation, or indexes.
- SOC state changes are persisted consistently and include actor/time audit information where applicable.
- Existing React/Vite and Express/Mongoose conventions and folder structure are preserved.
- A focused behavior check, test, build, or type/lint check passes; any unavailable or failing checks are reported.
- No unrelated rewrites, hardcoded security metrics, secrets, or unreviewed external claims were introduced.