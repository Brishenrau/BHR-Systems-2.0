import { AccessRepository } from '../repositories/AccessRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ModuleRepository } from '../repositories/ModuleRepository';
import type { BHR_ACCESSMDL, BHR_PAYNUMBER, BHR_MODULCODE } from '../types/database.types';

export class AccessService {
  private accessRepository = new AccessRepository();
  private userRepository = new UserRepository();
  private moduleRepository = new ModuleRepository();

  /**
   * Get user access information with user details
   */
  async getUserAccess(payNumber: string): Promise<{
    user: BHR_PAYNUMBER;
    access: BHR_ACCESSMDL | null;
    modules: BHR_MODULCODE[];
  }> {
    const user = await this.userRepository.findByPayNumber(payNumber);
    if (!user) {
      throw new Error('User not found');
    }

    const access = await this.accessRepository.findByPayNumber(payNumber);
    const modules = await this.moduleRepository.findAllActive();

    return {
      user,
      access,
      modules: modules.sort((a, b) => a.MOD_MODULSIRI - b.MOD_MODULSIRI),
    };
  }

  /**
   * Update user module access
   */
  async updateUserAccess(
    payNumber: string,
    accessString: string,
    modifierPayNumber: string
  ): Promise<BHR_ACCESSMDL> {
    // Ensure access string is exactly 60 characters
    const paddedAccess = accessString.padEnd(60, 'T').substring(0, 60);

    return await this.accessRepository.upsert({
      ACC_PAYNUMBER: payNumber,
      ACC_MODACCESS: paddedAccess,
      ACC_STATUSFLG: 'Y',
      ACC_MODFYOPER: modifierPayNumber,
      ACC_ENTRYOPER: modifierPayNumber,
    });
  }
}

