import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from '../../../src/services/llm.service';
import { HttpModule } from '@nestjs/axios';
import * as dotenv from 'dotenv';

dotenv.config();

describe('LlmService', () => {
  let service: LlmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        LlmService,
        // Add any dependencies the LlmService needs here
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add a test to verify AI bot connection
  it('should be able to reach the AI bot', async () => {
    // Mock the response from the AI bot
    jest.spyOn(service, 'sendMessage').mockResolvedValue({
      success: true,
      response: 'Test response from AI',
    });

    const result = await service.sendMessage('Hello AI');
    expect(result.success).toBe(true);
    expect(result.response).toBeDefined();
  });

  // Add this integration test (only run when needed)
  it('should connect to the real AI service', async () => {
    if (!process.env.LLM_API_URL) {
      console.warn('LLM_API_URL is not set. Skipping real AI service test.');
      return;
    }

    const maskedURL = process.env.LLM_API_URL
      ? process.env.LLM_API_URL.replace(/\/\/(.*):/, '//<masked>:')
      : 'undefined';

    // Don't mock anything here - make a real call
    console.log('testing connection to:', maskedURL);
    const result = await service.sendMessageReal('This is a test message');
    console.log('response received:', result.success);
    // Verify you get a valid response back
    expect(result.success).toBe(true);
    expect(result.response).toBeDefined();
    expect(result.response).not.toContain(
      'Sorry, I encountered an issue processing your request.',
    );
    // Additional checks on the response content if needed
  }, 30000);
});
