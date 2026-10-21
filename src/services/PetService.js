const PetModel = require('../models/PetModel');
const AppError = require('../errors/AppError');

class PetService {
  async create(ownerId, petData) {
    return PetModel.create({ ...petData, owner: ownerId });
  }

  async listByOwner(ownerId) {
    return PetModel.find({ owner: ownerId });
  }

  async getByOwner(id, ownerId) {
    const pet = await PetModel.findOne({ _id: id, owner: ownerId });
    if (!pet) throw new AppError(404, 'PET_NOT_FOUND', 'Pet not found.');
    return pet;
  }

  async update(id, ownerId, petData) {
    const pet = await this.getByOwner(id, ownerId);
    return pet.set(petData).save();
  }

  async delete(id, ownerId) {
    const pet = await this.getByOwner(id, ownerId);
    await pet.deleteOne();
  }
}

module.exports = new PetService();
