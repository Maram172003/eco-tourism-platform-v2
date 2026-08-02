import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProviderServicesDocument = ProviderServices & Document;

@Schema({ collection: 'provider_services', timestamps: true })
export class ProviderServices {
  @Prop({ required: true, index: true })
  venue_id!: string;

  @Prop({ required: true, index: true })
  provider_id!: string;

  @Prop({ type: [String], default: [] })
  offered_services!: string[];

  @Prop({ type: [String], default: [] })
  eco_practices!: string[];

  @Prop({ type: [String], default: [] })
  target_travelers!: string[];
}

export const ProviderServicesSchema =
  SchemaFactory.createForClass(ProviderServices);
