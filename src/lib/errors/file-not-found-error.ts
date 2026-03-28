export class FileNotFoundError extends Error {
	public readonly errorCode: string

	constructor(message: string = "The requested file was not found or has been removed.") {
		super(message);
		this.name = "FileNotFoundError"
		this.errorCode = "FILE_NOT_FOUND"

		Object.setPrototypeOf(this, FileNotFoundError.prototype);
	}
}