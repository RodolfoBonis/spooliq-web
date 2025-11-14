# SpoolIQ - Frontend

Plataforma SaaS completa para gerenciamento de orçamentos de impressão 3D.

## 🚀 Stack Tecnológica

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Charts**: Recharts

## 🛠️ Setup do Projeto

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# Rodar em desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

### Build para Produção

```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação (login, register)
│   ├── (platform)/        # Rotas protegidas (dashboard, budgets, etc)
│   ├── (admin)/           # Admin platform
│   └── (marketing)/       # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Sidebar, Topbar
│   ├── auth/              # Protected route, etc
│   └── ...                # Feature-specific components
├── lib/
│   ├── api/               # API client (Axios)
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── validations/       # Zod schemas
│   └── constants/         # Constants (roles, etc)
├── stores/                # Zustand stores
├── types/                 # TypeScript types
└── services/              # Business logic / API services
```

## 🎨 Design System

O projeto utiliza um design system inspirado no Airbnb, com:

- **Cores Primárias**: Coral (#ff6b6b)
- **Cores Neutras**: Cinzas profissionais (#f7f7f7 a #222222)
- **Accent**: Teal (#26c5c5)
- **Status Colors**: Profissionais e sutis

Veja `DESIGN_SYSTEM_COLORS.md` para detalhes completos.

## 🔐 Autenticação

O sistema utiliza JWT tokens com armazenamento local via Zustand persist.

### Roles/Permissões

- **PlatformAdmin**: Admin da plataforma
- **Owner**: Dono da empresa
- **OrgAdmin**: Administrador da organização
- **User**: Usuário padrão

## 📚 Documentação

- `FRONTEND_SPECS.md`: Especificações completas do frontend
- `FRONTEND_API_VALIDATION.md`: Validação de endpoints da API

## 🧪 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm start        # Inicia servidor produção
npm run lint     # Lint com ESLint
```

## 🌐 Variáveis de Ambiente

```env
API_URL=http://localhost:8080/v1
```

## 📝 Convenções de Código

- **TypeScript**: Tipos sempre explícitos
- **Naming**:
  - Arquivos: `kebab-case.tsx`
  - Componentes: `PascalCase`
  - Funções/variáveis: `camelCase`
  - Constantes: `SCREAMING_SNAKE_CASE`
- **Idioma**:
  - UI/Textos: Português (Brasil)
  - Código/Comentários: Inglês

## 🚧 Status do Desenvolvimento

### ✅ Completo

- Setup inicial do projeto
- Configuração Tailwind + shadcn/ui
- Sistema de autenticação (login/register)
- Layout principal (Sidebar + Topbar)
- Protected routes

### 🔄 Em Progresso

- Dashboard com métricas
- CRUD de Clientes
- CRUD de Catálogo (Filamentos, Materiais, Marcas)
- Sistema de Orçamentos
- Presets
- Branding PDF
- User Management
- Landing Page

## 📄 Licença

Proprietary - SpoolIQ

---

**Desenvolvido com ❤️ para revolucionar orçamentos de impressão 3D**

