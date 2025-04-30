# Income Assistant Module

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Testing-Library](https://img.shields.io/badge/-TestingLibrary-%23E33332?style=for-the-badge&logo=testing-library&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

## Overview

An AI-powered guided assistant module for Bloom Housing's income verification process. Currently implements basic UI functionality with plans for chat integration.

## Current Implementation

### Component Structure

```
assistant/
├── shared/                    # Reusable components
│   ├── AssistantOpenButton.tsx
│   └── AssistantOpenButton.module.scss
├── income/                    # Income-specific logic
│   ├── IncomeAssistant.tsx    # Main component
│   ├── IncomeAssistant.types.ts
│   ├── IncomeAssistant.module.scss
│   └── __tests__/            # Test files
└── context/                   # Shared state management
    └── AssistantContext.tsx   # Chat state handling
```

### Features

- ✅ Basic UI implementation
- ✅ Minimizable window
- ✅ Type-safe props
- ✅ Basic test coverage
- 🔄 Chat functionality (in progress)

### Component Props

```typescript
interface IncomeAssistantProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  id?: string
  testId?: string
  ariaLabel?: string
  ariaControls?: string
  strings?: {
    title?: string
    close?: string
    error?: string
  }
  children?: ReactNode
  // Chat-related props (coming soon)
  messages?: Message[]
  isProcessing?: boolean
  onSendMessage?: (message: string) => void
  currentStep?: number
  totalSteps?: number
}
```

## Upcoming Features

### Phase 1: Chat Integration

- Message handling
- Step progression
- Error management
- Loading states

### Phase 2: Income Verification

- Income calculation
- Document verification
- Validation rules
- Error handling

### Phase 3: Enhanced UX

- Guided workflows
- Progress tracking
- Data persistence
- Accessibility improvements

## Development Guidelines

### Current Focus

1. Basic UI functionality
2. Test coverage
3. Type safety
4. Accessibility

### Code Standards

- Follow TypeScript strict mode
- Use React Testing Library
- Implement WCAG 2.1 guidelines
- Follow conventional commits

## Testing

Current test coverage focuses on basic UI functionality:

- Component rendering
- Open/close behavior
- Title display
- Minimize functionality

See `__tests__/README.md` for detailed test documentation.

## Resources

### Design System

- [UI Seeds Storybook](https://storybook-ui-seeds.netlify.app)
- [UI Seeds Design System](https://zeroheight.com/5e69dd4e1)

### Development

- [React Documentation](https://react.dev)
- [TypeScript React Guide](https://react-typescript-cheatsheet.netlify.app)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro)

## Contributing

1. Check current sprint in GitHub Projects
2. Create feature branch
3. Follow Bloom's coding standards
4. Submit PR with tests

See [CONTRIBUTING.md](../../../../../../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE.md](../../../../../../LICENSE.md) file for details.
