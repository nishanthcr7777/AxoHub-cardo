const apiKey = 'preprod8WGp625gYAkdR6UaQMIuV4YAfchh70uH';
const url = 'https://cardano-preprod.blockfrost.io/api/v0/epochs/latest/parameters';

async function verifyKey() {
    console.log('🔍 Verifying Blockfrost API Key...');
    console.log(`Key: ${apiKey.substring(0, 10)}...`);
    console.log(`URL: ${url}`);

    try {
        const response = await fetch(url, {
            headers: { 'project_id': apiKey }
        });

        console.log(`\nStatus: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCESS: Key is valid.');
            console.log('Protocol version:', data.protocol_major);
        } else {
            const text = await response.text();
            console.log('❌ FAILED: API returned error.');
            console.log('Response body:', text);
        }
    } catch (error) {
        console.error('❌ ERROR: Request failed completely.');
        console.error(error);
    }
}

verifyKey();
