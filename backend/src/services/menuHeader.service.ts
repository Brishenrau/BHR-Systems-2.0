import { MenuHeaderRepository } from '../repositories/MenuHeaderRepository';
import type { BHR_MENHEADER } from '../types/database.types';

export class MenuHeaderService {
  private menuHeaderRepository = new MenuHeaderRepository();

  async createMenuHeader(
    menuHeader: {
      MEN_MENNUMBER?: number;
      MEN_MENHEADER: string;
    },
    entryOper: string
  ): Promise<BHR_MENHEADER> {
    return await this.menuHeaderRepository.create({
      ...menuHeader,
      MEN_ENTRYOPER: entryOper,
    });
  }

  async getAllMenuHeaders(): Promise<BHR_MENHEADER[]> {
    return await this.menuHeaderRepository.findAll();
  }
}

