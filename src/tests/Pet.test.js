const PetController = require('../controllers/PetController');
const petService = require('../services/PetService');

jest.mock('../services/PetService');

describe('PetController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the pet created by the service for the authenticated owner', async () => {
    const req = {
      body: { petName: 'Snowy', description: 'A friendly pet.' },
      user: { id: 'user-1' },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const pet = { ...req.body, owner: 'user-1' };
    petService.create.mockResolvedValue(pet);

    await PetController.create(req, res);

    expect(petService.create).toHaveBeenCalledWith('user-1', req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(pet);
  });

  it('lists pets for the authenticated owner', async () => {
    const req = { params: {}, user: { id: 'user-1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const pets = [{ petName: 'Snowy' }];
    petService.listByOwner.mockResolvedValue(pets);

    await PetController.read(req, res);

    expect(petService.listByOwner).toHaveBeenCalledWith('user-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(pets);
  });

  it('updates and returns an owned pet', async () => {
    const req = {
      params: { id: 'pet-1' },
      body: { petName: 'Snowy', description: 'A friendly pet.' },
      user: { id: 'user-1' },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const pet = { _id: 'pet-1', ...req.body };
    petService.update.mockResolvedValue(pet);

    await PetController.update(req, res);

    expect(petService.update).toHaveBeenCalledWith('pet-1', 'user-1', req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(pet);
  });

  it('deletes an owned pet and returns the success message', async () => {
    const req = {
      params: { id: 'pet-1' },
      user: { id: 'user-1' },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    petService.delete.mockResolvedValue();

    await PetController.destroy(req, res);

    expect(petService.delete).toHaveBeenCalledWith('pet-1', 'user-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Pet successfully deleted.',
    });
  });

  it('passes service failures to centralized error handling', async () => {
    const req = {
      body: {},
      user: { id: 'user-1' },
    };
    const error = new Error('Database error');
    petService.create.mockRejectedValue(error);

    await expect(PetController.create(req, {})).rejects.toBe(error);
  });
});
