import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

export class SocketEncryptionService {
	private keyPair: EC.KeyPair | null = null;
	private sessionKey: Uint8Array | null = null;
	private keyExchangeDone = false;

  	/** Whether the ECDH handshake is complete and sessionKey is ready */
	get isHandshakeComplete(): boolean {
		return this.keyExchangeDone && this.sessionKey !== null;
	}

	/** 1. Generate ECDH keypair */
	generateKeypair(): void {
		this.keyPair = ec.genKeyPair();
	}

	/** 2. Handle server public key, derive shared secret and session key */
	handleServerKeyExchange(data: { serverPublicKey: string }): void {
		if (!this.keyPair) throw new Error('Keypair not generated');

		const serverKey = ec.keyFromPublic(data.serverPublicKey, 'hex');
		const sharedSecret = this.keyPair.derive(serverKey.getPublic()); // BN instance
		const sharedSecretHex = sharedSecret.toString(16).padStart(64, '0');
		const sharedSecretBuffer = Buffer.from(sharedSecretHex, 'hex');

		const hash = crypto.subtle.digest('SHA-256', sharedSecretBuffer);
		hash.then((digest) => {
		this.sessionKey = new Uint8Array(digest);
		this.keyExchangeDone = true;
		}).catch((err) => {
			throw new Error('Failed to derive session key: ' + err);
		});
	}

  	/** 3. Get client public key (hex) to send to server */
	getClientPublicKeyHex(): string {
		if (!this.keyPair) throw new Error('Keypair not generated');
		return this.keyPair.getPublic().encode('hex', false); // uncompressed
	}

  	/** 4. Encrypt a payload using AES-256-CBC (returns hex strings) */
	async encrypt(plaintext: object): Promise<{ isEncrypted: true; iv: string; data: string }> {
		if (!this.sessionKey || !this.keyExchangeDone) {
			throw new Error('Session key not ready');
		}

		const iv = crypto.getRandomValues(new Uint8Array(16));
		const encoded = new TextEncoder().encode(JSON.stringify(plaintext));

		const key = await crypto.subtle.importKey(
			'raw',
			this.sessionKey,
			{ name: 'AES-CBC' },
			false,
			['encrypt']
		);

		const encrypted = await crypto.subtle.encrypt(
			{ name: 'AES-CBC', iv },
			key,
			encoded
		);

		return {
			isEncrypted: true,
			iv: Buffer.from(iv).toString('hex'),
			data: Buffer.from(encrypted).toString('hex'),
		};
	}

	/** 5. Decrypt an encrypted payload using AES-256-CBC */
	async decrypt(payload: { iv: string; data: string }): Promise<object> {
		if (!this.sessionKey || !this.keyExchangeDone) {
			throw new Error('Session key not ready');
		}

		const iv = Buffer.from(payload.iv, 'hex');
		const encryptedData = Buffer.from(payload.data, 'hex');

		const key = await crypto.subtle.importKey(
			'raw',
			this.sessionKey,
			{ name: 'AES-CBC' },
			false,
			['decrypt']
		);

		const decrypted = await crypto.subtle.decrypt(
			{ name: 'AES-CBC', iv },
			key,
			encryptedData
		);

		const decoded = new TextDecoder().decode(decrypted);
		return JSON.parse(decoded);
	}
}
