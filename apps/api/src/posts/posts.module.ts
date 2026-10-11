import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TagsModule } from '../tags/tags.module';

// PrismaService is available globally via PrismaModule (@Global).
@Module({
  imports: [TagsModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
