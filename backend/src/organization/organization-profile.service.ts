import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationProfile } from './entities/organization-profile.entity';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Injectable()
export class OrganizationProfileService {
  constructor(
    @InjectRepository(OrganizationProfile)
    private readonly repository: Repository<OrganizationProfile>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async get(): Promise<OrganizationProfile> {
    const existing = await this.repository.find({ take: 1 });
    if (existing.length > 0) return existing[0];
    return this.repository.save(
      this.repository.create({
        companyName: 'My Organization',
        timezone: 'UTC',
      }),
    );
  }

  async update(
    dto: UpdateOrganizationProfileDto,
    actorId?: string,
  ): Promise<OrganizationProfile> {
    const profile = await this.get();
    Object.assign(profile, dto);
    const saved = await this.repository.save(profile);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'OrganizationProfile',
      entityId: saved.id,
      action: 'UPDATE',
      newValue: dto as Record<string, unknown>,
    });
    return saved;
  }
}
