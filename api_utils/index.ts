import { NextApiRequest } from "next";

export function validateJSONContentType(req: NextApiRequest) {
  if (req.headers["content-type"] !== "application/json")
    throw {
      status: 400,
      msg: "Invalid content type. Only application/json accepted",
    };
}
