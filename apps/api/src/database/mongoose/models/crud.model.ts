import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'crud' })
export class CrudDocument extends Document {
  @Prop({ required: true })
  content: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CrudSchema = SchemaFactory.createForClass(CrudDocument);
