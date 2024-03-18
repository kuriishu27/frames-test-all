import { kv } from "@vercel/kv";
import { FrameVersion, getFrameHtml, getFrameMessage, validateFrameMessage } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
import { DEBUG_HUB_OPTIONS } from "../debug/constants";
import { AddressModel } from "./types";

const MAXIMUM_KV_RESULT_LIFETIME_IN_SECONDS = 2 * 60; // 2 minutes

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json();
  // Parse and validate the frame message
  const { isValid, message } = await validateFrameMessage(body.trustedData.messageBytes);

  if (!isValid || !message) {
    return new NextResponse(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <title>Error</title>
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:image" content="${process.env.GATEWAY_URL}/ipfs/QmdHqdPuFrD5LTCtBrf6pio41m53cj54De3LS7qsxyVpNV/ur_in.jpg" />
                <meta property="fc:frame:button:1" content="Visit dividoge.com" />
                <meta property="fc:frame:button:1:action" content="post_redirect" />
                <meta property="fc:frame:button:2" content="Join the $MILO channel" />
                <meta property="fc:frame:button:2:action" content="post_redirect" />
                <meta property="fc:frame:post_url" content="${process.env.BASE_URL}/api/end" />
            </head>
        </html>
                `);
  }

  // verify independently
  console.warn('valid')
  const frameMessage = await getFrameMessage(body.postBody);

  return new NextResponse(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <title>Success</title>
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:image" content="${process.env.GATEWAY_URL}/ipfs/QmdHqdPuFrD5LTCtBrf6pio41m53cj54De3LS7qsxyVpNV/ur_in.jpg" />
                <meta property="fc:frame:button:1" content="Visit dividoge.com" />
                <meta property="fc:frame:button:1:action" content="post_redirect" />
                <meta property="fc:frame:button:2" content="Join the $MILO channel" />
                <meta property="fc:frame:button:2:action" content="post_redirect" />
                <meta property="fc:frame:post_url" content="${process.env.BASE_URL}/api/end" />
            </head>
        </html>
                `);
  const uniqueId = `fid:${frameMessage.requesterFid}`;

  try {
    const walletAddress = frameMessage.requesterCustodyAddress
    await kv.set<AddressModel>(
      uniqueId,
      {
        data: walletAddress,
        status: "success",
        timestamp: new Date().getTime(),
      },
      { ex: MAXIMUM_KV_RESULT_LIFETIME_IN_SECONDS }
    );

    return NextResponse.json({
      data: walletAddress,
      status: "success",
      timestamp: new Date().getTime(),
    });
  } catch (e) {
    await kv.set<AddressModel>(
      uniqueId,
      {
        error: String(e),
        status: "error",
        timestamp: new Date().getTime(),
      },
      { ex: MAXIMUM_KV_RESULT_LIFETIME_IN_SECONDS }
    );
    // Handle errors
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
