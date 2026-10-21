const chalk = require('chalk');

function ask(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function askValidated(rl, prompt, label, minLength, maxLength) {
  let value;
  let isValid;
  do {
    value = (await ask(rl, prompt)).trim();
    isValid = value.length >= minLength && value.length <= maxLength;
    if (!isValid) {
      console.error(
        chalk.red(
          `\nError: ${label} must be between ${minLength} and ${maxLength} characters. Please try again.`,
        ),
      );
    }
    if (isValid) return value;
  } while (!isValid);
}

function askPetName(rl, label = 'pet name') {
  return askValidated(
    rl,
    `\nPet name --> Must be between 2 and 30 characters long\n✏️  Enter ${label}: `,
    'Pet name',
    2,
    30,
  );
}

function askPetDescription(rl, label = 'pet description') {
  return askValidated(
    rl,
    `\nPet description --> Must be between 50 and 200 characters long.\n✏️  Enter ${label}: `,
    'Pet description',
    50,
    200,
  );
}

module.exports = { ask, askPetName, askPetDescription };
