import { PortraitRepository } from '../repositories/PortraitRepository';

export class PortraitService {
  private portraitRepository = new PortraitRepository();

  /**
   * Get portrait image as base64 data URL
   */
  async getPortraitImage(payNumber: string): Promise<string | null> {
    try {
      console.log('Fetching portrait for payNumber:', payNumber);
      const portrait = await this.portraitRepository.findByPayNumber(payNumber);
      
      if (!portrait) {
        console.log('No portrait record found for payNumber:', payNumber);
        return null;
      }

      if (!portrait.POR_PORTIMAGE) {
        console.log('Portrait record found but POR_PORTIMAGE is null/empty');
        return null;
      }

      console.log('Portrait image type:', typeof portrait.POR_PORTIMAGE);
      console.log('Is Buffer?', Buffer.isBuffer(portrait.POR_PORTIMAGE));

      // Handle Buffer (from Oracle LONG RAW)
      if (portrait.POR_PORTIMAGE && Buffer.isBuffer(portrait.POR_PORTIMAGE)) {
        const base64 = portrait.POR_PORTIMAGE.toString('base64');
        console.log('Converted Buffer to base64, length:', base64.length);
        // Determine image type (default to jpeg, but could be png, etc.)
        return `data:image/jpeg;base64,${base64}`;
      }

      // If it's already a string (base64), return as is
      if (typeof portrait.POR_PORTIMAGE === 'string') {
        console.log('Portrait image is string, length:', portrait.POR_PORTIMAGE.length);
        // Check if it already has data URL prefix
        if (portrait.POR_PORTIMAGE.startsWith('data:')) {
          return portrait.POR_PORTIMAGE;
        }
        return `data:image/jpeg;base64,${portrait.POR_PORTIMAGE}`;
      }

      console.log('Unknown portrait image type');
      return null;
    } catch (error: any) {
      console.error('Error in getPortraitImage service:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }
}

