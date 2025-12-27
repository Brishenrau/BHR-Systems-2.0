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
    // Check for duplicate menu number if provided
    if (menuHeader.MEN_MENNUMBER) {
      const exists = await this.menuHeaderRepository.menuNumberExists(menuHeader.MEN_MENNUMBER);
      if (exists) {
        throw new Error(`Menu number ${menuHeader.MEN_MENNUMBER} already exists`);
      }
    }

    // Check for duplicate menu header name
    const nameExists = await this.menuHeaderRepository.menuHeaderNameExists(menuHeader.MEN_MENHEADER);
    if (nameExists) {
      throw new Error(`Menu header "${menuHeader.MEN_MENHEADER}" already exists`);
    }

    return await this.menuHeaderRepository.create({
      ...menuHeader,
      MEN_ENTRYOPER: entryOper,
    });
  }

  async getAllMenuHeaders(): Promise<BHR_MENHEADER[]> {
    return await this.menuHeaderRepository.findAll();
  }

  async deleteMenuHeader(menuNumber: number): Promise<void> {
    // Check if menu header exists
    const exists = await this.menuHeaderRepository.menuNumberExists(menuNumber);
    if (!exists) {
      throw new Error(`Menu header with number ${menuNumber} not found`);
    }

    await this.menuHeaderRepository.delete(menuNumber);
  }
}

