const { z } = require('zod');
const mongoose = require('mongoose');
const validateRequest = require('../middleware/validateRequest');

const petBody = z
  .object({
    petName: z
      .string({ required_error: 'The pet name is required' })
      .trim()
      .min(2, 'Pet name must be at least 2 characters long.')
      .max(30, 'Pet name cannot exceed 30 characters.'),
    description: z
      .string({ required_error: 'The description is required' })
      .trim()
      .min(50, 'Description must be at least 50 characters long.')
      .max(200, 'Description cannot exceed 200 characters.'),
  })
  .strict();

const petId = z
  .string()
  .refine(mongoose.isValidObjectId, 'The ID is not valid.');

const create = validateRequest({ body: petBody });

const destroy = validateRequest({
  params: z.object({ id: petId }).strict(),
});

const read = validateRequest({
  params: z
    .object({
      id: petId.optional(),
    })
    .strict(),
});

const update = validateRequest({
  params: z.object({ id: petId }).strict(),
  body: petBody,
});

module.exports = {
  create,
  destroy,
  read,
  update,
};
