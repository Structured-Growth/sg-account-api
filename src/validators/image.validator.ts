import { Buffer } from "buffer";
import { injectWithTransform, autoInjectable, Logger, LoggerTransform } from "@structured-growth/microservice-sdk";

@autoInjectable()
export class ImageValidator {
	constructor(@injectWithTransform("Logger", LoggerTransform, { module: "ImageValidator" }) private logger?: Logger) {}

	public hasValidImageSignature(fileBuffer: Buffer): boolean {
		try {
			if (fileBuffer.length < 12) {
				this.logger.warn("File buffer is not large enough");
				return false;
			}

			// Define file signatures for common image formats
			const jpegSignature = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
			const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
			const gifSignature = Buffer.from("GIF87a");
			const gif89aSignature = Buffer.from("GIF89a");

			// Check if the file buffer's first 12 bytes match any of the known image formats
			const isValid = !!(
				fileBuffer.slice(0, jpegSignature.length).equals(jpegSignature) ||
				fileBuffer.slice(0, pngSignature.length).equals(pngSignature) ||
				fileBuffer.slice(0, gifSignature.length).equals(gifSignature) ||
				fileBuffer.slice(0, gif89aSignature.length).equals(gif89aSignature)
			);

			if (!isValid) {
				this.logger.warn("File buffer is not valid image");
			}

			return isValid;
		} catch (error) {
			this.logger.warn("An error occurred while trying to read the file buffer", error.message);
			return false;
		}
	}
}
