export interface TopIssuingOrganizationDto {
  name: string;
  count: number;
}

export class CertificationAnalyticsDto {
  certifiedCount: number;
  notCertifiedCount: number;
  topIssuingOrganizations: TopIssuingOrganizationDto[];
  expiringSoonCount: number;
}
