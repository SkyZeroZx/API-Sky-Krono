import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { Type } from './entities/type.entity';

export class TypeServiceMock {
  public create = jest.fn().mockReturnThis();
  public remove = jest.fn().mockReturnThis();
  public update = jest.fn().mockReturnThis();
  public find = jest.fn().mockReturnThis();
  public save = jest.fn().mockReturnThis();
  public delete = jest.fn().mockReturnThis();
  public findAll = jest.fn().mockReturnThis();
  public static readonly type: Type = {
    codType: 1,
    description: 'Test Description 1',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderColor: 'rgba(255,255,255,0.5)',
    start: new Date(),
    end: new Date(),
    display: 'BLOCK',
  };

  public static readonly createTypeDto: CreateTypeDto = {
    description: 'Test Description 1',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderColor: 'rgba(255,255,255,0.5)',
    start: new Date(),
    end: new Date(),
  };

  public static readonly updateTypeDto: UpdateTypeDto = {
    codType: 1,
    description: 'Test Description 1',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderColor: 'rgba(255,255,255,0.5)',
    start: new Date(),
    end: new Date(),
  };

  public static readonly listType: Type[] = [
    {
      codType: 1,
      description: 'Test Description 1',
      backgroundColor: 'rgba(255,255,255,0.5)',
      borderColor: 'rgba(255,255,255,0.5)',
      start: new Date(),
      end: new Date(),
      display: 'BLOCK',
    },
    {
      codType: 1,
      description: 'Test Description 2',
      backgroundColor: 'rgba(255,255,255,0.5)',
      borderColor: 'rgba(255,255,255,0.5)',
      start: new Date(),
      end: new Date(),
      display: 'BLOCK 2',
    },
  ];
}
