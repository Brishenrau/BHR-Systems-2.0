import { ModuleRepository } from '../repositories/ModuleRepository';
import type { BHR_MODULCODE } from '../types/database.types';

export class ModuleService {
  private moduleRepository = new ModuleRepository();

  /**
   * Create a new module
   */
  async createModule(
    module: {
      MOD_MODULCODE: string;
      MOD_MODULNAME: string;
      MOD_STATUSFLG?: string;
    },
    entryOper: string
  ): Promise<BHR_MODULCODE> {
    return await this.moduleRepository.create({
      ...module,
      MOD_ENTRYOPER: entryOper,
    });
  }

  /**
   * Get all modules (including inactive)
   */
  async getAllModules(): Promise<BHR_MODULCODE[]> {
    return await this.moduleRepository.findAll();
  }
}

