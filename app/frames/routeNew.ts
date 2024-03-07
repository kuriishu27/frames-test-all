import { getFrameMessage } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
import { zdk } from '../zora'
import { DEBUG_HUB_OPTIONS } from "../debug/constants";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const frameMessage = await getFrameMessage(body.postBody, {
    ...DEBUG_HUB_OPTIONS,
  });

  const uniqueId = `fid:${frameMessage.requesterFid}`;

  console.warn(frameMessage, 'frame message')
  const col = await zdk.collection({ address: '0xa702a0bad6a5fc5d1e19614b56a5719c1a7e8932' })

  console.warn(col, 'collection here')

  return NextResponse.json({
    data: col,
    status: "success",
    timestamp: new Date().getTime(),
  });
}
