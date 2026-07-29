import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

// Single-row table: exactly one OrganizationProfile record is seeded by migration
// and only ever updated, never created/deleted through the API.
@Entity('organization_profile')
export class OrganizationProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  companyName: string;

  @Column({ name: 'logo_url', type: 'varchar', nullable: true, length: 500 })
  logoUrl: string | null;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  address: string | null;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  email: string | null;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  website: string | null;

  @Column({ type: 'varchar', length: 100, default: 'UTC' })
  timezone: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
