import { User as DbUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends DbUser {}
  }
}
