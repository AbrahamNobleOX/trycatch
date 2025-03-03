# @clevali/trycatch

A lightweight, type-safe try/catch wrapper for handling async operations in TypeScript. Simplifies error handling by providing a consistent, type-safe way to handle both success and error cases.

## Features

- 🎯 Type-safe error handling
- 🪶 Zero dependencies
- 💫 Simple, intuitive API
- 📘 Full TypeScript support
- 📦 ESM and CommonJS support

## Installation

```bash
npm install @clevali/trycatch
```

## Usage

### Basic Usage

```typescript
import { tryCatch } from "@clevali/trycatch";

const result = await tryCatch(sampleFunction());

const { error, data } = result;
```

### Example Usage

```typescript
import { tryCatch } from "@clevali/trycatch";
import axios from "axios";

// sample function that returns a promise
async function sampleFunction() {
  const result = await tryCatch(axios.post(`https://github.com/octocat`));

  if (result.error) {
    throw {
      code: result.error.code || 500,
      message: result.error.message,
    };
  }

  return "Hello, world!";
}

// main function
async function main() {
  const result = await tryCatch(sampleFunction());

  if (result.error) {
    console.log(result.error.code); // 400
    console.log(result.error.message); // "Bad Request"
  }

  console.log(result.data); // "Hello, world!"
}
```

### Error Handling

The package provides standardized error messages for common HTTP status codes. For example:

Common HTTP status codes are automatically mapped to their standard messages:

```
- 400: "Bad Request"
- 401: "Unauthorized"
- 403: "Forbidden"
- 404: "Not Found"
- 405: "Method Not Allowed"
- 408: "Request Timeout"
- 409: "Conflict"
- 429: "Too Many Requests"
- 500: "Internal Server Error"
- 502: "Bad Gateway"
- 503: "Service Unavailable"
- 504: "Gateway Timeout"
```
