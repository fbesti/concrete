import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Database seeding started...');
  
  // Clear existing data in reverse order of dependencies
  await prisma.message.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.document.deleteMany();
  await prisma.hAMembership.deleteMany();
  await prisma.houseAssociation.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('Existing data cleared.');
  
  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@ha.is',
      password: hashedPassword,
      firstName: 'Jón',
      lastName: 'Jónsson',
      role: UserRole.HA_MANAGER,
      kennitala: '1234567890'
    }
  });
  
  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@ha.is',
      password: hashedPassword,
      firstName: 'Guðrún',
      lastName: 'Pétursdóttir',
      role: UserRole.HA_MANAGER,
      kennitala: '0987654321'
    }
  });
  
  const propertyOwner1 = await prisma.user.create({
    data: {
      email: 'owner1@example.is',
      password: hashedPassword,
      firstName: 'Sigríður',
      lastName: 'Einarsdóttir',
      role: UserRole.PROPERTY_OWNER,
      kennitala: '1122334455'
    }
  });
  
  const propertyOwner2 = await prisma.user.create({
    data: {
      email: 'owner2@example.is',
      password: hashedPassword,
      firstName: 'Ólafur',
      lastName: 'Ragnarsson',
      role: UserRole.PROPERTY_OWNER,
      kennitala: '5566778899'
    }
  });
  
  const propertyOwner3 = await prisma.user.create({
    data: {
      email: 'owner3@example.is',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'Gunnarsdóttir',
      role: UserRole.PROPERTY_OWNER,
      kennitala: '2233445566'
    }
  });
  
  console.log('Users created.');
  
  // Create house associations
  const ha1 = await prisma.houseAssociation.create({
    data: {
      name: 'Húsfélag Laugavegar 101',
      address: 'Laugavegur 101, 101 Reykjavík',
      registrationNum: 'HF001234',
      managerId: manager1.id
    }
  });
  
  const ha2 = await prisma.houseAssociation.create({
    data: {
      name: 'Húsfélag Skólavörðustígs 15',
      address: 'Skólavörðustígur 15, 101 Reykjavík',
      registrationNum: 'HF005678',
      managerId: manager2.id
    }
  });
  
  console.log('House associations created.');
  
  // Create memberships
  await prisma.hAMembership.createMany({
    data: [
      { userId: propertyOwner1.id, haId: ha1.id },
      { userId: propertyOwner2.id, haId: ha1.id },
      { userId: propertyOwner3.id, haId: ha2.id }
    ]
  });
  
  console.log('Memberships created.');
  
  // Create documents
  await prisma.document.createMany({
    data: [
      {
        title: 'Tryggingaskjal 2024',
        description: 'Tryggingaskjal fyrir árið 2024',
        filePath: '/documents/ha1/insurance_2024.pdf',
        mimeType: 'application/pdf',
        size: 2048576,
        haId: ha1.id
      },
      {
        title: 'Húsreglur',
        description: 'Húsreglur fyrir Laugaveg 101',
        filePath: '/documents/ha1/house_rules.pdf',
        mimeType: 'application/pdf',
        size: 1024512,
        haId: ha1.id
      },
      {
        title: 'Viðhaldsdagbók 2024',
        description: 'Skráning viðhalds og viðgerða',
        filePath: '/documents/ha1/maintenance_log_2024.pdf',
        mimeType: 'application/pdf',
        size: 3145728,
        haId: ha1.id
      },
      {
        title: 'Fjárhagsáætlun 2024',
        description: 'Fjárhagsáætlun fyrir Skólavörðustíg 15',
        filePath: '/documents/ha2/budget_2024.pdf',
        mimeType: 'application/pdf',
        size: 1536000,
        haId: ha2.id
      }
    ]
  });
  
  console.log('Documents created.');
  
  // Create announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Fundur í næstu viku',
        content: 'Árlegur eigendafundur verður haldinn þriðjudaginn 25. ágúst kl. 19:00 í kjallaranum. Dagskrá fylgir með.',
        authorId: manager1.id,
        haId: ha1.id
      },
      {
        title: 'Þvottahúsviðgerð',
        content: 'Þvottavél nr. 2 er í bilunn og verður lagfærð á morgun. Notið vinsamlegast þvottavél nr. 1 í bili.',
        authorId: manager1.id,
        haId: ha1.id
      },
      {
        title: 'Nýjar húsreglur',
        content: 'Nýjar húsreglur hafa verið samþykktar og taka gildi 1. september. Farið yfir þær og sendu athugasemdir ef einhverjar eru.',
        authorId: manager2.id,
        haId: ha2.id
      }
    ]
  });
  
  console.log('Announcements created.');
  
  // Create meetings
  await prisma.meeting.createMany({
    data: [
      {
        title: 'Árlegur eigendafundur 2024',
        description: 'Árshlutareikningur, fjárhagsáætlun 2025, og önnur málefni',
        scheduledAt: new Date('2024-08-25T19:00:00.000Z'),
        location: 'Kjallari hússins',
        haId: ha1.id
      },
      {
        title: 'Viðhaldsfundur',
        description: 'Umræða um nauðsynlegar viðgerðir á húsinu',
        scheduledAt: new Date('2024-09-15T18:00:00.000Z'),
        location: 'Íbúð 1A',
        haId: ha2.id
      }
    ]
  });
  
  console.log('Meetings created.');
  
  // Create some messages
  await prisma.message.createMany({
    data: [
      {
        content: 'Halló, ég er með spurning um trygginguna okkar.',
        senderId: propertyOwner1.id
      },
      {
        content: 'Getið þið sent mér afrit af húsreglunum?',
        senderId: propertyOwner2.id
      },
      {
        content: 'Hvað kostar það að skipta um ljósaperu í stigaganginum?',
        senderId: propertyOwner3.id
      }
    ]
  });
  
  console.log('Messages created.');
  
  console.log('Database seeding completed successfully!');
  console.log('Test users created:');
  console.log('Manager 1: manager1@ha.is (password: password123)');
  console.log('Manager 2: manager2@ha.is (password: password123)');
  console.log('Property owners: owner1@example.is, owner2@example.is, owner3@example.is (password: password123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });