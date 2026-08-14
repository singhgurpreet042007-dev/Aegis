import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SentinelService } from './sentinel.service';
import { PrismaService } from '../../database/prisma.service';
import { RiskEngineService } from '../risk/risk-engine.service';
import { AuditLogService } from '../audit/audit-log.service';

describe('SentinelService', () => {
  let service: SentinelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SentinelService,
        {
          provide: PrismaService,
          useValue: {
            isConnected: false,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value'),
          },
        },
        {
          provide: RiskEngineService,
          useValue: {},
        },
        {
          provide: AuditLogService,
          useValue: {
            log: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<SentinelService>(SentinelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate script tags and register URL', async () => {
    const res = await service.scanAndRegisterUrl('https://example.com', 'admin@example.com');

    expect(res.success).toBe(true);
    expect(res.data.scannedUrl).toBe('https://example.com');
    expect(res.data.siteId).toBeDefined();
    expect(res.data.scriptTag).toContain('aegis-tracker.js');
  });

  it('should execute comprehensive posture scan for domain', async () => {
    const report = await service.runComprehensivePostureScan('example.com');

    expect(report.targetUrl).toBe('https://example.com');
    expect(report.securityScore).toBeGreaterThanOrEqual(0);
    expect(report.securityHeaders.length).toBeGreaterThan(0);
  });
});
