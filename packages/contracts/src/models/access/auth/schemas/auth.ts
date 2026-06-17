export interface AccessTokenClaims {
  readonly sub: string;
  readonly organizationId: string;
  readonly sessionId: string;
  readonly email: string;
  readonly roleCodes: readonly string[];
  readonly permissionKeys: readonly string[];
  readonly type: 'access';
  readonly iat: number;
  readonly exp: number;
}
