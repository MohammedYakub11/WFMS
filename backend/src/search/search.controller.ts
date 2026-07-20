import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PermissionCode } from '../common/enums/permission-code.enum';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @RequirePermissions(PermissionCode.SEARCH_EMPLOYEES)
  @Get('workforce')
  async searchWorkforce(@Query() query: SearchQueryDto) {
    return this.searchService.searchWorkforce(query);
  }

  @RequirePermissions(PermissionCode.SEARCH_EMPLOYEES)
  @Get('metadata')
  async getSearchMetadata() {
    return this.searchService.getSearchMetadata();
  }
}
