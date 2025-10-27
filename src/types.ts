import type { Database } from './db/database.types';

/**
 * Represents the shape of a symptom record as it is stored in the database.
 * This is the base type from which all other symptom-related DTOs and command models are derived.
 */
export type Symptom = Database['public']['Tables']['symptoms']['Row'];

/**
 * Represents the shape of a symptom record for an insert operation.
 */
export type SymptomInsert = Database['public']['Tables']['symptoms']['Insert'];

/**
 * Data Transfer Object for creating a new symptom.
 * It includes all the necessary fields that a user must provide.
 * The `user_id` is excluded as it will be inferred from the authenticated session on the server.
 */
export type CreateSymptomCommand = Omit<
	SymptomInsert,
	'id' | 'created_at' | 'user_id'
> & {
	occurred_at: string;
};

/**
 * Data Transfer Object for updating an existing symptom.
 * All fields are optional, allowing for partial updates.
 */
export type UpdateSymptomCommand = Partial<CreateSymptomCommand>;

/**
 * Data Transfer Object for representing a symptom in a list view.
 * It omits the `user_id` to avoid sending redundant information to the client.
 */
export type SymptomDto = Omit<Symptom, 'user_id'>;

/**
 * Data Transfer Object for representing the full details of a symptom.
 * This type includes all fields from the database entity and is used when a single symptom's complete data is required.
 */
export type SymptomDetailsDto = Symptom;

/**
 * Data Transfer Object for the response of a successful user account deletion.
 */
export type UserDeletionResponseDto = {
	message: string;
};
