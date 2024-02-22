import { Buffer } from 'buffer';

export class ImageValidator {
    public static async hasValidImageSignature(fileBuffer: Buffer): Promise<boolean> {
        try {
            // Check if the file buffer is large enough to contain image signatures
            if (fileBuffer.length < 12) {
                return false;
            }

            // Define file signatures for common image formats
            const jpegSignature = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
            const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
            const gifSignature = Buffer.from('GIF87a');
            const gif89aSignature = Buffer.from('GIF89a');

            // Check if the file buffer's first 12 bytes match any of the known image formats
            if (
                fileBuffer.slice(0, jpegSignature.length).equals(jpegSignature) ||
                fileBuffer.slice(0, pngSignature.length).equals(pngSignature) ||
                fileBuffer.slice(0, gifSignature.length).equals(gifSignature) ||
                fileBuffer.slice(0, gif89aSignature.length).equals(gif89aSignature)
            ) {
                return true;
            }

            return false;
        } catch (error) {
            // An error occurred while trying to read the file buffer
            return false;
        }
    }
}
