// Using global fetch (Node 18+)

const apiKey = 'preprod8WGp625gYAkdR6UaQMIuV4YAfchh70uH';
const url = 'https://cardano-preprod.blockfrost.io/api/v0/epochs/latest/parameters';

async function testBlockfrost() {
    try {
        console.log('Testing Blockfrost API...');
        const response = await fetch(url, {
            headers: {
                'project_id': apiKey
            }
        });

        if (response.ok) {
            console.log('✅ Blockfrost API key is valid.');
            const data = await response.json();
            console.log('Data received:', JSON.stringify(data).substring(0, 100) + '...');
        } else {
            console.error('❌ Blockfrost API error:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response:', text);
        }
    } catch (error) {
        console.error('❌ Fetch error:', error);
    }
}

testBlockfrost();
