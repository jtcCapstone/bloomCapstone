---

                        User
                         │
                         ▼
              +------------------------+
              |  ChatbotLogic UI       |   ← React Component (enhanced with quickstart UI patterns)
              +------------------------+
                         │
            ┌────────────┴─────────────┐
            │        Input             │
            │    (User Query)          │
            └────────────┬─────────────┘
                         │
                         ▼
             +--------------------------+
             | Input & Fallback Handler |
             |      Logic (Dual-mode)   |   ← Validates input and triggers:
             |                          |       • Logic-based queries
             |                          |       • Pure LLM mode (using llm.service.ts)
             +--------------------------+
                         │
                    ┌────┴─────┐
                    │          │
                    ▼          ▼
         +----------------+   +---------------------+
         | Logic-based    |   | Pure LLM Mode API   |
         | Interaction    |   | (Using llm.service.ts)|
         +----------------+   +---------------------+
                    │          │
                    └────┬─────┘
                         │
                 +---------------+
                 | Unified       |
                 | Response &    |   ← Rendered in ChatbotLogic UI
                 | Rendering     |
                 +---------------+
                         │
                         ▼
                   User Receives Answer

---

Diagram created based on our dual-mode assistant integration plan.
