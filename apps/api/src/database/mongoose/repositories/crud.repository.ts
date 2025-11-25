import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrudDocument } from '../models/crud.model';
import { CrudRepository } from '../../interfaces/crud.repository';
import {
  CrudEntity,
  CreateCrudDto,
  UpdateCrudDto,
} from '../../../schemas/crud.schema';

@Injectable()
export class CrudMongooseRepository extends CrudRepository {
  constructor(
    @InjectModel(CrudDocument.name)
    private readonly crudModel: Model<CrudDocument>,
  ) {
    super();
  }

  private toEntity(doc: CrudDocument): CrudEntity {
    return {
      id: doc._id.toString(),
      content: doc.content,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async find(): Promise<CrudEntity[]> {
    const docs = await this.crudModel.find().sort({ createdAt: -1 }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findOne(id: string): Promise<CrudEntity | null> {
    const doc = await this.crudModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async create(data: CreateCrudDto): Promise<CrudEntity> {
    const doc = await this.crudModel.create(data);
    return this.toEntity(doc);
  }

  async update(id: string, data: UpdateCrudDto): Promise<CrudEntity | null> {
    const doc = await this.crudModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  async delete(id: string): Promise<CrudEntity | null> {
    const doc = await this.crudModel.findByIdAndDelete(id).exec();
    return doc ? this.toEntity(doc) : null;
  }
}
