import { Test, TestingModule } from '@nestjs/testing';
import { AuthMockService } from '../../../auth/auth.mock.spec';
import { User } from '../user.decorator';

describe('User Role Guard ', () => {
  let executionContextMock: any = {
    getHandler: jest.fn(),
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn().mockImplementation(() => {
        return { user: AuthMockService.userCreate };
      }),
    })),
  };

  let executionContextMockError: any = {
    getHandler: jest.fn(),
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn().mockImplementation(() => {
        return { user: undefined };
      }),
    })),
  };

  it('Validamos User Decorator', async () => {
    const userMockDecorator = User('admin', executionContextMock);
    expect(userMockDecorator).toBeUndefined();
    const userMockDecoratorNoRole = User('', executionContextMock);
  });
});
