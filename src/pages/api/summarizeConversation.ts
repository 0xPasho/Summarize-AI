import { summarizeText } from "@/utils/summarize";
import type { NextApiRequest, NextApiResponse } from "next";

type SuccessResponseData = {
  summary: string;
};

type ErrorData = {
  error: any;
};

type ResponseData = SuccessResponseData | ErrorData;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const content = req.body.content as string;

  try {
    const summary = await summarizeText(content);
    res.status(200).json({ summary });
  } catch (error) {
    //console.error("Error:", (error as any)?.request?.data);
    res.status(500).json({ error: "An error occurred." });
  }
}
