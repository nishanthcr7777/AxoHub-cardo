import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join("/");
    const projectId = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
    const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK || "Preprod";
    const baseUrl = `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`;
    const url = `${baseUrl}/${path}`;

    if (!projectId) {
        console.error("❌ Missing Blockfrost API key in environment variables");
        return NextResponse.json({ error: "Missing Blockfrost API key" }, { status: 500 });
    }

    console.log(`Proxying request to: ${url}`);
    console.log(`Using Project ID: ${projectId.substring(0, 5)}...`);

    try {
        const response = await fetch(url, {
            headers: {
                project_id: projectId,
            },
        });

        console.log(`Upstream response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Blockfrost proxy error [${response.status}]: ${errorText}`);
            return NextResponse.json(
                { error: `Blockfrost API error: ${response.statusText}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Blockfrost proxy fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join("/");
    const projectId = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
    const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK || "Preprod";
    const baseUrl = `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`;
    const url = `${baseUrl}/${path}`;

    const body = await request.arrayBuffer(); // Blockfrost expects raw binary for submit tx

    if (!projectId) {
        console.error("❌ Missing Blockfrost API key in environment variables");
        return NextResponse.json({ error: "Missing Blockfrost API key" }, { status: 500 });
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                project_id: projectId,
                "Content-Type": request.headers.get("Content-Type") || "application/cbor",
            },
            body: body,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Blockfrost proxy error [${response.status}]: ${errorText}`);
            return NextResponse.json(
                { error: `Blockfrost API error: ${response.statusText}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Blockfrost proxy fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
