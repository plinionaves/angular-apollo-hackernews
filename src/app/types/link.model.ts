import { User, Vote } from './index';

export class Link {
  id?: string;
  description?: string;
  url?: string;
  createdAt?: string;
  postedBy?: User;
  votes?: Vote[];
}
