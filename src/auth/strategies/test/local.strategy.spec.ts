import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthMockService } from '../../auth.mock.spec';
import { AuthService } from '../../auth.service';
import { LocalStrategy } from '../local.strategy';

describe('Local Strategy ', () => {
  let localStrategy: LocalStrategy;
  let authService: AuthService;
  let mockService: AuthMockService = new AuthMockService();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule],
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(localStrategy).toBeDefined();
  });

  it('Validamos validateUser', async () => {
    const email = 'test@example@mail.com';
    const password = '123456';
    const spyValidateUser = jest.spyOn(authService, 'validateUser').mockImplementation(async () => {
      return null;
    });
    const localStrategyValidateUser = await localStrategy.validate(email, password);
    expect(spyValidateUser).toHaveBeenCalledWith(email, password);
    expect(localStrategyValidateUser).toBeNull();
  });
});
