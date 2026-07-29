export interface DepartmentDesignationCountDto {
  department: string;
  designation: string;
  count: number;
}

export interface LocationCountDto {
  location: string;
  count: number;
}

export class WorkforceDistributionDto {
  byDepartmentDesignation: DepartmentDesignationCountDto[];
  byLocation: LocationCountDto[];
}
