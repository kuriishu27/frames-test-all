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

  let fid: number | undefined;
  let walletAddress: string | undefined;
  let walletAddresses: string[];

  if (
    previousFrame.postBody &&
    isXmtpFrameActionPayload(previousFrame.postBody)
  ) {
    const frameMessage = await getXmtpFrameMessage(previousFrame.postBody);
    walletAddress = frameMessage?.verifiedWalletAddress;
  } else {
    const frameMessage = await getFrameMessage(
      previousFrame.postBody,
      DEBUG_HUB_OPTIONS
    );

    if (frameMessage && frameMessage?.isValid) {
      fid = frameMessage?.requesterFid;
      walletAddresses =
        frameMessage?.requesterVerifiedAddresses
    }
  }

  return (
    <div>
      <FrameContainer
        postUrl="/frames"
        pathname="/"
        state={{}}
        previousFrame={previousFrame}
        accepts={acceptedProtocols}
      >
        <FrameImage>
          <div style={{ paddingBlock: 8 }} tw="flex flex-col">
            <div tw="flex">
              Thank you. You will receive your NFT for the ham widget in the following address:
            </div>
            {walletAddress && (
              <div tw="flex">{walletAddress}</div>
            )}
          </div>
        </FrameImage>
        <FrameButton>Check</FrameButton>
      </FrameContainer>
    </div>
  );
}
