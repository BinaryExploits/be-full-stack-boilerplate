import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCrudDto,
  CrudEntity,
  UpdateCrudDto,
} from '../schemas/crud.schema';

@Injectable()
export class CrudRepository {
  constructor(
    private readonly prisma: PrismaService,
    // @InjectModel(CrudDocument.name)
    // private readonly crudModel: Model<CrudDocument>,
  ) {}

  async find(): Promise<CrudEntity[]> {
    return this.prisma.crud.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // const docs = await this.crudModel.find().sort({ createdAt: -1 }).exec();
    // return docs.map((doc) => this.toEntity(doc));
  }

  async findOne(id: string): Promise<CrudEntity | null> {
    return this.prisma.crud.findUnique({
      where: { id },
    });

    // const doc = await this.crudModel.findById(id).exec();
    // return doc ? this.toEntity(doc) : null;
  }

  async create(data: CreateCrudDto): Promise<CrudEntity> {
    return this.prisma.crud.create({
      data,
    });

    // const doc = await this.crudModel.create(data);
    // return this.toEntity(doc);
  }

  async update(id: string, data: UpdateCrudDto): Promise<CrudEntity | null> {
    return this.prisma.crud.update({
      where: { id },
      data,
    });

    // const doc = await this.crudModel
    //   .findByIdAndUpdate(id, data, { new: true })
    //   .exec();
    // return doc ? this.toEntity(doc) : null;
  }

  async delete(id: string): Promise<CrudEntity | null> {
    return this.prisma.crud.delete({
      where: { id },
    });

    // const doc = await this.crudModel.findByIdAndDelete(id).exec();
    // return doc ? this.toEntity(doc) : null;
  }

  // private toEntity(doc: CrudDocument): CrudEntity {
  //   return {
  //     id: doc._id.toString(),
  //     content: doc.content,
  //     createdAt: doc.createdAt,
  //     updatedAt: doc.updatedAt,
  //   };
  // }
}
