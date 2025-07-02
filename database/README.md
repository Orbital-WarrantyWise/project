# Database

1. Install dependencies

```bash
pnpm install
```

2. Run docker instance

```bash
npx supabase start
```

**Troubleshooting**

- `failed to start docker container: Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:54322 -> 0.0.0.0:0: listen tcp 0.0.0.0:54322: bind: An attempt was made to access a socket in a way forbidden by its access permissions.`: Refer to [this](https://github.com/supabase/cli/issues/1010#issuecomment-1553564632).
- `supabase_vector_database container is not ready: unhealthy`: Refer to [this](https://github.com/supabase/cli/issues/2588#issuecomment-2706115863).

## TypeScript support

To generate types for TypeScript support:

1. Login to Supabase

```bash
npx supabase login
```

2. Run local supabase instances

```bash
pnpm run start
```

3. Generate types

```bash
pnpm run gen:types
```
