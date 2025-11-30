/**
 * Cryptography Utilities for Private Source Code
 * 
 * Provides AES-256-GCM encryption/decryption for source code privacy
 */

/**
 * Generate a random encryption key
 * @returns Hex-encoded encryption key
 */
export function generateEncryptionKey(): string {
    const key = crypto.getRandomValues(new Uint8Array(32))
    return Buffer.from(key).toString('hex')
}

/**
 * Encrypt source code with AES-256-GCM
 * @param sourceCode - Plain text source code
 * @param keyHex - Hex-encoded encryption key (optional, generates if not provided)
 * @returns Encrypted data and key
 */
export async function encryptSource(
    sourceCode: string,
    keyHex?: string
): Promise<{
    encrypted: Uint8Array
    key: string
    iv: string
}> {
    // Generate key if not provided
    const key = keyHex ? Buffer.from(keyHex, 'hex') : crypto.getRandomValues(new Uint8Array(32))

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Import key for Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    )

    // Encrypt source code
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        new TextEncoder().encode(sourceCode)
    )

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encrypted), iv.length)

    return {
        encrypted: combined,
        key: Buffer.from(key).toString('hex'),
        iv: Buffer.from(iv).toString('hex')
    }
}

/**
 * Decrypt source code
 * @param encryptedData - Encrypted data (IV + ciphertext)
 * @param keyHex - Hex-encoded encryption key
 * @returns Decrypted source code
 */
export async function decryptSource(
    encryptedData: Uint8Array,
    keyHex: string
): Promise<string> {
    // Extract IV and ciphertext
    const iv = encryptedData.slice(0, 12)
    const ciphertext = encryptedData.slice(12)

    // Import key
    const key = Buffer.from(keyHex, 'hex')
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    )

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        ciphertext
    )

    return new TextDecoder().decode(decrypted)
}

/**
 * Hash source code for verification
 * @param sourceCode - Source code to hash
 * @returns SHA-256 hash in hex
 */
export async function hashSource(sourceCode: string): Promise<string> {
    const data = new TextEncoder().encode(sourceCode)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return Buffer.from(hashBuffer).toString('hex')
}

/**
 * Verify source code hash
 * @param sourceCode - Source code to verify
 * @param expectedHash - Expected hash
 * @returns True if hash matches
 */
export async function verifySourceHash(
    sourceCode: string,
    expectedHash: string
): Promise<boolean> {
    const actualHash = await hashSource(sourceCode)
    return actualHash === expectedHash
}
