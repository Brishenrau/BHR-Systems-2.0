import { Request, Response, NextFunction } from 'express';
import { PortraitService } from '../services/portrait.service';

const portraitService = new PortraitService();

export class PortraitController {
  /**
   * Get portrait image for a user
   */
  async getPortrait(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { payNumber } = req.params;
      
      console.log('Portrait request for payNumber:', payNumber);
      
      if (!payNumber) {
        res.status(400).json({
          success: false,
          message: 'Pay number is required',
        });
        return;
      }

      const imageDataUrl = await portraitService.getPortraitImage(payNumber);
      console.log('Portrait service returned:', imageDataUrl ? 'Image found' : 'No image');

      if (!imageDataUrl) {
        res.status(404).json({
          success: false,
          message: 'Portrait not found',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          imageUrl: imageDataUrl,
        },
      });
    } catch (error: any) {
      console.error('Error in getPortrait controller:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get portrait',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
}

