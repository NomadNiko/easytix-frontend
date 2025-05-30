import { faker } from "@faker-js/faker";

export function generateUserData() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 10 }),
  };
}

export function generateTicketData() {
  return {
    title: faker.lorem.sentence(),
    details: faker.lorem.paragraphs(2),
    priority: faker.helpers.arrayElement(["HIGH", "MEDIUM", "LOW"]),
  };
}

export function generateRandomEmail() {
  return faker.internet.email().toLowerCase();
}

export function generateRandomPassword() {
  return faker.internet.password({ length: 10 });
}
