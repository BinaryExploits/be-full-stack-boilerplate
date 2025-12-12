import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongooseBaseEntity } from '../../../../repositories/mongoose/mongoose.base-entity';

@Schema({ collection: 'crud', timestamps: true })
export class CrudMongooseEntity extends MongooseBaseEntity {
  @Prop({ required: true })
  content: string;
}

export const CrudMongooseSchema =
  SchemaFactory.createForClass(CrudMongooseEntity);
