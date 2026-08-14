import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Aegis AI database...\n');

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
      passwordHash: '$2b$10$EpRmgZHh8ty3017wL806se2Q92G8P8E2f5k9v/r7gQ.K3U1Qv2n3u',
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
      email: 'user@aegisai.io',
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
      keystrokeDwellStd: 21.8,
      keystrokeFlightMean: 138.2,
      keystrokeFlightStd: 28.5,
      mouseVelocityMean: 840.5,
      mouseVelocityStd: 180.2,
      mouseJerkMean: 42.1,
      mouseCurvatureMean: 0.38,
      sampleCount: 1450,
    },
  });

  // Device Fingerprint
  await prisma.deviceFingerprint.create({
    data: {
      userId: demoUser.id,
      fingerprintHash: 'fp_aegis_98a7b6c5d4',
      browser: 'Chrome 128.0',
      os: 'macOS 14.5',
      deviceType: 'Macintosh',
      isTrusted: true,
    },
  });

  // Active Session
  const activeSession = await prisma.behavioralSession.create({
    data: {
      userId: demoUser.id,
      sessionToken: 'sess_active_legit_001',
      deviceFingerprint: 'fp_aegis_98a7b6c5d4',
      ipAddress: '198.51.100.42',
      location: 'San Francisco, CA, US',
      currentRiskScore: 0.08,
      riskLevel: 'LOW',
      mfaState: 'NONE',
      isSimulated: false,
    },
  });

  // Intruder Session
  const intruderSession = await prisma.behavioralSession.create({
    data: {
      userId: demoUser.id,
      sessionToken: 'sess_intruder_sim_999',
      deviceFingerprint: 'fp_unknown_unrecognized_007',
      ipAddress: '185.220.101.5',
      location: 'Frankfurt, Germany',
      currentRiskScore: 0.88,
      riskLevel: 'HIGH',
      mfaState: 'CHALLENGED',
      isSimulated: true,
      simulationType: 'BOT_ATTACK',
    },
  });

  // Risk Assessments
  await prisma.riskAssessment.createMany({
    data: [
      {
        sessionId: activeSession.id,
        userId: demoUser.id,
        overallRiskScore: 0.08,
        riskLevel: 'LOW',
        anomalyScore: 0.04,
        explainableFactors: JSON.stringify([
          { feature: 'Keystroke Dwell Time', impact: 'NORMAL', score: 0.03, description: 'Matches baseline' },
        ]),
        adaptiveMfaTrigger: false,
      },
      {
        sessionId: intruderSession.id,
        userId: demoUser.id,
        overallRiskScore: 0.88,
        riskLevel: 'HIGH',
        anomalyScore: 0.92,
        explainableFactors: JSON.stringify([
          { feature: 'Mouse Jerk/Linearity', impact: 'CRITICAL_ANOMALY', score: 0.45, description: 'Robotic linear mouse vector' },
        ]),
        adaptiveMfaTrigger: true,
      },
    ],
  });

  // Security Alerts
  await prisma.securityAlert.createMany({
    data: [
      {
        sessionId: intruderSession.id,
        userId: demoUser.id,
        title: 'Behavioral Anomaly & Bot Trajectory Detected',
        description: 'Session risk score spiked to 88%. Linear mouse movements detected.',
        severity: 'HIGH',
        status: 'NEW',
        metadata: JSON.stringify({ ip: '185.220.101.5', score: 0.88 }),
      },
    ],
  });

  // Threat Logs
  await prisma.threatLog.createMany({
    data: [
      { lat: 37.7749, lng: -122.4194, location: 'San Francisco, CA, US', riskScore: 0.08, type: 'AUTHORIZED_SESSION' },
      { lat: 50.1109, lng: 8.6821, location: 'Frankfurt, Germany', riskScore: 0.92, type: 'BOT_ATTACK' },
      { lat: 55.7558, lng: 37.6173, location: 'Moscow, Russia', riskScore: 0.96, type: 'CREDENTIAL_STUFFING' },
    ],
  });

  console.log('✅ Aegis AI database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
