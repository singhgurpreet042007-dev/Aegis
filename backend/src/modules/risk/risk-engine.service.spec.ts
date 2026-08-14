import { Test, TestingModule } from '@nestjs/testing';
import { RiskEngineService } from './risk-engine.service';
import { PrismaService } from '../../database/prisma.service';

describe('RiskEngineService', () => {
  let service: RiskEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskEngineService,
        {
          provide: PrismaService,
          useValue: {
            isConnected: false,
          },
        },
      ],
    }).compile();

    service = module.get<RiskEngineService>(RiskEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate baseline LOW risk score for matching baseline biometrics', async () => {
    const result = await service.evaluateRisk({
      sessionId: 'test_session_1',
      userId: 'test_user_1',
      currentFeatures: {
        keystrokeDwellMean: 100,
        keystrokeDwellStd: 10,
        keystrokeFlightMean: 150,
        keystrokeFlightStd: 15,
        mouseVelocityMean: 500,
        mouseVelocityStd: 50,
        mouseJerkMean: 1000,
        mouseCurvatureMean: 0.1,
      },
      baselineFeatures: {
        keystrokeDwellMean: 100,
        keystrokeDwellStd: 10,
        keystrokeFlightMean: 150,
        keystrokeFlightStd: 15,
        mouseVelocityMean: 500,
        mouseVelocityStd: 50,
        mouseJerkMean: 1000,
        mouseCurvatureMean: 0.1,
      },
      deviceTrusted: true,
    });

    expect(result.overallRiskScore).toBeGreaterThanOrEqual(0.0);
    expect(result.overallRiskScore).toBeLessThan(0.35);
    expect(result.riskLevel).toBe('LOW');
  });

  it('should calculate elevated risk score when telemetry severely deviates from baseline', async () => {
    const result = await service.evaluateRisk({
      sessionId: 'test_session_2',
      userId: 'test_user_2',
      currentFeatures: {
        keystrokeDwellMean: 500, // 5x deviation
        keystrokeDwellStd: 150,
        keystrokeFlightMean: 800,
        keystrokeFlightStd: 200,
        mouseVelocityMean: 3000,
        mouseVelocityStd: 800,
        mouseJerkMean: 20000,
        mouseCurvatureMean: 0.9,
      },
      baselineFeatures: {
        keystrokeDwellMean: 100,
        keystrokeDwellStd: 10,
        keystrokeFlightMean: 150,
        keystrokeFlightStd: 15,
        mouseVelocityMean: 500,
        mouseVelocityStd: 50,
        mouseJerkMean: 1000,
        mouseCurvatureMean: 0.1,
      },
      deviceTrusted: false,
    });

    expect(result.overallRiskScore).toBeGreaterThanOrEqual(0.35);
    expect(['MEDIUM', 'HIGH', 'CRITICAL']).toContain(result.riskLevel);
    expect(result.explainableFactors.length).toBeGreaterThan(0);
  });
});
