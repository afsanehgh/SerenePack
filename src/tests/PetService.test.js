const PetModel = require('../models/PetModel');
const petService = require('../services/PetService');

jest.mock('../models/PetModel');

describe('PetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('always assigns the owner supplied by the authenticated request', async () => {
    const pet = { petName: 'Snowy' };
    PetModel.create.mockResolvedValue(pet);

    await expect(
      petService.create('owner-1', { petName: 'Snowy' }),
    ).resolves.toBe(pet);
    expect(PetModel.create).toHaveBeenCalledWith({
      petName: 'Snowy',
      owner: 'owner-1',
    });
  });

  it('lists pets scoped to their owner', async () => {
    PetModel.find.mockResolvedValue([]);

    await petService.listByOwner('owner-1');

    expect(PetModel.find).toHaveBeenCalledWith({ owner: 'owner-1' });
  });

  it('only finds pets belonging to the requesting owner', async () => {
    const pet = { _id: 'pet-1' };
    PetModel.findOne.mockResolvedValue(pet);

    await expect(petService.getByOwner('pet-1', 'owner-1')).resolves.toBe(pet);
    expect(PetModel.findOne).toHaveBeenCalledWith({
      _id: 'pet-1',
      owner: 'owner-1',
    });
  });

  it('uses the same owner-scoped lookup before updating a pet', async () => {
    const updatedPet = { _id: 'pet-1' };
    const pet = {
      set: jest.fn().mockReturnThis(),
      save: jest.fn().mockResolvedValue(updatedPet),
    };
    PetModel.findOne.mockResolvedValue(pet);

    await expect(
      petService.update('pet-1', 'owner-1', { petName: 'Snowy' }),
    ).resolves.toBe(updatedPet);
    expect(pet.set).toHaveBeenCalledWith({ petName: 'Snowy' });
  });

  it('uses the same owner-scoped lookup before deleting a pet', async () => {
    const pet = { deleteOne: jest.fn().mockResolvedValue() };
    PetModel.findOne.mockResolvedValue(pet);

    await petService.delete('pet-1', 'owner-1');

    expect(pet.deleteOne).toHaveBeenCalledTimes(1);
  });

  it('returns the same not-found error for read, update, and delete', async () => {
    PetModel.findOne.mockResolvedValue(null);

    await expect(
      petService.getByOwner('pet-1', 'owner-1'),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'PET_NOT_FOUND',
    });
    await expect(
      petService.update('pet-1', 'owner-1', {}),
    ).rejects.toMatchObject({ code: 'PET_NOT_FOUND' });
    await expect(petService.delete('pet-1', 'owner-1')).rejects.toMatchObject({
      code: 'PET_NOT_FOUND',
    });
  });
});
