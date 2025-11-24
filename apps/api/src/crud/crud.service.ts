import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Crud } from './crud.schema.mongo';

@Injectable()
export class CrudService {
  constructor(
    @InjectModel(Crud.name) private readonly crudModel: Model<Crud>,
  ) {}

  async createCrud(content: string): Promise<Crud> {
    return await this.crudModel.create({ content });
  }

  async findAll(): Promise<Crud[]> {
    return this.crudModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Crud> {
    const crud = await this.crudModel.findById(id).exec();
    if (!crud) throw new NotFoundException(`Crud with id ${id} not found`);
    return crud;
  }

  async update(id: string, updatedContent: string): Promise<Crud> {
    const updated = await this.crudModel
      .findByIdAndUpdate(
        id,
        { content: updatedContent, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!updated) throw new NotFoundException(`Crud with id ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<Crud> {
    const deleted = await this.crudModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Crud with id ${id} not found`);
    return deleted;
  }
}
