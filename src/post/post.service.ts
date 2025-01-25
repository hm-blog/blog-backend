import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ORDER, ResponseCreateDTO } from '../common/common.type';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}
  async create(createPostDto: CreatePostDto): Promise<ResponseCreateDTO> {
    const { id } = await this.postRepository.save(createPostDto);
    return { id };
  }

  async findAll(): Promise<PostEntity[]> {
    return await this.postRepository.find({ order: { postDate: ORDER.DESC } });
  }

  async findOne(id: string): Promise<PostEntity | null> {
    return await this.postRepository.findOne({ where: { id } });
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<void> {
    await this.postRepository.update(id, updatePostDto);
    return;
  }

  async remove(id: string): Promise<void> {
    await this.postRepository.delete(id);
    return;
  }
}
