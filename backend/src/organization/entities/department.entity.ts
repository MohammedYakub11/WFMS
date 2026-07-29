import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BusinessUnit } from './business-unit.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_department_code')
  @Column({
    name: 'department_code',
    type: 'varchar',
    unique: true,
    length: 50,
  })
  departmentCode: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  description: string;

  @Index('idx_department_business_unit')
  @Column({ name: 'business_unit_id', type: 'uuid', nullable: true })
  businessUnitId: string | null;

  @ManyToOne(() => BusinessUnit, (businessUnit) => businessUnit.departments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'business_unit_id' })
  businessUnit: BusinessUnit | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
