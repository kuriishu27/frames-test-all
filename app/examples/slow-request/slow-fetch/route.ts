import { getFrameMessage } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
import { DEBUG_HUB_OPTIONS } from "../../../debug/constants";
import { kv } from "@vercel/kv";
import { RandomNumberRequestStateValue } from "./types";

const MAXIMUM_KV_RESULT_LIFETIME_IN_SECONDS = 2 * 60; // 2 minutes

export async function POST(req: NextRequest) {
  const body = await req.json();

  // verify independently
  const frameMessage = await getFrameMessage(body.postBody, {
    ...DEBUG_HUB_OPTIONS,
  });

  const uniqueId = `fid:${frameMessage.requesterFid}`;

  // Wait 10 seconds

  try {
    const randomNumber = Math.random();

    await kv.set<RandomNumberRequestStateValue>(
      uniqueId,
      {
        data: randomNumber,
        status: "success",
        timestamp: new Date().getTime(),
      },
      { ex: MAXIMUM_KV_RESULT_LIFETIME_IN_SECONDS }
    );

    return NextResponse.json({
      data: randomNumber,
      status: "success",
      timestamp: new Date().getTime(),
    });
  } catch (e) {
    await kv.set<RandomNumberRequestStateValue>(
      uniqueId,
      {
        error: String(e),
        status: "error",
        timestamp: new Date().getTime(),
      },
      { ex: MAXIMUM_KV_RESULT_LIFETIME_IN_SECONDS }
    );
    // Handle errors
    return new NextResponse(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <title>Congrats you are on the $MILO whitelist.</title>
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
}
