import { PortraitRepository } from '../repositories/PortraitRepository';

export class PortraitService {
  private portraitRepository = new PortraitRepository();

  /**
   * Get portrait image as base64 data URL
   */
  async getPortraitImage(payNumber: string): Promise<string | null> {
    const portrait = await this.portraitRepository.findByPayNumber(payNumber);
    
    if (!portrait || !portrait.POR_PORTIMAGE) {
      return null;
    }

    // Handle Buffer (from Oracle LONG RAW)
    if (Buffer.isBuffer(portrait.POR_PORTIMAGE)) {
      const base64 = portrait.POR_PORTIMAGE.toString('base64');
      // Determine image type (default to jpeg, but could be png, etc.)
      return `data:image/jpeg;base64,${base64}`;
    }

    // If it's already a string (base64), return as is
    if (typeof portrait.POR_PORTIMAGE === 'string') {
      // Check if it already has data URL prefix
      if (portrait.POR_PORTIMAGE.startsWith('data:')) {
        return portrait.POR_PORTIMAGE;
      }
      return `data:image/jpeg;base64,${portrait.POR_PORTIMAGE}`;
    }

    return null;
  }
}

