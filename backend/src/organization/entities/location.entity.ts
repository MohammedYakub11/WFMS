import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export type LocationType = 'office' | 'branch' | 'remote';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_location_code')
  @Column({ name: 'location_code', type: 'varchar', unique: true, length: 50 })
  locationCode: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'type', type: 'varchar', length: 20, default: 'office' })
  type: LocationType;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  address: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  city: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  country: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  timezone: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
