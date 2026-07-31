/**
 * Utility to extract user identity claims from API Gateway Cognito JWT Authorizer.
 * Provides access to authenticated user metadata (sub, email, username, groups).
 */
export const getUserContext = (event) => {
  const claims = event.requestContext?.authorizer?.jwt?.claims;
  if (!claims) {
    return null;
  }

  return {
    userId: claims.sub,
    email: claims.email || null,
    username: claims['cognito:username'] || claims.username || claims.email || null,
    groups: Array.isArray(claims['cognito:groups'])
      ? claims['cognito:groups']
      : claims['cognito:groups']
      ? [claims['cognito:groups']]
      : [],
  };
};

/**
 * Checks if a user possesses a specific Cognito group role or is an Admin.
 */
export const hasRole = (userContext, roleName) => {
  if (!userContext || !Array.isArray(userContext.groups)) {
    return false;
  }
  return userContext.groups.includes(roleName) || userContext.groups.includes('Admins');
};

export const isOrganizer = (userContext) => hasRole(userContext, 'Organizers');
export const isCoach = (userContext) => hasRole(userContext, 'Coaches');
export const isPlayer = (userContext) => hasRole(userContext, 'Players');
export const isAdmin = (userContext) => hasRole(userContext, 'Admins');
