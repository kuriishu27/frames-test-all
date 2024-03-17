import { ClientProtocolId } from "frames.js";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
} from "frames.js/next/server";
import { getXmtpFrameMessage, isXmtpFrameActionPayload } from "frames.js/xmtp";
import { DEBUG_HUB_OPTIONS } from "./debug/constants";
import { kv } from "@vercel/kv";
import { AddressModel } from "./frames/types";

const acceptedProtocols: ClientProtocolId[] = [
  {
    id: "xmtp",
    version: "vNext",
  },
  {
    id: "farcaster",
    version: "vNext",
  },
];

// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame(searchParams);

  let frame: React.ReactElement;

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    ...DEBUG_HUB_OPTIONS,
  });

  if (frameMessage && !frameMessage?.isValid) {
    throw new Error("Invalid frame payload");
  }

  const initialFrame = (
    <FrameContainer
      postUrl="/frames"
      pathname="/"
      state={{}}
      previousFrame={previousFrame}
      accepts={acceptedProtocols}
    >
      <FrameImage>
        <div tw="flex flex-col justify-center items-center" style={{ backgroundColor: "#01153B", width: "100%", height: "100%", paddingLeft: 16, paddingRight: 16, textAlign: 'center', fontFamily: 'sans-serif', fontWeight: 500 }}>
          <>
            <div tw="flex flex-col">
              <div tw="flex">
                <p style={{ color: "#F4D35E", fontSize: 50 }}>Opt-in for ham widget (iOS only)</p>
              </div>
              <div tw="flex">
                <p style={{ color: "#F4D35E", fontSize: 50 }}>Limited to only 100 users</p>
              </div>
            </div>
          </>
        </div>
      </FrameImage>
      <FrameButton>Next</FrameButton>
    </FrameContainer>
  );

  const allowlistFrame = (
    <FrameContainer
      postUrl="/frames"
      pathname="/"
      state={{}}
      previousFrame={previousFrame}
      accepts={acceptedProtocols}
    >
      <FrameImage>
        <div tw="flex flex-col justify-center items-center" style={{ backgroundColor: "#01153B", width: "100%", height: "100%", paddingLeft: 16, paddingRight: 16, textAlign: 'center', fontFamily: 'sans-serif', fontWeight: 500 }}>
          <>
            <div tw="flex">
              <p style={{ color: "#F4D35E", fontSize: 40, textAlign: "center" }}>
                {`address added to allowlist.`}
              </p>
            </div>
            <div tw="flex">
              <p style={{ color: "#F4D35E", fontSize: 40, textAlign: "center" }}>Limited to first 100</p>
            </div>
          </>
        </div>
      </FrameImage>
      <FrameButton>Next</FrameButton>
    </FrameContainer>
  );


  const checkStatusFrame = (
    <FrameContainer
      postUrl="/frames"
      pathname="/"
      state={{}}
      previousFrame={previousFrame}
    >
      <FrameImage>
        <div tw="flex flex-col justify-center items-center" style={{ backgroundColor: "#01153B", width: "100%", height: "100%", paddingLeft: 16, paddingRight: 16, textAlign: 'center', fontFamily: 'sans-serif', fontWeight: 500 }}>
          <p style={{ color: "#F4D35E", fontSize: 50 }}>Loading...</p>
        </div>
      </FrameImage>
      <FrameButton>Check status</FrameButton>
    </FrameContainer>
  );

  if (frameMessage) {
    const { requesterFid } = frameMessage;

    const uniqueId = `fid:${requesterFid}`;

    const existingRequest =
      await kv.get<AddressModel>(uniqueId);

    if (existingRequest) {
      switch (existingRequest.status) {
        case "pending":
          frame = checkStatusFrame;
          break;
        case "success":
          // if retry is true, then try to generate again and show checkStatusFrame
          if (searchParams?.reset === "true") {
            // reset to initial state
            await kv.del(uniqueId);

            frame = initialFrame;
          } else {
            frame = allowlistFrame
          }
          break;
        case "error":
          // if retry is true, then try to generate again and show checkStatusFrame
          if (searchParams?.retry === "true") {
            // reset to initial state
            await kv.del(uniqueId);

            frame = initialFrame;
          } else {
            frame = initialFrame
          }
          break;
      }
    } else {
      await kv.set<AddressModel>(
        uniqueId,
        {
          status: "pending",
          timestamp: new Date().getTime(),
        },
        // set as pending for one minute
        { ex: 60 }
      );

      // start request, don't await it! Return a loading page, let this run in the background
      fetch(
        new URL(
          "/",
          process.env.NEXT_PUBLIC_HOST
        ).toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postBody: JSON.parse(searchParams?.postBody as string),
          }),
        }
      );

      frame = checkStatusFrame;
    }
  } else {
    frame = initialFrame;
  }

  return (
    <div>
      {frame}
    </div >
  );
}
