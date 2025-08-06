# Simple CRUD Backend with Hono

This project is a simple CRUD backend built using the [Hono](https://hono.dev/) framework. It provides essential endpoints for user authentication and CRUD operations for posts. The backend is designed with modern best practices, including token-based authentication, request validation, and secure password hashing.

## Features

### Authentication

- **POST /auth/signup**: Register a new user.
  - Validates the request body using [Zod](https://zod.dev/).
  - Hashes passwords securely with [argon2](https://github.com/ranisalt/node-argon2).
- **POST /auth/login**: Authenticate a user.
  - Implements access and refresh token strategies.
  - Returns the access token in the response and sets the refresh token as an HTTP-only cookie.

### Posts

- **GET /posts**: Retrieve all posts (public endpoint).
- **GET /posts/:id**: Retrieve a specific post by ID (public endpoint).
- **POST /posts**: Create a new post (requires bearer token).
  - Validates the request body using Zod.
  - Extracts the `created_by` ID from the token.
  - Silently renews the access token if expired, provided the refresh token is valid.
- **PATCH /posts/:id**: Update a post by ID (requires bearer token).
  - Validates the request body using Zod.
  - Ensures only authorized users can update posts.
  - Silently renews the access token if expired, provided the refresh token is valid.
- **DELETE /posts/:id**: Delete a post by ID (requires bearer token).
  - Ensures only authorized users can delete posts.
  - Silently renews the access token if expired, provided the refresh token is valid.

## Technologies Used

- [Hono](https://hono.dev/) - Lightweight web framework.
- [argon2](https://github.com/ranisalt/node-argon2) - Secure password hashing.
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe SQL ORM.
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - Token-based authentication.
- [Zod](https://zod.dev/) - Schema validation.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/crud-with-hono.git
   cd crud-with-hono
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     DATABASE_URL=your_database_url
     ACCESS_TOKEN_SECRET=your_jwt_secret
     REFRESH_TOKEN_SECRET=your_refresh_token_secret
     ```

4. Run database migrations (if applicable):
   ```bash
   npm run migrate
   ```

## Running the Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. The server will be available at `http://localhost:3000`.

## Testing

- Use tools like [Postman](https://www.postman.com/) or [cURL](https://curl.se/) to test the API endpoints.
- Ensure you include the bearer token in the `Authorization` header for protected routes.

## Acknowledgments

- [Hono](https://hono.dev/) for the lightweight and fast web framework.
- [argon2](https://github.com/ranisalt/node-argon2) for secure password hashing.
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database interactions.
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) for token-based authentication.
- [Zod](https://zod.dev/) for schema validation.
