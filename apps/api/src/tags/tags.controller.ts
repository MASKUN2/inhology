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
import { CreateTagDto } from './dto/create-tag.dto';
import { TagsService } from './tags.service';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly tags: TagsService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateTagDto) {
    return this.tags.create(dto);
  }

  @Get()
  findAll(@Headers('authorization') auth?: string) {
    return this.tags.findAll(isAdminToken(auth, this.config));
  }

  @Get(':idOrSlug')
  findOne(
    @Param('idOrSlug') idOrSlug: string,
    @Headers('authorization') auth?: string,
  ) {
    return this.tags.findOne(idOrSlug, isAdminToken(auth, this.config));
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.tags.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.tags.remove(id);
  }
}
