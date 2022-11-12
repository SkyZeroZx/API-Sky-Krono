import { CreateChargueDto } from '../../src/chargue/dto/create-chargue.dto';
import { UpdateChargueDto } from '../../src/chargue/dto/update-chargue.dto';
import { Chargue } from '../../src/chargue/entities/chargue.entity';
import { e2e_config } from '../e2e-config.spec';

const {
  env: { chargues },
} = e2e_config;

export class ChargueMockE2E {
  generateRandomString(length: number): string {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  readonly createChargueDto: CreateChargueDto = {
    description: 'Mock E2E API',
    name: this.generateRandomString(12),
  };

  static readonly updateChargueDto: UpdateChargueDto = {
    codChargue: chargues.chargueUpdate.id,
    name: 'Mock E2E Update',
    description: 'Mock E2E API',
  };

  static readonly listChargue: Chargue[] = [
    {
      id: 1,
      name: 'admin',
      description: 'Awesome Administrator',
    },
    {
      id: 2,
      name: 'Empleado',
      description: 'Descripcion',
    },
    {
      id: 191,
      name: 'd857875388',
      description: '6494f1de0d86e7',
    },
    {
      id: 196,
      name: '0fb32647cecf9a',
      description: 'a35b76273360cc',
    },
  ];
}
