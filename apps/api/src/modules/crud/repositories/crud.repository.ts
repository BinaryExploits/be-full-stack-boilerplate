// import { Injectable } from '@nestjs/common';
// import {
//   InjectTransactionHost,
//   TransactionHost,
// } from '@nestjs-cls/transactional';
// import {
//   CreateCrudDto,
//   CrudEntity,
//   UpdateCrudDto,
// } from '../schemas/crud.schema';
// import {
//   PrismaModule,
//   PrismaTransactionAdapter,
// } from '../../prisma/prisma.module';
//
// @Injectable()
// export class CrudRepository {
//   // ======================
//   // Prisma Implementation
//   // ======================
//
//   constructor(
//     @InjectTransactionHost(PrismaModule.name)
//     private readonly prismaTxHost: TransactionHost<PrismaTransactionAdapter>,
//   ) {}
//
//   async find(): Promise<CrudEntity[]> {
//     return this.prismaTxHost.tx.crud.findMany({
//       orderBy: { createdAt: 'desc' },
//     });
//   }
//
//   async findOne(id: string): Promise<CrudEntity | null> {
//     return this.prismaTxHost.tx.crud.findUnique({
//       where: { id },
//     });
//   }
//
//   async create(data: CreateCrudDto): Promise<CrudEntity> {
//     return this.prismaTxHost.tx.crud.create({ data });
//   }
//
//   async update(id: string, data: UpdateCrudDto): Promise<CrudEntity | null> {
//     return this.prismaTxHost.tx.crud.update({
//       where: { id },
//       data,
//     });
//   }
//
//   async delete(id: string): Promise<CrudEntity | null> {
//     return this.prismaTxHost.tx.crud.delete({ where: { id } });
//   }
// }

// import { InjectModel, MongooseModule } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { CrudDocument, CrudEntity } from '../entities/crud.entity';
// import { CreateCrudDto, Crud, UpdateCrudDto } from '../schemas/crud.schema';
// import {
//   InjectTransactionHost,
//   TransactionHost,
// } from '@nestjs-cls/transactional';
// import { TransactionalAdapterMongoose } from '@nestjs-cls/transactional-adapter-mongoose';
//
// export class CrudRepository {
//   constructor(
//     @InjectModel(CrudEntity.name)
//     private readonly crudModel: Model<CrudDocument>,
//     @InjectTransactionHost(MongooseModule.name)
//     private readonly mongoTxHost: TransactionHost<TransactionalAdapterMongoose>,
//   ) {}
//
//   async find(): Promise<Crud[]> {
//     const docs = await this.crudModel
//       .find()
//       .sort({ createdAt: -1 })
//       .session(this.mongoTxHost.tx);
//     return docs.map((doc) => this.toEntity(doc));
//   }
//
//   async findOne(id: string): Promise<Crud | null> {
//     const doc = await this.crudModel.findById(id).session(this.mongoTxHost.tx);
//     return doc ? this.toEntity(doc) : null;
//   }
//
//   async create(data: CreateCrudDto): Promise<Crud> {
//     const doc = new this.crudModel(data);
//     await doc.save({ session: this.mongoTxHost.tx });
//     return this.toEntity(doc);
//   }
//
//   async update(id: string, data: UpdateCrudDto): Promise<Crud | null> {
//     const doc = await this.crudModel
//       .findByIdAndUpdate(id, data, { new: true })
//       .session(this.mongoTxHost.tx);
//     return doc ? this.toEntity(doc) : null;
//   }
//
//   async delete(id: string): Promise<Crud | null> {
//     const doc = await this.crudModel
//       .findByIdAndDelete(id)
//       .session(this.mongoTxHost.tx);
//     return doc ? this.toEntity(doc) : null;
//   }
//
//   private toEntity(doc: CrudDocument): Crud {
//     return {
//       id: doc._id.toString(),
//       content: doc.content,
//       createdAt: doc.createdAt,
//       updatedAt: doc.updatedAt,
//     };
//   }
// }
