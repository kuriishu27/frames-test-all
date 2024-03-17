import { PutBlobResult, put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { getFrameMessage } from 'frames.js';


export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json()
  const frameActionPayload = body.untrustedData
  const frameMessage = await getFrameMessage(frameActionPayload);

  await kv.set(frameMessage.requesterCustodyAddress, "allowlist");
  const success = await kv.get(frameMessage.requesterCustodyAddress);

  return NextResponse.json({
    data: success,
    status: "success",
    timestamp: new Date().getTime(),
  });
}