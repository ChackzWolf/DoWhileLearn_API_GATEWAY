import dotenv from "dotenv";
import jwt, { Secret } from "jsonwebtoken";
import { IUser } from "../interface/models/IUser";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error(
    "JWT_SECRET or REFRESH_TOKEN_SECRET is not defined in environmental variables. "
  );
}

const createToken = (
  user: IUser, role:string
): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    {
     // id: user._id,
      role: role,
      email: user.email,
    },
    JWT_SECRET as Secret,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
      role: role,
      email: user.email,
    },
    REFRESH_TOKEN_SECRET as Secret,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

export default createToken;
