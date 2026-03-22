export class BotVerificationError extends Error {
	public readonly errorCode: string;

	constructor(message: string = 'Bot verification failed. Please complete the bot challenge to proceed.') {
		super(message);
		this.name = 'BotVerificationError';
		this.errorCode = 'BOT_CHALLENGE';

		Object.setPrototypeOf(this, BotVerificationError.prototype);
	}
}