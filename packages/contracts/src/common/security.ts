export interface AuthClaims {
  sub: string;
  tenantId: string;
  email: string;

  organizationId?: string | null;

  sessionId?: string;
  iat: number;
  exp: number;
}
