# Issue tracker: Jira

Issues and specs for `entrenets-website` live in Jira project `IBS`.

- Site: https://infinitybytesolutions.atlassian.net
- Board: [IBS board 1](https://infinitybytesolutions.atlassian.net/jira/software/projects/IBS/boards/1?filter=&groupBy=none)
- Ticket keys: `IBS-<number>`.
- Ticket URLs: `https://infinitybytesolutions.atlassian.net/browse/IBS-<number>`.

Use an authenticated Jira integration or the Jira web UI for ticket operations.
GitHub hosts the repository and pull requests; Jira is the issue tracker.

## Operations

- **Create**: create an issue in project `IBS` with a summary and description.
  Inspect available issue types and required fields before submitting.
- **Read**: retrieve the issue's description, comments, labels, status, assignee,
  and linked issues using its full `IBS-<number>` key.
- **List**: use board 1 or a Jira search scoped to project `IBS`, then filter for
  this repository and the requested labels or status. The project may contain
  work for other repositories.
- **Comment**: add the requested comment to the Jira issue.
- **Labels**: apply or remove the Jira labels defined in
  `docs/agents/triage-labels.md`, preserving unrelated labels. Triage roles are
  labels, separate from Jira workflow statuses.
- **Close or reopen**: inspect the issue's available workflow transitions and
  select the appropriate destination and resolution. Discover status names and
  transition IDs from Jira when needed.

When a skill says "publish to the issue tracker", create a Jira issue in `IBS`
and return its key and URL. When it says "fetch the relevant ticket", read that
Jira issue and its comments. Resolve ambiguous bare numbers before acting;
GitHub issue or PR numbers are not Jira keys.

## Pull requests as a triage surface

PRs as a request surface: no.

## Wayfinding operations

- **Map**: one Jira issue labelled `wayfinder:map`, using the wayfinder skill's
  map sections.
- **Child tickets**: use Jira's parent relationship where the configured issue
  types support it. Otherwise, link tickets from an ordered list in the map and
  add `Part of IBS-<map-number>` with the map URL to each child description.
- **Types**: use `wayfinder:<type>` labels: `research`, `prototype`, `grilling`,
  or `task`.
- **Blocking**: use Jira's native blocking links when available. Otherwise,
  record `Blocked by: IBS-<number>` with links in the child description.
- **Frontier**: select the first unfinished, unassigned child in map order whose
  blockers are all finished according to the project's workflow.
- **Claim**: assign the ticket to the developer driving the work before starting.
- **Resolve**: comment with the result, transition the ticket to the appropriate
  completed status, and add a brief finding and ticket link to the map's
  Decisions-so-far section.
