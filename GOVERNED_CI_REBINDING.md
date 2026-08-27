# Governed CI rebinding

The editorial CI binding is identified by the tuple `pr`, `base`, `head`, `merge`, `run`, `attempt`.

For a governed publication, the immutable publication head remains fixed while the live base may advance through a safe descendant-only change. When that happens, the CI binding must be refreshed against the new effective base before further review or merge gates can proceed.

The rebinding flow preserves:

- the immutable publication manifest and head;
- exact base/head binding;
- an event-time merge synthesized from the authorized base and publication head;
- a successful required check bound to the authorized run;
- explicit approval before any refresh dispatch.

This document is repository-level technical documentation only. It does not modify publication content, workflow definitions, rulesets, deployment configuration, or runtime behavior.
