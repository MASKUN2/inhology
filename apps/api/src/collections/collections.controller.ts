import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminGuard } from '../auth/admin.guard';
import { isAdminToken } from '../auth/is-admin';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { ReorderCollectionsDto } from './dto/reorder-collections.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Controller('collections')
export class CollectionsController {
  constructor(
    private readonly collections: CollectionsService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateCollectionDto) {
    return this.collections.create(dto);
  }

  @Get()
  findAll(@Headers('authorization') auth?: string) {
    return this.collections.findAll(isAdminToken(auth, this.config));
  }

  @Get(':idOrSlug')
  findOne(
    @Param('idOrSlug') idOrSlug: string,
    @Headers('authorization') auth?: string,
  ) {
    return this.collections.findOne(idOrSlug, isAdminToken(auth, this.config));
  }

  // Declared before ':id' so "order" is not taken for a collection id.
  @Patch('order')
  @UseGuards(AdminGuard)
  reorder(@Body() dto: ReorderCollectionsDto) {
    return this.collections.reorder(dto.ids);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    return this.collections.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.collections.remove(id);
  }
}
