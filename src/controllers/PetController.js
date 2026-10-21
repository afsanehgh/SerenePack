const petService = require('../services/PetService');

class PetController {
  async create(req, res) {
    const pet = await petService.create(req.user.id, req.body);
    return res.status(201).json(pet);
  }

  async read(req, res) {
    const { id } = req.params;
    const pets = id
      ? await petService.getByOwner(id, req.user.id)
      : await petService.listByOwner(req.user.id);
    return res.status(200).json(pets);
  }

  async destroy(req, res) {
    await petService.delete(req.params.id, req.user.id);
    return res.status(200).json({
      message: 'Pet successfully deleted.',
    });
  }

  async update(req, res) {
    const pet = await petService.update(req.params.id, req.user.id, req.body);
    return res.status(200).json(pet);
  }
}

module.exports = new PetController();
