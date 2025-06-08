// assistant/scripts/contextualLlmScript.ts
import { AssistantScript } from "../types"
import { incomeAssistantScript } from "./incomeScript"

// Define a structure for page-specific data
export interface PageContextData {
  directLlmWelcomeMessage: string // Page-specific welcome message for LLM mode
  systemPromptHint?: string // A hint/key for the backend to select a detailed system prompt
  specializedScript?: AssistantScript // Add this to allow specialized scripts
}

// The "hashmap" (Record) for page-specific prompts and hints
// Keys are the application endpoints.
export const pageSpecificData: Record<string, PageContextData> = {
  default: {
    // Fallback if no specific page context is matched
    directLlmWelcomeMessage: "You can ask me anything about this page or your application.",
    systemPromptHint: "default_general_assistance",
  },
  "/applications/financial/income": {
    directLlmWelcomeMessage:
      "I can help calculate your income or answer any questions about income requirements.",
    systemPromptHint: "income_assistance",
    specializedScript: incomeAssistantScript,
  },
  // 1. Start Process
  "/applications/start/choose-language": {
    directLlmWelcomeMessage:
      "I can help with language selection for your application. What's your question?",
    systemPromptHint: "start_choose_language",
  },
  "/applications/start/what-to-expect": {
    directLlmWelcomeMessage:
      "Questions about what to expect in the application process? I'm here to help.",
    systemPromptHint: "start_what_to_expect",
  },
  "/applications/start/autofill": {
    directLlmWelcomeMessage: "Need help with auto-fill options for your application? Ask away.",
    systemPromptHint: "start_autofill",
  },
  "/applications/start/community-disclaimer": {
    directLlmWelcomeMessage:
      "Understanding the community disclaimer? Let me clarify any points for you.",
    systemPromptHint: "start_community_disclaimer",
  },
  // 2. Contact Information
  "/applications/contact/name": {
    directLlmWelcomeMessage:
      "Questions about providing the primary applicant's name? I can assist.",
    systemPromptHint: "contact_name",
  },
  "/applications/contact/address": {
    directLlmWelcomeMessage: "Need help with your address information? Let me know what you need.",
    systemPromptHint: "contact_address",
  },
  "/applications/contact/alternate-contact-type": {
    directLlmWelcomeMessage:
      "Choosing an alternate contact type? Ask your questions about this section.",
    systemPromptHint: "contact_alt_type",
  },
  "/applications/contact/alternate-contact-name": {
    directLlmWelcomeMessage: "Questions about the alternate contact's name? I'm here to help.",
    systemPromptHint: "contact_alt_name",
  },
  "/applications/contact/alternate-contact-contact": {
    directLlmWelcomeMessage:
      "Need help with the alternate contact's details (e.g., email, phone)? Ask me.",
    systemPromptHint: "contact_alt_details",
  },
  // 3. Household Information
  "/applications/household/live-alone": {
    directLlmWelcomeMessage:
      "Questions about the 'live alone' section or its implications? I can help.",
    systemPromptHint: "household_live_alone",
  },
  "/applications/household/add-members": {
    directLlmWelcomeMessage:
      "Need assistance with adding household members or the process? Ask away.",
    systemPromptHint: "household_add_members",
  },
  "/applications/household/member": {
    // Assuming this might be a dynamic route, general prompt
    directLlmWelcomeMessage:
      "Questions about providing details for a household member? I'm here to assist.",
    systemPromptHint: "household_member_details",
  },
  "/applications/household/members-info": {
    directLlmWelcomeMessage:
      "Need help with the overall household information summary or specific fields? Let me know.",
    systemPromptHint: "household_members_info_summary", // Differentiated from single member
  },
  "/applications/household/preferred-units": {
    directLlmWelcomeMessage:
      "Questions about selecting preferred unit types (e.g., number of bedrooms)? Ask me.",
    systemPromptHint: "household_preferred_units",
  },
  "/applications/household/student": {
    directLlmWelcomeMessage:
      "Need help with declaring student status for household members? I can assist.",
    systemPromptHint: "household_student_status",
  },
  "/applications/household/ada": {
    directLlmWelcomeMessage:
      "Questions about accessibility needs (ADA) for your household? I'm here to help.",
    systemPromptHint: "household_ada_needs",
  },
  "/applications/household/changes": {
    directLlmWelcomeMessage: "Need to report or ask about household changes? Ask your questions.",
    systemPromptHint: "household_changes",
  },
  // 4. Financial Information
  "/applications/financial/vouchers": {
    directLlmWelcomeMessage:
      "Questions about housing vouchers, subsidies, or rental assistance? I can help.",
    systemPromptHint: "financial_vouchers",
  },
  // 5. Preferences
  "/applications/preferences/all": {
    // Assuming this is a general page for all preferences
    directLlmWelcomeMessage:
      "Need help with declaring your housing preferences? Ask your questions.",
    systemPromptHint: "preferences_all",
  },
  "/applications/preferences/general": {
    directLlmWelcomeMessage: "Questions about general housing preferences? I'm here to assist.",
    systemPromptHint: "preferences_general",
  },
  // 6. Programs
  "/applications/programs/programs": {
    // Assuming this is a general page for programs
    directLlmWelcomeMessage:
      "Need help with program selection or understanding eligibility criteria? Ask away.",
    systemPromptHint: "programs_selection_eligibility",
  },
  // 7. Review & Submit
  "/applications/review/summary": {
    directLlmWelcomeMessage:
      "Ask me anything about reviewing your application summary before submission.",
    systemPromptHint: "review_summary",
  },
  "/applications/review/demographics": {
    directLlmWelcomeMessage: "Questions about the demographic information section? I can help.",
    systemPromptHint: "review_demographics",
  },
  "/applications/review/terms": {
    directLlmWelcomeMessage:
      "Need clarification on the terms and conditions before you submit? Ask me.",
    systemPromptHint: "review_terms",
  },
  "/applications/review/confirmation": {
    directLlmWelcomeMessage:
      "Questions about your submission confirmation or what happens next? I'm here to assist.",
    systemPromptHint: "review_confirmation_next_steps",
  },
  // 8. View Application
  "/applications/view": {
    directLlmWelcomeMessage:
      "Need help viewing your submitted application or understanding its status? Ask your questions.",
    systemPromptHint: "view_application_status",
  },
}

export const getScriptForPage = (pathname: string): AssistantScript => {
  const pageData = pageSpecificData[pathname] || pageSpecificData["default"]

  // If there's a specialized script for this page, return it
  if (pageData.specializedScript) {
    return pageData.specializedScript
  }

  // Otherwise return the general LLM script
  return contextualLlmScript
}

export const contextualLlmScript: AssistantScript = {
  welcomeMessage: "Hello! I'm here to help you with your application.", // Generic initial greeting
  questions: [], // Empty questions array signals to immediately enter pure LLM mode

  // The directLlmWelcomeMessage from pageSpecificData will ideally be used.
  // This can serve as an ultimate fallback if pageSpecificData or a match isn't found.
  directLlmWelcomeMessage: pageSpecificData["default"].directLlmWelcomeMessage,

  fallbackInvalid: "I'm ready for your question. Please type it in.",
  fallbackError: "Sorry, I encountered an issue. Please try asking again.",

  getFinalResult: () => {
    return {
      estimate: "LLM mode active.",
      requiresConfirmation: false, // Already in LLM mode, no confirmation step needed
      finalMessage: "Currently in AI Assistant mode. How can I assist you further?",
    }
  },

  // Expose the pageSpecificData so ChatbotContainer can access it
  pageDataMap: pageSpecificData,
}
