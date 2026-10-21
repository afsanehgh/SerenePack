const readline = require('readline');
const petRequester = require('./services/PetRequesterService');
const chalk = require('chalk');
const formatError = require('./services/formatError');
const { ask, askPetName, askPetDescription } = require('./prompts/petPrompts');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function createPet() {
  try {
    const petName = await askPetName(rl);
    const description = await askPetDescription(rl);
    await petRequester.createPet({ petName, description });
    console.log(chalk.green('\n✅ Pet registered successfully!'));
  } catch (error) {
    console.error(chalk.red('Error registering pet:'), formatError(error));
  } finally {
    rl.close();
  }
}

async function updatePet() {
  try {
    const id = await ask(rl, 'Enter pet ID to edit: ');
    const petName = await askPetName(rl, 'new pet name');
    const description = await askPetDescription(rl, 'new pet description');
    await petRequester.updatePet(id, { petName, description });
    console.log(chalk.green('\n✅ Pet updated successfully!'));
  } catch (error) {
    console.error('Error updating pet:', formatError(error));
  } finally {
    rl.close();
  }
}

async function getPets() {
  try {
    const pets = await petRequester.getAllPets();
    console.log('Registered pets:', pets);
  } catch (error) {
    console.error('Error fetching pets:', formatError(error));
  } finally {
    rl.close();
  }
}

async function deletePet() {
  try {
    const id = await ask(rl, 'Enter pet ID to delete: ');
    await petRequester.deletePet(id);
    console.log(chalk.green('\n✅ Pet deleted successfully!'));
  } catch (error) {
    console.error(chalk.red('Error deleting pet:'), formatError(error));
  } finally {
    rl.close();
  }
}

function start() {
  console.log(
    chalk.bold.magenta('\nPet Register - Serene Pack (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧\n'),
  );

  console.log('1- Register a pet');
  console.log('2- Edit a pet');
  console.log('3- View all pets');
  console.log('4- Delete a pet');

  rl.question('\nEnter your choice (1-4): ', (choice) => {
    switch (choice) {
      case '1':
        createPet();
        break;
      case '2':
        updatePet();
        break;
      case '3':
        getPets();
        break;
      case '4':
        deletePet();
        break;
      default:
        console.log('Invalid choice.');
        rl.close();
    }
  });
}

start();
