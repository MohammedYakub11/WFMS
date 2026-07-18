import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('workforce')
  async searchWorkforce(@Query() query: SearchQueryDto) {
    return this.searchService.searchWorkforce(query);
  }

  @Get('metadata')
  async getSearchMetadata() {
    return this.searchService.getSearchMetadata();
  }
}
