# TypeScript Utility Types Code Guidelines

## Overview

This guideline provides best practices for using advanced TypeScript utility types to create type-safe, maintainable code. These patterns help eliminate common bugs, improve developer experience, and create more robust applications.

## 1. State Management with Process<T>

### Problem
Traditional state management with boolean flags creates complex logic and potential bugs:

```typescript
// ❌ Avoid: Boolean-based state (8 possible combinations)
type BadState = {
  loading: boolean;
  error: string | null;
  data: User | null;
};
```

### Solution: Process Utility Type

```typescript
/**
 * Represents the state of an asynchronous process.
 * Defaults TData to void (no data) and TError to Error.
 */
type Process<TData = void, TError = Error, TSkipIdle = false> =
  | (TSkipIdle extends false ? { status: "idle" } : never)
  | { status: "busy" }
  | (TData extends void ? { status: "ok" } : { status: "ok"; data: TData })
  | (TError extends void 
      ? { status: "fail" } 
      : { status: "fail"; error: TError });
```

### Best Practices

**✅ Do:**
```typescript
// Clear, discriminated union with 4 states
type UserState = Process<User>;

let state: UserState = { status: "idle" };

const getUser = async (userId: string) => {
  state = { status: "busy" };
  try {
    const user = await apiCallToUser(userId);
    state = { status: "ok", data: user };
  } catch (error) {
    state = { status: "fail", error: "Failed to fetch user" };
  }
};

// Type-safe state checking
if (state.status === "ok") {
  // TypeScript knows 'data' is available here
  console.log(state.data.name);
}
```

**🚫 Don't:**
```typescript
// Complex boolean logic prone to errors
if (loading && !error && data) {
  // Unclear when this condition is met
}
```

### Usage Guidelines

- Use `Process<T>` for any asynchronous operation state
- Set `TSkipIdle = true` when immediate loading is preferred
- Always handle all status cases for exhaustive checking
- Consider custom error types instead of generic `Error`

## 2. API Communication with Result<T>

### Problem
Unhandled promise rejections and inconsistent error handling patterns.

### Solution: Result Utility Type

```typescript
type Result<TData> =
  | { status: 'aborted' }
  | { status: 'fail'; error: unknown }
  | { status: 'ok'; data: TData };
```

### Best Practices

**✅ Do:**
```typescript
const fetchUser = async (id: string): Promise<Result<User>> => {
  // Implementation returns Result<User>
};

const handleUserFetch = async (id: string) => {
  const result = await fetchUser(id);
  
  if (result.status === 'aborted') return;
  
  if (result.status === 'fail') {
    console.error('Error:', result.error);
    return;
  }
  
  if (result.status === 'ok') {
    // TypeScript knows 'data' is available
    console.log('User:', result.data);
    return;
  }
  
  // Exhaustiveness check - ensures all cases are handled
  const _exhaustiveCheck: never = result;
};
```

### Usage Guidelines

- Always include exhaustiveness checking with `never` type
- Use in React hooks for clean unmounting logic
- Consider `aborted` status for cancellable operations
- Prefer `Result<T>` over throwing exceptions in business logic

## 3. Prevent Primitive Obsession with Brand<T>

### Problem
Using primitive types for domain-specific concepts leads to type confusion:

```typescript
// ❌ Both are strings - easy to mix up
const getUserPosts = (userId: string) => { /* ... */ };
const documentId = 'doc-xyz-123';
getUserPosts(documentId); // Bug: wrong parameter type
```

### Solution: Brand Utility Type

```typescript
type Brand<TData, TLabel extends string> = TData & { __brand: TLabel };

// Domain-specific types
type UserId = Brand<string, 'UserId'>;
type DocumentId = Brand<string, 'DocumentId'>;
type EmailAddress = Brand<string, 'EmailAddress'>;
```

### Best Practices

**✅ Do:**
```typescript
// Type-safe function signatures
const getUserPosts = (userId: UserId) => { /* ... */ };
const getDocument = (docId: DocumentId) => { /* ... */ };

// Explicit casting with validation
const createUserId = (value: string): UserId => {
  // Add validation logic here
  if (!value.startsWith('user-')) {
    throw new Error('Invalid user ID format');
  }
  return value as UserId;
};

// Usage
const userId = createUserId('user-123');
const docId = 'doc-456' as DocumentId;

getUserPosts(userId); // ✅ OK
getUserPosts(docId);  // ❌ TypeScript error
```

### Usage Guidelines

- Create branded types for all domain-specific identifiers
- Always use validation functions when creating branded types
- Consider using branded types for units (pixels, milliseconds, etc.)
- The `__brand` property is compile-time only (zero runtime cost)

## 4. Improve Type Readability with Prettify<T>

### Problem
Complex computed types show confusing definitions in IDE tooltips.

### Solution: Prettify Utility Type

```typescript
type Prettify<TObject> = {
  [Key in keyof TObject]: TObject[Key];
} & {};
```

### Best Practices

**✅ Do:**
```typescript
// Complex type that's hard to read
type UserWithPosts = User & { posts: Post[] } & Pick<Profile, 'bio' | 'avatar'>;

// Clean, readable type
type CleanUserWithPosts = Prettify<UserWithPosts>;

// Use in generic constraints
type ApiResponse<T> = Prettify<{
  data: T;
  metadata: {
    timestamp: number;
    version: string;
  };
}>;
```

### Usage Guidelines

- Use sparingly - only when type definitions become unreadable
- Apply to public API types and complex computed types
- Don't overuse - it adds compilation overhead
- Particularly useful for library authors

## 5. Type-Safe URLs with StrictURL<T>

### Problem
Manual URL construction is error-prone and not type-safe.

### Solution: StrictURL Utility Types

```typescript
// Utility types for URL construction
type ToPath<TItems extends string[]> = TItems extends [
  infer Head extends string,
  ...infer Tail extends string[],
]
  ? `${Head}${Tail extends [] ? '' : `/${ToPath<Tail>}`}`
  : '';

type ToQueryString<TParams extends string[]> = TParams extends [
  infer Head extends string,
  ...infer Tail extends string[],
]
  ? `${Head}=${string}${Tail extends [] ? '' : '&'}${ToQueryString<Tail>}`
  : '';

type StrictURL<
  TProtocol extends 'https' | 'http',
  TDomain extends `${string}.${'com' | 'dev' | 'io'}`,
  TPath extends string[] = [],
  TParams extends string[] = [],
> = `${TProtocol}://${TDomain}${TPath extends []
  ? ''
  : `/${ToPath<TPath>}`}${TParams extends []
  ? ''
  : `?${ToQueryString<TParams>}`}`;
```

### Best Practices

**✅ Do:**
```typescript
// Define route types
type UserProfileRoute = StrictURL<'https', 'myapp.com', ['users', string]>;
type SearchRoute = StrictURL<'https', 'api.myapp.com', ['search'], ['q', 'limit']>;

// Type-safe URL builder
const buildUserProfileUrl = (userId: string): UserProfileRoute => {
  return `https://myapp.com/users/${userId}`;
};

// Usage with autocompletion and validation
const profileUrl = buildUserProfileUrl('123');
// Type: "https://myapp.com/users/${string}"
```

### Usage Guidelines

- Define route types at the application level
- Use with URL builders for compile-time validation
- Consider integration with routing libraries
- Extend domain unions as needed for your application

## General Best Practices

### 1. File Organization
```typescript
// utility-types.ts - Keep all utility types in one place
export type Process<TData = void, TError = Error, TSkipIdle = false> = /* ... */;
export type Result<TData> = /* ... */;
export type Brand<TData, TLabel extends string> = /* ... */;
export type Prettify<TObject> = /* ... */;

// domain-types.ts - Domain-specific branded types
export type UserId = Brand<string, 'UserId'>;
export type ProductId = Brand<string, 'ProductId'>;
```

### 2. Naming Conventions
- Use `PascalCase` for utility types
- Use descriptive names that indicate purpose
- Prefix with domain when creating variations (`ApiResult<T>`, `DbResult<T>`)

### 3. Documentation
- Always document complex utility types with JSDoc
- Include usage examples in comments
- Explain the purpose and benefits

### 4. Testing
```typescript
// Type-level tests using TypeScript's built-in assertions
type TestProcess = Process<string>;
type _Test1 = TestProcess extends { status: 'idle' } ? true : false; // true
type _Test2 = Extract<TestProcess, { status: 'ok' }>['data'] extends string ? true : false; // true
```

## Conclusion

These utility types provide a foundation for building more reliable, type-safe TypeScript applications. They help eliminate entire classes of runtime errors by catching issues at compile time, improve code readability, and enhance the developer experience with better autocompletion and refactoring support.

Remember to introduce these patterns gradually to your codebase and ensure your team understands the benefits and usage patterns before widespread adoption.