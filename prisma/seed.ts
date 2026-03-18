import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Helper to read JSON
function readJson(filename: string) {
  const filePath = path.join(process.cwd(), 'data', filename)
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`)
    return []
  }
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

function convertDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of ['startDate', 'endDate', 'dueAt', 'startAt', 'endAt', 'createdAt', 'joinedAt']) {
    if (obj[key]) {
      obj[key] = new Date(obj[key]);
    }
  }
  return obj;
}

async function main() {
  console.log('Seeding data from JSON...')

  // The order is critical for foreign keys: 
  // 1. Organizations -> 2. BusinessUnits -> 3. Batches -> 4. Assignments/Materials -> 5. Enrolments
  const orgs = readJson('organizations.json').map(convertDates)
  const busUnits = readJson('business-units.json').map(convertDates)
  const batches = readJson('batches.json').map(convertDates)
  const assignments = readJson('assignments.json').map(convertDates)
  const enrolments = readJson('enrolments.json').map(convertDates)
  const materials = readJson('materials.json').map(convertDates)
  const customProblems = readJson('custom-problems.json').map(convertDates)
  const batchMembers = readJson('batch-members.json').map(convertDates)

  // Organizations
  if (orgs.length > 0) {
    await prisma.organization.createMany({ data: orgs, skipDuplicates: true })
    console.log(`Migrated ${orgs.length} organizations`)
  }

  // Business Units
  if (busUnits.length > 0) {
    await prisma.businessUnit.createMany({ data: busUnits, skipDuplicates: true })
    console.log(`Migrated ${busUnits.length} business units`)
  }

  // Batches
  if (batches.length > 0) {
    await prisma.batch.createMany({ data: batches, skipDuplicates: true })
    console.log(`Migrated ${batches.length} batches`)
  }

  // Batch Members
  if (batchMembers.length > 0) {
    await prisma.batchMembership.createMany({ data: batchMembers, skipDuplicates: true })
    console.log(`Migrated ${batchMembers.length} batch memberships`)
  }

  // Assignments
  if (assignments.length > 0) {
    await prisma.assignment.createMany({ data: assignments, skipDuplicates: true })
    console.log(`Migrated ${assignments.length} assignments`)
  }

  // Enrolments
  if (enrolments.length > 0) {
    await prisma.enrolment.createMany({ data: enrolments, skipDuplicates: true })
    console.log(`Migrated ${enrolments.length} enrolments`)
  }

  // Materials
  if (materials.length > 0) {
    await prisma.material.createMany({ data: materials, skipDuplicates: true })
    console.log(`Migrated ${materials.length} materials`)
  }

  // Custom Problems
  if (customProblems.length > 0) {
    await prisma.customProblem.createMany({ data: customProblems, skipDuplicates: true })
    console.log(`Migrated ${customProblems.length} custom problems`)
  }

  console.log('Done migrating all JSON data to Postgres!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })