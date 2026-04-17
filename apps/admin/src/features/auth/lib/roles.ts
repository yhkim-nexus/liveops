import { ROLE_LEVELS, type Role } from "../types/auth";
import { ROUTE_CONFIGS } from "../constants/routes";

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

export function getRequiredRole(pathname: string): Role | null {
  for (const config of ROUTE_CONFIGS) {
    if (pathname === config.pattern || pathname.startsWith(config.pattern)) {
      return config.minRole;
    }
  }
  return "viewer";
}
