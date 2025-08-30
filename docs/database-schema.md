### Database Schema (Prisma Models)

```prisma
// User authentication and roles
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  role      UserRole @default(PROPERTY_OWNER)
  kennitala String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // Relationships
  managedHAs     HouseAssociation[]
  memberships    HAMembership[]
  announcements  Announcement[]
  messages       Message[]
}
model HouseAssociation {
  id               String   @id @default(cuid())
  name             String
  address          String
  registrationNum  String   @unique
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  // Relationships
  manager          User     @relation(fields: [managerId], references: [id])
  managerId        String
  members          HAMembership[]
  documents        Document[]
  announcements    Announcement[]
  meetings         Meeting[]
}
model HAMembership {
  id     String @id @default(cuid())
  user   User   @relation(fields: [userId], references: [id])
  userId String
  ha     HouseAssociation @relation(fields: [haId], references: [id])
  haId   String
  @@unique([userId, haId])
}
enum UserRole {
  HA_MANAGER
  PROPERTY_OWNER
}
```
