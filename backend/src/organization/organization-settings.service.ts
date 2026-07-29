import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationSettings } from './entities/organization-settings.entity';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Injectable()
export class OrganizationSettingsService {
  constructor(
    @InjectRepository(OrganizationSettings)
    private readonly repository: Repository<OrganizationSettings>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async get(): Promise<OrganizationSettings> {
    const existing = await this.repository.find({ take: 1 });
    if (existing.length > 0) return existing[0];
    return this.repository.save(this.repository.create({}));
  }

  async update(
    dto: UpdateOrganizationSettingsDto,
    actorId?: string,
  ): Promise<OrganizationSettings> {
    const settings = await this.get();
    Object.assign(settings, dto);
    const saved = await this.repository.save(settings);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'OrganizationSettings',
      entityId: saved.id,
      action: 'UPDATE',
      newValue: dto as Record<string, unknown>,
    });
    return saved;
  }
}
