import { CreateTypeDto } from '../../src/type/dto/create-type.dto';

export class TypeE2EMock {
  static createType: CreateTypeDto = {
    description: 'E2E Testing Super Test',
    backgroundColor: '#FFFF',
    borderColor: '#FFFF',
    start: '12:12',
    end: '12:12',
  };
}
