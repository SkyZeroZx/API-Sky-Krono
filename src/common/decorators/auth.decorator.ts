import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserRoleGuard } from '../../auth/guards/user-role.guard';
import { RoleProtected } from './role-protected.decorator';

export function Auth(role: string) {
  return applyDecorators(RoleProtected(role), UseGuards(JwtAuthGuard), UseGuards(UserRoleGuard));
}
