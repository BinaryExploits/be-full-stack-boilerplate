import { Document } from 'mongoose';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class MongoDbEntity extends Document {
  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
