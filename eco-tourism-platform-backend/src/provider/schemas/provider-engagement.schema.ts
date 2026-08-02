import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProviderEngagementDocument = ProviderEngagement & Document;

@Schema({ collection: 'provider_engagement', timestamps: true })
export class ProviderEngagement {
  @Prop({ required: true, index: true })
  user_id!: string;

  @Prop({ default: 0 })
  sustainability_score!: number;

  @Prop({
    type: [{ label: String, obtained_at: Date }],
    default: [],
  })
  badges!: { label: string; obtained_at: Date }[];

  @Prop({ default: 0 })
  total_reservations!: number;

  @Prop({ default: 0 })
  feedback_received!: number;

  @Prop({ default: 0 })
  venues_count!: number;
}

export const ProviderEngagementSchema =
  SchemaFactory.createForClass(ProviderEngagement);
