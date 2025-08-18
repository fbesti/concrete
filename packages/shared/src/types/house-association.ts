export interface HouseAssociation {
  id: string;
  name: string;
  address: string;
  registrationNum: string;
  managerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HAMembership {
  id: string;
  userId: string;
  haId: string;
}