# PKM Builder

Competitive Pokémon team builder con guardado en Supabase.

## Setup

### 1. Supabase — ejecutar en SQL Editor

```sql
create table teams (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  format text default 'OU',
  pokemon jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table teams enable row level security;

create policy "Users can manage their own teams"
  on teams for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 2. Correr localmente

Necesitás un servidor HTTP (no podés abrir `index.html` directo por los módulos ES):

```bash
# Con Python
python3 -m http.server 8080

# Con Node/npx
npx serve .

# Con VS Code: Live Server extension
```

Luego abrí `http://localhost:8080`

## Estructura

```
pokemon-builder/
├── index.html          # App principal
├── style.css           # Estilos (dark retro-game aesthetic)
├── app.js              # Lógica principal + render
└── supabase-client.js  # Config Supabase
```

## Features

- 🔐 Auth completo (login / signup) con Supabase
- 💾 Guardar/cargar equipos en cuenta
- 🎮 Builder completo: moves, EVs, IVs, ability, nature, tera type, shiny
- 📋 Import/Export formato Showdown
- 🌐 Sprites e información desde PokéAPI
- 🎨 UI dark retro-game con tipografía Press Start 2P + Rajdhani
