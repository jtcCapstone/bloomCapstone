import { Module } from '@nestjs/common';
import { LlmController } from '../controllers/llm.controller';
import { LlmService } from '../services/llm.service';

// LlmModule is responsible for handling interactions with the LLM
// It provides the LlmService which contains methods to send messages to the LLM
// and receive responses. The LlmController exposes endpoints for chat functionality.
@Module({
  controllers: [LlmController],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}