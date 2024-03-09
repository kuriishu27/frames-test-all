import { getTokenUrl } from "frames.js";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import { base } from "viem/chains";

type State = {
  pageIndex: number;
};

const nfts: {
  src: string;
  tokenUrl: string;
}[] = [
    {
      src: "https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeihod7ajntqhyibybkgnrlmgifhcjar45ra3ct4jimfmaokpokz5zu&w=1080&q=75",
      tokenUrl: getTokenUrl({
        address: "0xde94e589406eb064ca0cdbe22939201312aa0656",
        chain: base,
        tokenId: "premint-3"
      }),
    },
    {
      src: "https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeigs6jkboqjn4admqyr2nz7googp6r6xezedx54yaowrjtq5sad22y&w=1080&q=75",
      tokenUrl: getTokenUrl({
        address: "0xde94e589406eb064ca0cdbe22939201312aa0656",
        chain: base,
        tokenId: "premint-2"
      }),
    },
    {
      src: "https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafybeibpgna6dmlpvmhmg6eueyyolzcxlkutltbm7g77a36scrsw4v4khy&w=1080&q=75",
      tokenUrl: getTokenUrl({
        address: "0xde94e589406eb064ca0cdbe22939201312aa0656",
        chain: base,
        tokenId: "premint-1"
      }),
    },
  ];
const initialState: State = { pageIndex: 0 };

const reducer: FrameReducer<State> = (state, action) => {
  const buttonIndex = action.postBody?.untrustedData.buttonIndex;

  return {
    pageIndex: buttonIndex
      ? (state.pageIndex + (buttonIndex === 2 ? 1 : -1)) % nfts.length
      : state.pageIndex,
  };
};

export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);
  const [state] = useFramesReducer<State>(reducer, initialState, previousFrame);

  return (
    <div>
      <h1>Leovido gallery</h1>
      <p>What are you doing here anyways? Get back to Warpcast!</p>

      <FrameContainer
        postUrl="/frames"
        pathname="/"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage
          src={nfts[state.pageIndex]!.src}
          aspectRatio="1:1"
        ></FrameImage>
        <FrameButton>←</FrameButton>
        <FrameButton>→</FrameButton>
        <FrameButton action="mint" target={nfts[state.pageIndex]!.tokenUrl}>
          Mint
        </FrameButton>
      </FrameContainer>
    </div>
  );
}
