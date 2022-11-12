import { CreateLicenceDto } from '../../src/licence/dto/create-licence.dto';
import { UpdateLicenceDto } from '../../src/licence/dto/update-licence.dto';
import { e2e_config } from '../e2e-config.spec';

const {
  users: {
    userUpdate: { id },
  },
  licences: {
    lincenceUpdate: { id: licenceId },
  },
} = e2e_config.env;
export class LicenceE2EMock {
  static readonly createLicenceDto: CreateLicenceDto = {
    description: 'MOCK E2E API',
    dateRange: [new Date().toDateString(), new Date().toString()],
    codUser: id,
  };

  static readonly updateLicenceDto: UpdateLicenceDto = {
    id: licenceId,
    description: 'MOCK E2E API',
    dateRange: [new Date().toDateString(), new Date().toString()],
  };
}
