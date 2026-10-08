import { MaintenanceRequest, RequestCategory, RequestStatus } from "../../types";

export type StatusFilter = "All" | RequestStatus;

export interface RequestStats {
  total: number;
  pending: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export function computeStats(requests: MaintenanceRequest[]): RequestStats {
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === "Pending").length,
    open: requests.filter((r) => r.status === "Open").length,
    inProgress: requests.filter((r) => r.status === "In Progress").length,
    resolved: requests.filter((r) => r.status === "Resolved").length,
  };
}

export function filterRequests(
  requests: MaintenanceRequest[],
  { search, statusFilter }: { search: string; statusFilter: StatusFilter }
): MaintenanceRequest[] {
  const q = search.trim().toLowerCase();
  return requests
    .filter((r) => (statusFilter === "All" ? true : r.status === statusFilter))
    .filter((r) => {
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()
    );
}

export interface DuplicateMatch {
  request: MaintenanceRequest;
  reportedByYou: boolean;
}

/** Lowercase, strip punctuation, split into words: "Main Bldg · Room 214" -> [main, bldg, room, 214] */
function locationTokens(location: string): string[] {
  return location
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

/** True when one location's words are all contained in the other's ("Room 214" ~ "Main Building · Room 214"). */
function sameLocation(a: string, b: string): boolean {
  const ta = locationTokens(a);
  const tb = locationTokens(b);
  if (ta.length === 0 || tb.length === 0) return false;
  const [short, long] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  return short.every((word) => long.includes(word));
}

/**
 * Looks for a report that's still active (Pending, Open or In Progress)
 * with the same category and location as the one being submitted.
 * Resolved and Declined reports don't count, so a repeat problem can be re-reported.
 */
export function findDuplicateRequest(
  requests: MaintenanceRequest[],
  input: { location: string; category: RequestCategory },
  currentUserEmail: string
): DuplicateMatch | undefined {
  const active: RequestStatus[] = ["Pending", "Open", "In Progress"];
  const match = requests
    .filter((r) => active.includes(r.status))
    .find(
      (r) => r.category === input.category && sameLocation(r.location, input.location)
    );
  return match
    ? { request: match, reportedByYou: match.requestedBy === currentUserEmail }
    : undefined;
}