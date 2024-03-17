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
    );

    if (frameMessage && frameMessage?.isValid) {
      fid = frameMessage?.requesterFid;
      walletAddress =
        frameMessage?.requesterCustodyAddress.length > 0 ?
          frameMessage?.requesterCustodyAddress :
          frameMessage?.requesterCustodyAddress
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
          <div tw="flex flex-col justify-center items-center" style={{ backgroundColor: "#01153B", width: "100%", height: "100%", paddingLeft: 16, paddingRight: 16, textAlign: 'center', fontFamily: 'sans-serif', fontWeight: 500 }}>
            {walletAddress === undefined &&
              <>
                <div tw="flex flex-col">
                  <div tw="flex">
                    <h2 style={{ color: "#F4D35E", fontSize: 50, textAlign: "center" }}>Opt-in for ham widget (iOS only)</h2>
                  </div>
                  <div tw="flex">
                    <p style={{ color: "#F4D35E", fontSize: 50, textAlign: 'center' }}>Limited to only 100 users</p>
                  </div>
                </div>
              </>
            }
            {walletAddress !== undefined && (
              <div tw="flex flex-col">
                <div tw="flex">
                  <p style={{ color: "#F4D35E", fontSize: 40 }}>
                    {walletAddress} added to allowlist.
                  </p>
                </div>
                <div tw="flex">
                  <p style={{ color: "#F4D35E", fontSize: 40 }}>Limited to first 100</p>
                </div>
              </div>
            )}
          </div>
        </FrameImage>
        <FrameButton>{walletAddress === undefined ? "Next" : "Done"}</FrameButton>
      </FrameContainer>
    </div >
  );
}
