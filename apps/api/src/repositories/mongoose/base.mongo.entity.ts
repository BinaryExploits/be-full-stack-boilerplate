import { Types } from 'mongoose';
import { Prop } from '@nestjs/mongoose';

export class MongooseEntity {
  @Prop() createdAt: Date;
  @Prop() updatedAt: Date;

  _id?: Types.ObjectId;
}
