import { ApplicationController } from './classes/ApplicationController';

async function main() {
  const controller = new ApplicationController();
  await controller.start();
}

main().catch(error => {
  console.error('Произошла ошибка:', error);
  process.exit(1);
});

