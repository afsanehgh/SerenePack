const {
  askPetName,
  askPetDescription,
} = require('../client/prompts/petPrompts');

function createReadlineMock(inputs) {
  return {
    question: jest.fn((prompt, callback) => callback(inputs.shift())),
  };
}

describe('Pet CLI prompts', () => {
  it('trims a valid pet name before returning it', async () => {
    const rl = createReadlineMock(['  Snowy  ']);

    await expect(askPetName(rl)).resolves.toBe('Snowy');
    expect(rl.question).toHaveBeenCalledTimes(1);
  });

  it('re-prompts for invalid names and descriptions', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    const rl = createReadlineMock(['S', 'Snowy', 'too short', 'A'.repeat(50)]);

    await expect(askPetName(rl)).resolves.toBe('Snowy');
    await expect(askPetDescription(rl)).resolves.toBe('A'.repeat(50));
    expect(rl.question).toHaveBeenCalledTimes(4);
    expect(log).toHaveBeenCalledTimes(2);
    log.mockRestore();
  });
});
