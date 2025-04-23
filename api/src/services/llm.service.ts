import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LlmService {
    private readonly logger = new Logger(LlmService.name);
    private apiUrl: string;

    // Mock implementation for testing purposes
    async sendMessage(message: string): Promise<{ success: boolean; response: string }> {
        // Mock implementation for now
        return {
            success: true,
            response: `Echo: ${message}`,
        };
    }

    // Real implementation that connects to the LLM service
    // Must get new IP from instance and start ollama every time it restarts
    async sendMessageReal(message: string): Promise<{ success: boolean; response: string }> {
        try {
            // Use the actual LLM implementation
            const response = await this.generateResponse(message);
            return {
                success: true,
                response: response
            };
        } catch (error) {
            this.logger.error(`Error in sendMessageReal: ${error.message}`);
            return {
                success: false,
                response: 'Sorry, I encountered an issue processing your request.'
            };
        }
    }

    constructor() {
        // Get URL of dedicated LLM VM from environment variables
        this.apiUrl = process.env.LLM_API_URL || 
                    'http://vm-ip:11434/api/generate';
        this.logger.log(`LLM API URL: ${this.apiUrl}`);
    }

    async generateResponse(prompt: string, history: string[] = []): Promise<string> {
        // Included a bunch of logs for debugging purposes
        try {
        const startTime = Date.now();
        this.logger.log(`Starting request - Prompt: "${prompt.substring(0, 30)}...", History entries: ${history.length}`);

        if (!prompt) {
            this.logger.warn('Received empty prompt');
            return "I didn't receive a message. What would you like to discuss?";
        }
        
        // I tried to include some sanitation here, but I don't think it works and leaving it here for sake of not breaking anything
        // Remove PII before sending to LLM
        const sanitizedPrompt = this.sanitizeInput(prompt);
        this.logger.log(`PII sanitization complete: ${Date.now() - startTime}ms`);
        
        // Build prompt with history
        const promptBuildStart = Date.now();
        const fullPrompt = this.buildPrompt(sanitizedPrompt, history);
        this.logger.log(`Prompt built - Length: ${fullPrompt.length} - Time: ${Date.now() - promptBuildStart}ms`);
        
        // Call LLM API
        const apiCallStart = Date.now();
        // Current parameters have improved response quality
        const response = await axios.post(this.apiUrl, {
            model: 'phi3',
            prompt: fullPrompt,
            stream: false,
            temperature: 0.2,  // Lower temperature for more consistent responses
            num_predict: 512,  // Increase token limit to avoid truncation
            top_k: 40,         // More variety
            top_p: 0.95        // Less restrictive
        });
        const apiCallTime = Date.now() - apiCallStart;
        
        // Get and log raw response
        const rawResponse = response.data.response || '';
        this.logger.log(`Raw LLM response (${apiCallTime}ms): "${rawResponse.substring(0, 100)}..."`);
        
        // Clean up the response
        const postProcessStart = Date.now();
        let cleanedResponse = rawResponse;
        
        // I was getting lots of weird responses with "Human:" and "AI:" markers
        // Leaving this here for now to prevent any bad-reactions, but I think it can be removed later if needed
        // Remove conversation markers and extra dialog
        cleanedResponse = cleanedResponse.split(/\n(Human|User|AI|Assistant):/i)[0].trim();
        
        // Remove meta-commentary about the conversation
        cleanedResponse = cleanedResponse.replace(/^(Yes|No),?\s*(the human|the user).{0,100}(provided|asked|said|mentioned).{0,200}/i, '');
        cleanedResponse = cleanedResponse.replace(/^(This|The)\s+(conversation|message|text|prompt).{0,200}/i, '');
        cleanedResponse = cleanedResponse.replace(/^(Based on|According to).{0,50}(conversation|message|text).{0,100}/i, '');
        
        // Remove references to AI's limitations
        cleanedResponse = cleanedResponse.replace(/^(I|As an AI).{0,50}(don't|cannot|can't|am unable to).{0,100}/i, '');
        cleanedResponse = cleanedResponse.replace(/^The\s+AI\s+assistant\s+(does not|cannot|is unable to).{0,100}/i, '');
        
        // Remove hanging dialog markers and clean up
        cleanedResponse = cleanedResponse.replace(/\bHuman\b:?$/i, '').trim();
        
        // Log cleaned response
        this.logger.log(`Cleaned response: "${cleanedResponse.substring(0, 100)}..."`);
        
        // Provide fallback if we've removed too much
        if (cleanedResponse.trim().length < 15) {
            cleanedResponse = "I'd be happy to help with that. What specific information would you like?";
            this.logger.warn('Using fallback response due to short/empty cleaned response');
        }
        
        const totalTime = Date.now() - startTime;
        this.logger.log(`Total request time: ${totalTime}ms - API: ${apiCallTime}ms (${Math.round(apiCallTime/totalTime*100)}%), Post-processing: ${Date.now() - postProcessStart}ms`);
        
        return cleanedResponse.trim();
        } catch (error) {
        this.logger.error(`Error calling LLM service: ${error.message}`);
        if (error.response) {
            this.logger.error(`Error details: ${JSON.stringify(error.response.data || {})}`);
        }
        return 'Sorry, I encountered an issue processing your request.';
        }
    }

    // Again, according to the logs, I do not see anything being redacted
    private sanitizeInput(input: string): string {
        if (!input) {
        this.logger.warn('Received undefined or empty input');
        return '';
        }
        
        // Detect and redact PII
        const piiPatterns = [
        { pattern: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, label: 'SSN' },
        { pattern: /\b\d{16}\b/g, label: 'CC_NUMBER' },
        { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, label: 'EMAIL' },
        { pattern: /\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/g, label: 'PHONE' },
        { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, label: 'PHONE' }
        ];

        let sanitized = input;
        piiPatterns.forEach(({ pattern, label }) => {
        sanitized = sanitized.replace(pattern, `[REDACTED_${label}]`);
        });
        
        return sanitized;
    }

    // Personalize the prompt with clearer instructions
    private buildPrompt(userInput: string, history: string[]): string {
        const systemPrompt = 
        'You are a helpful assistant. ' +
        'Provide direct, natural responses to questions. ' +
        'Keep responses concise but complete. ' +
        'Never mention that you are an AI. ' +
        'Never ask for personal information. ' +
        'Do not add dialog markers like "Human:" or "AI:" in your response.';
        
        let fullPrompt = systemPrompt + '\n\n';
        
        // I was getting weird responses with tinyllama and left this here to prevent any bad-reactions
        // Add conversation history with clear separation
        if (history.length > 0) {
        // Add max 4 recent messages to avoid context overflow
        const recentHistory = history.slice(-4);
        fullPrompt += "--- CONVERSATION HISTORY ---\n";
        
        for (let i = 0; i < recentHistory.length; i++) {
            const role = i % 2 === 0 ? 'Human' : 'Assistant';
            fullPrompt += `${role}: ${recentHistory[i]}\n`;
        }
        fullPrompt += "--- END OF HISTORY ---\n\n";
        }
        
        // Make the user input format clearer
        fullPrompt += `Human: ${userInput}\nAssistant:`;
        
        return fullPrompt;
    }
}