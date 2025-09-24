# API Documentation

Base URL: `http://localhost:4000/api`

## Auth

### POST /auth/login
Returns a JWT for the provided email. Email is normalized (trim + lowercase).

Request
```json
{
  "email": "user@example.com"
}
```

Response 200
```json
{
  "token": "<jwt>"
}
```

Response 400
```json
{ "error": "Invalid email" }
```

## Profile

Requires header: `Authorization: Bearer <jwt>`

### GET /profile
Response 200
```json
{
  "email": "user@example.com",
  "name": ""
}
```

### PUT /profile
Request
```json
{
  "name": "Ada Lovelace"
}
```

Response 200
```json
{
  "email": "user@example.com",
  "name": "Ada Lovelace"
}
```

Response 400
```json
{ "error": "Invalid profile" }
```

## GitHub

### GET /github/repos?username=:username
Fetches public repos for a GitHub user. Results are cached for ~60 seconds.

Response 200
```json
{
  "cached": false,
  "repos": [
    { "id": 1, "name": "repo", "html_url": "https://...", "stargazers_count": 42 }
  ]
}
```

Response 400
```json
{ "error": "Invalid username" }
```

Response 5xx/4xx from GitHub
```json
{ "error": "GitHub fetch failed" }
```

## Health

### GET /health
Response 200
```json
{ "ok": true }
```


