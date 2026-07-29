export interface BusinessUnit {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Department {
  id: string;
  departmentCode: string;
  name: string;
  description?: string | null;
  businessUnitId?: string | null;
  businessUnit?: BusinessUnit | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Designation {
  id: string;
  designationCode: string;
  name: string;
  level: number;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type LocationType = 'office' | 'branch' | 'remote';

export interface Location {
  id: string;
  locationCode: string;
  name: string;
  type: LocationType;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  timezone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
  locationId?: string | null;
  location?: Location | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface OrganizationProfile {
  id: string;
  companyName: string;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  timezone: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  id: string;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
  passwordExpiryDays: number;
  passwordHistoryCount: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  idleTimeoutMinutes: number;
  maxConcurrentSessions: number;
  theme: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  workingDays: string[];
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CreateBusinessUnitInput = Pick<BusinessUnit, 'name'> & Partial<Pick<BusinessUnit, 'description' | 'isActive'>>;
export type UpdateBusinessUnitInput = Partial<CreateBusinessUnitInput>;

export type CreateDepartmentInput = Pick<Department, 'departmentCode' | 'name'> &
  Partial<Pick<Department, 'description' | 'businessUnitId' | 'isActive'>>;
export type UpdateDepartmentInput = Partial<CreateDepartmentInput>;

export type CreateDesignationInput = Pick<Designation, 'designationCode' | 'name'> &
  Partial<Pick<Designation, 'level' | 'description' | 'isActive'>>;
export type UpdateDesignationInput = Partial<CreateDesignationInput>;

export type CreateLocationInput = Pick<Location, 'locationCode' | 'name'> &
  Partial<Pick<Location, 'type' | 'address' | 'city' | 'country' | 'timezone' | 'isActive'>>;
export type UpdateLocationInput = Partial<CreateLocationInput>;

export type CreateHolidayInput = Pick<Holiday, 'name' | 'date'> & Partial<Pick<Holiday, 'isRecurring' | 'locationId'>>;
export type UpdateHolidayInput = Partial<CreateHolidayInput>;

export type UpdateOrganizationProfileInput = Partial<
  Pick<OrganizationProfile, 'companyName' | 'logoUrl' | 'address' | 'phone' | 'email' | 'website' | 'timezone'>
>;

export type UpdateOrganizationSettingsInput = Partial<Omit<OrganizationSettings, 'id' | 'updatedAt'>>;
