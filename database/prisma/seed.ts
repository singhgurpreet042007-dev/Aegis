import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AegisAI Zero Trust Behavioral Biometrics database...');

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
      fullName: 'Alex Vance (SecOps)',
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
      email: 'user@aegisai.io',
      fullName: 'Sarah Connor',
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

  // Create Behavioral Baselines for Sarah Connor
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

  // Create Device Fingerprint
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

  // Create Active Legitimate Session
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

  // Create Anomalous Intruder Session (Simulated Attack)
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

  // Create Risk Assessments
  await prisma.riskAssessment.createMany({
    data: [
      {
        sessionId: activeSession.id,
        userId: demoUser.id,
        overallRiskScore: 0.08,
        riskLevel: 'LOW',
        anomalyScore: 0.04,
        explainableFactors: JSON.stringify([
          { feature: 'Keystroke Dwell Time', impact: 'NORMAL', score: 0.03, description: 'Matches baseline (112ms vs 110ms avg)' },
          { feature: 'Mouse Acceleration', impact: 'NORMAL', score: 0.02, description: 'Natural curved trajectory' },
          { feature: 'Device Fingerprint', impact: 'MATCH', score: 0.0, description: 'Recognized Apple M2 Pro device' },
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
          { feature: 'Mouse Jerk/Linearity', impact: 'CRITICAL_ANOMALY', score: 0.45, description: 'Robotic linear mouse vector detected (Straightness 0.99 vs 0.38 baseline)' },
          { feature: 'Keystroke Flight Time Variance', impact: 'HIGH_ANOMALY', score: 0.28, description: 'Flight time std dev 2.1ms (bot constant delay vs 28.5ms human baseline)' },
          { feature: 'Device Fingerprint', impact: 'UNRECOGNIZED', score: 0.15, description: 'New device fingerprint from unknown TOR exit node' },
        ]),
        adaptiveMfaTrigger: true,
      },
    ],
  });

  // Create Security Alerts
  await prisma.securityAlert.createMany({
    data: [
      {
        sessionId: intruderSession.id,
        userId: demoUser.id,
        title: 'Behavioral Anomaly & Bot Trajectory Detected',
        description: 'Session risk score spiked to 88%. Linear mouse movements and zero-jitter keystrokes indicate automated bot session takeover attempt.',
        severity: 'HIGH',
        status: 'NEW',
        metadata: JSON.stringify({ ip: '185.220.101.5', score: 0.88, country: 'Germany' }),
      },
      {
        sessionId: intruderSession.id,
        userId: demoUser.id,
        title: 'Adaptive Step-Up MFA Triggered',
        description: 'Automatic security intervention challenged session with step-up MFA due to continuous risk threshold breach (>0.75).',
        severity: 'MEDIUM',
        status: 'ACKNOWLEDGED',
        metadata: JSON.stringify({ action: 'MFA_CHALLENGE_ISSUED' }),
      },
    ],
  });

  // Create Threat Map Logs
  await prisma.threatLog.createMany({
    data: [
      { lat: 37.7749, lng: -122.4194, location: 'San Francisco, CA, US', riskScore: 0.08, type: 'AUTHORIZED_SESSION' },
      { lat: 50.1109, lng: 8.6821, location: 'Frankfurt, Germany', riskScore: 0.92, type: 'BOT_ATTACK' },
      { lat: 55.7558, lng: 37.6173, location: 'Moscow, Russia', riskScore: 0.96, type: 'CREDENTIAL_STUFFING' },
      { lat: 39.9042, lng: 116.4074, location: 'Beijing, China', riskScore: 0.88, type: 'SESSION_REPLAY' },
      { lat: -23.5505, lng: -46.6333, location: 'São Paulo, Brazil', riskScore: 0.65, type: 'KEYSTROKE_BURST' },
      { lat: 35.6762, lng: 139.6503, location: 'Tokyo, Japan', riskScore: 0.84, type: 'SESSION_HIJACK' },
      { lat: 51.5074, lng: -0.1278, location: 'London, UK', riskScore: 0.89, type: 'CREDENTIAL_STUFFING' },
    ],
  });

  // Seed Session Replay Events for Intruder Session
  const replayEvents: Array<{ sessionId: string; sequence: number; isAnomaly: boolean; eventData: string }> = [];
  for (let i = 0; i < 30; i++) {
    const isAnomaly = i > 12;
    replayEvents.push({
      sessionId: intruderSession.id,
      sequence: i,
      isAnomaly,
      eventData: JSON.stringify({
        t: i * 200,
        x: 100 + i * 25,
        y: 150 + (isAnomaly ? 0 : Math.sin(i) * 15),
        type: i % 4 === 0 ? 'click' : 'move',
        velocity: isAnomaly ? 2400 : 820,
        dwellTime: isAnomaly ? 10 : 115,
        flightTime: isAnomaly ? 5 : 138,
      }),
    });
  }
  await prisma.sessionReplayEvent.createMany({ data: replayEvents });

  console.log('✅ AegisAI database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
