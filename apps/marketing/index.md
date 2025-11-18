---
layout: home
title: Alette Signal - Frameworks change. Your Front-End API layer shouldn’t.

features:
  - icon: ⚙️
    title: Complete, UI Agnostic core
    details: Works with React, Vue, Svelte, Angular, WebWorkers, or plain JS - feature complete, with no additional libraries required.
  - icon: 🔄
    title: Composable middleware pipeline
    details: Type-safe request pipeline for transforms, interception, rules, auth, retries, and cancellation - fully decoupled from UI lifecycles.
  - icon: 🔗
    title: Immutable request configurations
    details: Compose and reuse requests across monorepo packages without accidental changes or forced type tinkering.
  - icon: 🪝
    title: Lifecycle hooks
    details: Tap into every request stage - from mount to cancellation - without resorting to "useEffect" or UI framework lifecycle.
  - icon: 🔐
    title: Built-in Authorization utilities
    details: Abstract tokens, cookies, and custom auth providers - automatic refresh, rotation, and expiration handling included.
  - icon: ⏪
    title: Built-in Async Retry utilities
    details: Retry failing requests with full access to request data, arguments, and state.
  - icon: 🎲
    title: Custom data providers
    details: Abstract 3rd-party SDKs or define your own request factories using the same type-safe, observable system.
  - icon: 🧩
    title: Typed Context Provider
    details: Share values across request configurations and middleware or integrate with any state manager in a type-safe, testable way.
  - icon: ⛔️
    title: Strict error handling
    details: Handle fully typed, predictable errors. Automatic shutdowns for fatal states and safe recovery for everything else.

hero:
  name: Alette Signal
  text: Frameworks change. Your Front-End API layer shouldn’t
  tagline: Complete front-end API infrastructure for monorepos, workers, and multi-app front-ends - type-safe, reactive, and framework-agnostic.
  image:
    light: /hero-image.png
    dark: /hero-image.png
    alt: Alette Signal code example.
  actions:
    - theme: brand
      text: Get Started
      link: /docs/getting-started/installation
    - theme: alt
      text: See how it works
      link: /docs/getting-started/api-configuration
---