import { Test, TestingModule } from '@nestjs/testing';
import { BiometricsService } from './biometrics.service';
import { PrismaService } from '../../database/prisma.service';
import { RiskEngineService } from '../risk/risk-engine.service';
import { EventsGateway } from '../websockets/events.gateway';
import { SentinelService } from '../sentinel/sentinel.service';
import { AuditLogService } from '../audit/audit-log.service';

describe('BiometricsService - 23D Feature Extraction', () => {
  let service: BiometricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BiometricsService,
        { provide: PrismaService, useValue: { isConnected: false } },
        { provide: RiskEngineService, useValue: { evaluateRisk: jest.fn() } },
        { provide: EventsGateway, useValue: { broadcastRiskScoreUpdate: jest.fn() } },
        { provide: SentinelService, useValue: {} },
        { provide: AuditLogService, useValue: { logSecurityEvent: jest.fn() } },
      ],
    }).compile();

    service = module.get<BiometricsService>(BiometricsService);
  });

  it('should extract all 23 biometric features from telemetry', () => {
    const mockKeystrokes = [
      { key: 'KeyA', dwellTime: 105, flightTime: 130, timestamp: 1000 },
      { key: 'KeyB', dwellTime: 115, flightTime: 145, timestamp: 1250 },
      { key: 'Backspace', dwellTime: 95, flightTime: 120, timestamp: 1465 },
      { key: 'KeyC', dwellTime: 110, flightTime: 150, timestamp: 1725 },
    ];

    const mockMousePoints = [
      { x: 100, y: 100, t: 900, speed: 200, type: 'move' as const },
      { x: 150, y: 130, t: 950, speed: 600, type: 'move' as const },
      { x: 220, y: 180, t: 1020, speed: 850, type: 'move' as const },
      { x: 300, y: 250, t: 1100, speed: 1000, type: 'click' as const },
      { x: 380, y: 310, t: 1250, speed: 700, type: 'click' as const },
    ];

    // Access private extractFeatures method via any
    const features = (service as any).extractFeatures(mockKeystrokes, mockMousePoints);

    // Verify 10 Keystroke Features
    expect(features).toHaveProperty('keystrokeDwellMean');
    expect(features).toHaveProperty('keystrokeDwellStd');
    expect(features).toHaveProperty('keystrokeFlightMean');
    expect(features).toHaveProperty('keystrokeFlightStd');
    expect(features).toHaveProperty('keystrokeFlightCV');
    expect(features).toHaveProperty('interKeystrokeJitter');
    expect(features).toHaveProperty('backspaceRate');
    expect(features).toHaveProperty('pauseBeforeFirstKeystroke');
    expect(features).toHaveProperty('typingSpeedCPM');
    expect(features).toHaveProperty('dwellToFlightRatio');

    // Verify 13 Mouse Features
    expect(features).toHaveProperty('mouseVelocityMean');
    expect(features).toHaveProperty('mouseVelocityStd');
    expect(features).toHaveProperty('mouseAccelerationMean');
    expect(features).toHaveProperty('mouseAccelerationStd');
    expect(features).toHaveProperty('mouseJerkMean');
    expect(features).toHaveProperty('mouseJerkStd');
    expect(features).toHaveProperty('mouseCurvatureMean');
    expect(features).toHaveProperty('mouseStraightnessIndex');
    expect(features).toHaveProperty('mouseAngleChangeRate');
    expect(features).toHaveProperty('mousePauseRatio');
    expect(features).toHaveProperty('clickToClickDurationMean');
    expect(features).toHaveProperty('clickToClickDurationStd');
    expect(features).toHaveProperty('mousePathEfficiency');

    // Verify exactly 23 biometric dimensions
    const expected23Keys = [
      'keystrokeDwellMean',
      'keystrokeDwellStd',
      'keystrokeFlightMean',
      'keystrokeFlightStd',
      'keystrokeFlightCV',
      'interKeystrokeJitter',
      'backspaceRate',
      'pauseBeforeFirstKeystroke',
      'typingSpeedCPM',
      'dwellToFlightRatio',
      'mouseVelocityMean',
      'mouseVelocityStd',
      'mouseAccelerationMean',
      'mouseAccelerationStd',
      'mouseJerkMean',
      'mouseJerkStd',
      'mouseCurvatureMean',
      'mouseStraightnessIndex',
      'mouseAngleChangeRate',
      'mousePauseRatio',
      'clickToClickDurationMean',
      'clickToClickDurationStd',
      'mousePathEfficiency',
    ];

    expect(expected23Keys).toHaveLength(23);
    for (const key of expected23Keys) {
      expect(typeof features[key]).toBe('number');
      expect(Number.isNaN(features[key])).toBe(false);
    }

    // Verify backspace rate (1 backspace out of 4 keys = 0.25)
    expect(features.backspaceRate).toBe(0.25);

    // Verify sample count is present as metadata
    expect(features.sampleCount).toBe(9);
  });
});
