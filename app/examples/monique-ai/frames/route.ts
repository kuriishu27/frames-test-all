import { NextRequest, NextResponse } from "next/server";

async function fetchData(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not fetch data: ", error);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.warn(body, 'body')
  const apiUrl = 'https://api.monique.app';
  const x = await fetchData(apiUrl)

  console.warn(x)

  return NextResponse.json({
    data: x,
    status: "success",
    timestamp: new Date().getTime(),
  });
}
