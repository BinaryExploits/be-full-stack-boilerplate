import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongooseEntity } from '../../../repositories/mongoose/base.mongo.entity';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'crud', timestamps: true })
export class CrudEntity extends MongooseEntity {
  @Prop({ required: true })
  content: string;
}

export type CrudDocument = HydratedDocument<CrudEntity>;
export const CrudSchema = SchemaFactory.createForClass(CrudEntity);
