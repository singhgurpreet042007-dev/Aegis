import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AegisAI SQLite database (dev.db)...');

  // Clean existing data
  await prisma.threatLog.deleteMany();
  await prisma.securityAlert.deleteMany();
  await prisma.sessionReplayEvent.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.behavioralSession.deleteMany();
  await prisma.deviceFingerprint.deleteMany();
  await prisma.behavioralBaseline.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create Demo Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Aegis Security Corp',
      slug: 'aegis-security',
      tier: 'ENTERPRISE',
    },
  });

  // Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      organizationId: org.id,
      name: 'Production Monitoring Workspace',
      slug: 'production-monitoring',
      creditBalance: 10000,
    },
  });

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@aegisai.io',
      fullName: 'Security Officer (Admin)',
      status: 'ACTIVE',
      passwordHash: '$2b$10$EpRmgZHh8ty3017wL806se2Q92G8P8E2f5k9v/r7gQ.K3U1Qv2n3u', // hashed 'Password123!'
    },
  });

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: adminUser.id,
      role: 'ADMIN',
    },
  });

  // Create Demo Legitimate User
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@aegisai.io',
      fullName: 'Active Security Analyst',
      status: 'ACTIVE',
      passwordHash: '$2b$10$EpRmgZHh8ty3017wL806se2Q92G8P8E2f5k9v/r7gQ.K3U1Qv2n3u',
    },
  });

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: demoUser.id,
      role: 'MEMBER',
    },
  });

  // Behavioral Baseline
  await prisma.behavioralBaseline.create({
    data: {
      userId: demoUser.id,
      keystrokeDwellMean: 112.4,
      keystrokeDwellStd: 22.1,
      keystrokeFlightMean: 138.5,
      keystrokeFlightStd: 31.8,
      mouseVelocityMean: 840.2,
      mouseVelocityStd: 195.4,
      mouseJerkMean: 42.1,
      mouseCurvatureMean: 0.39,
      sampleCount: 450,
    },
  });

  // Device Fingerprint
  await prisma.deviceFingerprint.create({
    data: {
      userId: demoUser.id,
      fingerprintHash: 'fp_macbook_pro_m2_9f8a',
      browser: 'Chrome 122',
      os: 'macOS 14.3',
      deviceType: 'Desktop',
      isTrusted: true,
    },
  });

  // Session
  const session = await prisma.behavioralSession.create({
    data: {
      userId: demoUser.id,
      sessionToken: 'sess_prod_active_99182',
      deviceFingerprint: 'fp_macbook_pro_m2_9f8a',
      ipAddress: '198.51.100.42',
      location: 'San Francisco, CA, USA',
      currentRiskScore: 0.08,
      riskLevel: 'LOW',
      mfaState: 'NONE',
    },
  });

  // Initial Assessment
  await prisma.riskAssessment.create({
    data: {
      sessionId: session.id,
      userId: demoUser.id,
      overallRiskScore: 0.08,
      riskLevel: 'LOW',
      anomalyScore: 0.04,
      explainableFactors: JSON.stringify([
        { feature: 'Keystroke Cadence', impact: 'NORMAL', score: 0.02, description: 'Natural human micro-variations matching baseline' },
        { feature: 'Mouse Linearity', impact: 'NORMAL', score: 0.02, description: 'Natural curved trajectory vectors' },
      ]),
      adaptiveMfaTrigger: false,
    },
  });

  // Threat Logs
  await prisma.threatLog.createMany({
    data: [
      { lat: 37.7749, lng: -122.4194, location: 'San Francisco, USA', riskScore: 0.08, type: 'NORMAL_USER' },
      { lat: 50.1109, lng: 8.6821, location: 'Frankfurt, Germany', riskScore: 0.92, type: 'BOT_ATTACK' },
      { lat: 35.6762, lng: 139.6503, location: 'Tokyo, Japan', riskScore: 0.84, type: 'SESSION_HIJACK' },
      { lat: 51.5074, lng: -0.1278, location: 'London, UK', riskScore: 0.89, type: 'CREDENTIAL_STUFFING' },
    ],
  });

  console.log('✅ SQLite database (dev.db) seeded successfully with initial users and baselines!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
