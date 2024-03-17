import { kv } from "@vercel/kv";
import { FrameVersion, getFrameHtml, getFrameMessage, validateFrameMessage } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
import { DEBUG_HUB_OPTIONS } from "../debug/constants";
import { AddressModel } from "./types";

const MAXIMUM_KV_RESULT_LIFETIME_IN_SECONDS = 2 * 60; // 2 minutes

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json();

  // Parse and validate the frame message
  // const { isValid, message } = await validateFrameMessage(body);
  // if (!isValid || !message) {
  //   console.warn('invalid hereeeee')
  //   return new NextResponse("Invalid message", { status: 400 });
  // }

  console.warn(body, 'body')
  // verify independently
  const frameMessage = await getFrameMessage(body.postBody, {
    ...DEBUG_HUB_OPTIONS,
  });
  console.warn(frameMessage, 'hereeee')
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
