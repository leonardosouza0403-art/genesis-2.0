# GENESIS 2.0 - Copilot Instructions

You are contributing to the GENESIS 2.0 project.

Always follow these rules.

## Architecture

- Use Clean Architecture.
- Use SOLID principles.
- Use modular architecture.
- Keep low coupling.
- Prefer composition over inheritance.
- Never create circular dependencies.

## Language

- Always use TypeScript.
- Strict mode is mandatory.
- Avoid "any".
- Prefer readonly when possible.
- Prefer immutable objects.

## Project Rules

- Never rewrite unrelated files.
- Change only what is necessary.
- Never duplicate code.
- Keep files small.
- Keep responsibilities separated.

## Kernel

The Kernel is the heart of GENESIS.

Never change Kernel public contracts unless explicitly requested.

## Contracts

Contracts are immutable unless versioned.

Never break compatibility.

## Naming

Use English for:

- files
- folders
- interfaces
- classes
- enums
- types

Documentation may be written in Portuguese.

## Code Style

Prefer:

- explicit code
- readable code
- deterministic code

Avoid:

- magic numbers
- hidden side effects
- global state

## Quality

Every implementation must:

- compile
- typecheck
- build
- be production ready

Never generate placeholder code unless explicitly requested.

GENESIS is a long-term project.

Always preserve architecture consistency.