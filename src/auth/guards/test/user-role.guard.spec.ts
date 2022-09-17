import { Test, TestingModule } from '@nestjs/testing';
import { AuthMockService } from '../../auth.mock.spec';
import { Reflector } from '@nestjs/core';
import { UserRoleGuard } from '../user-role.guard';
import { BadRequestException, ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('User Role Guard ', () => {
  let userRoleGuard: UserRoleGuard;
  let mockService: AuthMockService = new AuthMockService();
  let reflectorMock: Reflector;
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

  beforeEach(async () => {
    reflectorMock = new Reflector();
    userRoleGuard = new UserRoleGuard(reflectorMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userRoleGuard).toBeDefined();
  });

  it('Validamos canActivate', async () => {
    const { role, username } = AuthMockService.userCreate;
    const spyReflectorGet = jest.spyOn(reflectorMock, 'get').mockImplementation(() => {
      return '';
    });
    const canActivate = await userRoleGuard.canActivate(executionContextMock);
    expect(canActivate).toBeTruthy();
    expect(spyReflectorGet).toBeCalled();

    spyReflectorGet.mockImplementation(() => {
      return role;
    });

    const canActivateReq = await userRoleGuard.canActivate(executionContextMock);
    expect(canActivateReq).toBeTruthy();
    // Validamos para el caso que retorne un usuario undefined
    expect(() => {
      userRoleGuard.canActivate(executionContextMockError);
    }).toThrowError(new BadRequestException('User not found'));

    const invalidRole = 'No soy un rol valido';
    spyReflectorGet.mockImplementation(() => {
      return invalidRole;
    });

    // Validamos para el caso que retorne un usuario undefined
    expect(() => {
      userRoleGuard.canActivate(executionContextMock);
    }).toThrowError(new ForbiddenException(`User ${username} need a valid role: [${invalidRole}]`));
  });
});
