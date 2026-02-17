import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongooseBaseEntity } from '../../../../repositories/mongoose/mongoose.base-entity';

@Schema({ collection: 'global_crud', timestamps: true })
export class GlobalCrudMongooseEntity extends MongooseBaseEntity {
  @Prop({ required: true })
  content: string;
}

export const GlobalCrudMongooseSchema =
  SchemaFactory.createForClass(GlobalCrudMongooseEntity);
