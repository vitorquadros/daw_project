export interface UpdateOwnUserDTO {
  id: string;
  displayName?: string;
  username?: string;
  nbaTeam: string;
  birthday: string;
  password?: string;
  avatar?: string;
  cover?: string;
  country?: string;
  state?: string;
  city?: string;
}
