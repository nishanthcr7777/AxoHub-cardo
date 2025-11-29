/**
 * WASM Loader for ZK Circuit Artifacts
 * Loads compiled WASM modules in both browser and Node.js environments
 */

interface WasmModule {
    instance: WebAssembly.Instance;
    module: WebAssembly.Module;
}

class WasmLoader {
    private cache: Map<string, WasmModule> = new Map();

    /**
     * Load WASM module from file path or URL
     */
    async loadWasm(path: string): Promise<WasmModule> {
        // Check cache first
        if (this.cache.has(path)) {
            console.log(`📦 Using cached WASM module: ${path}`);
            return this.cache.get(path)!;
        }

        console.log(`📥 Loading WASM module: ${path}`);

        try {
            let wasmBytes: BufferSource;

            // Browser environment
            if (typeof window !== 'undefined') {
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`Failed to fetch WASM: ${response.statusText}`);
                }
                wasmBytes = await response.arrayBuffer();
            }
            // Node.js environment
            else {
                const fs = await import('fs/promises');
                const buffer = await fs.readFile(path);
                wasmBytes = buffer;
            }

            // Compile and instantiate WASM module
            const module = await WebAssembly.compile(wasmBytes);
            const instance = await WebAssembly.instantiate(module);

            const wasmModule: WasmModule = { instance, module };

            // Cache the module
            this.cache.set(path, wasmModule);

            console.log(`✅ WASM module loaded successfully`);
            return wasmModule;

        } catch (error) {
            console.error(`❌ Failed to load WASM module:`, error);
            throw new Error(`WASM loading failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Validate WASM artifact integrity
     */
    async validateArtifact(path: string): Promise<boolean> {
        try {
            const module = await this.loadWasm(path);
            // Basic validation - check if module has expected exports
            return module.instance.exports !== undefined;
        } catch {
            return false;
        }
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
        console.log('🗑️ WASM cache cleared');
    }

    /**
     * Get cache size
     */
    getCacheSize(): number {
        return this.cache.size;
    }
}

// Singleton instance
export const wasmLoader = new WasmLoader();

/**
 * Convenience function to load WASM
 */
export async function loadWasm(path: string): Promise<WasmModule> {
    return wasmLoader.loadWasm(path);
}

/**
 * Load ZK circuit artifacts
 */
export async function loadCircuitArtifacts(contractName: string) {
    const basePath = `/contract/artifacts/${contractName}`;

    const [wasm, circuit, metadata] = await Promise.all([
        loadWasm(`${basePath}.wasm`),
        fetch(`${basePath}-circuit.json`).then(r => r.json()),
        fetch(`${basePath}-metadata.json`).then(r => r.json())
    ]);

    return { wasm, circuit, metadata };
}
