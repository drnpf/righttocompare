import Phone, { IPhone } from "../models/Phone";

/**
 * Retrieves all phones from MongoDB. It excludes all internal
 * MongoDB fields like _id and __v.
 * @returns An array of phone documents
 */
export const findAllPhones = async (): Promise<IPhone[]> => {
  return await Phone.find().select("-_id -__v");
};

/**
 * Finds a single phone by its ID.
 * @param id The unique string ID of the phone
 * @returns The resultant phone document
 */
export const findPhoneById = async (id: string): Promise<IPhone | null> => {
  const phone = await Phone.findOne({ id: id });
  return phone;
};

/**
 * Creates a new phone document in MongoDB
 * @param phoneData The phone object to be saved
 * @returns The newly created phone document
 */
export const createNewPhone = async (phoneData: Partial<IPhone>): Promise<IPhone> => {
  const phone = new Phone(phoneData);
  return await phone.save();
};

/**
 * Updates an existing phone by its ID
 * @param id The unique string ID of the phone
 * @param updateData An object containing the fields to update
 * @returns The updated phone document
 */
export const updatePhoneById = async (id: string, updateData: Partial<IPhone>): Promise<IPhone | null> => {
  const updatedPhone = await Phone.findOneAndUpdate({ id: id }, updateData, { new: true, runValidators: true });
  return updatedPhone;
};

/**
 * Deletes a phone from the database by its ID
 * @param id The unique string ID of the phone
 * @returns True if phone was deleted; false, otherwise
 */
export const deletePhoneById = async (id: string): Promise<boolean> => {
  const result = await Phone.findOneAndDelete({ id: id });
  return !!result; // Returns true if document was found and deleted
};
