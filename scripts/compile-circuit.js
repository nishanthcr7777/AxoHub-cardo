#!/usr/bin/env node

/**
 * Circom Circuit Compilation Script
 * Compiles the ownership circuit to WASM and generates proving/verification keys
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const CIRCUITS_DIR = path.join(__dirname, '..', 'circuits');
const PUBLIC_CIRCUITS_DIR = path.join(__dirname, '..', 'public', 'circuits');
const CIRCUIT_NAME = 'ownership';

console.log('🔐 Circom Circuit Compiler');
console.log('==========================');
console.log('');

// Create directories
if (!fs.existsSync(PUBLIC_CIRCUITS_DIR)) {
    fs.mkdirSync(PUBLIC_CIRCUITS_DIR, { recursive: true });
}

async function downloadPowerOfTau() {
    const ptauFile = path.join(CIRCUITS_DIR, 'pot12_final.ptau');

    if (fs.existsSync(ptauFile)) {
        console.log('✅ Powers of Tau file already exists');
        return ptauFile;
    }

    console.log('📥 Downloading Powers of Tau file (pot12)...');
    console.log('   This may take a few minutes...');

    const url = 'https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau';
    const file = fs.createWriteStream(ptauFile);

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log('✅ Powers of Tau downloaded');
                resolve(ptauFile);
            });
        }).on('error', (err) => {
            fs.unlink(ptauFile, () => { });
            reject(err);
        });
    });
}

async function runCommand(command, description) {
    console.log(`\n📦 ${description}...`);
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error: ${error.message}`);
                console.error(stderr);
                reject(error);
                return;
            }
            if (stdout) console.log(stdout);
            console.log(`✅ ${description} complete`);
            resolve(stdout);
        });
    });
}

async function compile() {
    try {
        const circuitFile = path.join(CIRCUITS_DIR, `${CIRCUIT_NAME}.circom`);

        if (!fs.existsSync(circuitFile)) {
            throw new Error(`Circuit file not found: ${circuitFile}`);
        }

        console.log('📄 Circuit file:', circuitFile);
        console.log('');

        // Step 1: Compile circuit (creates .r1cs, .wasm, .sym)
        await runCommand(
            `circom ${circuitFile} --r1cs --wasm --sym --output ${CIRCUITS_DIR}`,
            'Compiling circuit'
        );

        // Step 2: Download Powers of Tau
        const ptauFile = await downloadPowerOfTau();

        // Step 3: Generate proving key
        const r1csFile = path.join(CIRCUITS_DIR, `${CIRCUIT_NAME}.r1cs`);
        const zkeyFile = path.join(CIRCUITS_DIR, `${CIRCUIT_NAME}_0000.zkey`);

        await runCommand(
            `snarkjs groth16 setup ${r1csFile} ${ptauFile} ${zkeyFile}`,
            'Generating proving key'
        );

        // Step 4: Contribute to the phase 2 ceremony (for production use)
        const finalZkeyFile = path.join(CIRCUITS_DIR, `${CIRCUIT_NAME}_final.zkey`);
        await runCommand(
            `snarkjs zkey contribute ${zkeyFile} ${finalZkeyFile} --name="First contribution" -v -e="random entropy"`,
            'Contributing to ceremony'
        );

        // Step 5: Export verification key
        const vkeyFile = path.join(CIRCUITS_DIR, 'verification_key.json');
        await runCommand(
            `snarkjs zkey export verificationkey ${finalZkeyFile} ${vkeyFile}`,
            'Exporting verification key'
        );

        // Step 6: Copy files to public directory
        console.log('\n📋 Copying files to public directory...');
        const wasmSrc = path.join(CIRCUITS_DIR, `${CIRCUIT_NAME}_js`, `${CIRCUIT_NAME}.wasm`);
        const wasmDest = path.join(PUBLIC_CIRCUITS_DIR, `${CIRCUIT_NAME}.wasm`);
        const zkeyDest = path.join(PUBLIC_CIRCUITS_DIR, `${CIRCUIT_NAME}_final.zkey`);
        const vkeyDest = path.join(PUBLIC_CIRCUITS_DIR, 'verification_key.json');

        fs.copyFileSync(wasmSrc, wasmDest);
        fs.copyFileSync(finalZkeyFile, zkeyDest);
        fs.copyFileSync(vkeyFile, vkeyDest);

        console.log('✅ Files copied to public/circuits/');
        console.log('');
        console.log('🎉 Circuit compilation successful!');
        console.log('');
        console.log('Generated files:');
        console.log(`   - ${wasmDest}`);
        console.log(`   - ${zkeyDest}`);
        console.log(`   - ${vkeyDest}`);
        console.log('');
        console.log('✨ Ready to generate ZK proofs!');

    } catch (error) {
        console.error('\n❌ Compilation failed:', error.message);
        process.exit(1);
    }
}

compile();
