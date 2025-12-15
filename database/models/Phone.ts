import mongoose from "mongoose";

export interface IPhone {
  name: string;
  brand: string;
  price?: number;
  specs: Record<string, any>;
  createdAt: Date;
}

const PhoneSchema = new mongoose.Schema<IPhone>({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number },
  specs: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

// TODO: add variants, benchmarks, carrier bands

export const Phone = mongoose.model<IPhone>("Phone", PhoneSchema);