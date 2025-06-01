# Milo Journal - Plataforma Académica Descentralizada

[![IC Badge](https://img.shields.io/badge/Internet%20Computer-29ABE2?style=for-the-badge&logo=internet-computer&logoColor=white)](https://internetcomputer.org/)
[![Motoko Badge](https://img.shields.io/badge/Motoko-6C2C91?style=for-the-badge&logo=dfinity&logoColor=white)](https://github.com/dfinity/motoko)
[![React Badge](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind Badge](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **Plataforma descentralizada de publicación académica construida sobre Internet Computer Protocol (ICP)**

Milo Journal permite a investigadores publicar papers, participar en peer review comunitario y ser recompensados con tokens por sus contribuciones a la comunidad científica.

## 🎯 Características Principales

- ✅ **Descentralización completa** en Internet Computer
- ✅ **Sistema de peer review** comunitario con incentivos
- ✅ **Economía de tokens** ($INV) integrada
- ✅ **Estados automáticos** de papers basados en votación
- ✅ **Autenticación** vía Internet Identity
- ✅ **Interface moderna** con React + Tailwind CSS
- ✅ **Transparencia total** en el proceso de revisión

## 🚀 Inicio Rápido

### Prerrequisitos

```bash
# Instalar DFX (IC SDK)
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# Instalar Node.js y npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

### Instalación Local

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd milo_journal

# 2. Iniciar replica local de IC
dfx start --background

# 3. Desplegar canisters
dfx deploy

# 4. Instalar dependencias del frontend
cd src/milo_journal_frontend
npm install

# 5. Iniciar servidor de desarrollo
npm run dev
```

### Acceso a la Aplicación

1. Abrir http://localhost:5173
2. Hacer click en "Conectar con Internet Computer"
3. Autenticarse con Internet Identity
4. Registrar tu usuario en la plataforma
5. ¡Comenzar a publicar y revisar papers!

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Motoko Actor   │    │  IC Blockchain  │
│                 │◄──►│                 │◄──►│                 │
│  - UI/UX        │    │  - Lógica       │    │  - Persistencia │
│  - Estado Local │    │  - Validación   │    │  - Consenso     │
│  - Interacción  │    │  - Tokens       │    │  - Seguridad    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Stack Tecnológico

| Componente | Tecnología | Descripción |
|------------|------------|-------------|
| **Backend** | Motoko | Smart contracts en Internet Computer |
| **Frontend** | React 19 | Interface de usuario moderna |
| **Estilos** | Tailwind CSS | Framework CSS utility-first |
| **Iconos** | Lucide React | Biblioteca de iconos minimalista |
| **Autenticación** | Internet Identity | Sistema de identidad descentralizada |
| **Blockchain** | Internet Computer | Plataforma blockchain escalable |

## 💰 Economía de Tokens ($INV)

### Flujo de Tokens

graph TD
    A[Usuario se registra] --> B[Recibe 1000 $INV iniciales]
    B --> C[Publica paper<br/>Costo: -100 $INV]
    C --> D[Paper en estado<br/>📄 Proposal]
    D --> E[Otros usuarios<br/>pueden votar]
    E --> F[Revisor recibe<br/>💰 +50 $INV por voto]
    F --> G{¿Tiene 3 votos<br/>positivos?}
    G -->|✅ Sí| H[📋 Paper Approved]
    G -->|❌ No| I[⏳ Paper In Process]
    
    style A fill:#e1f5fe
    style H fill:#c8e6c9
    style I fill:#fff3e0
    style G fill:#f3e5f5

### Costos y Recompensas

- **Registro inicial**: 1000 $INV gratis
- **Publicar paper**: -100 $INV
- **Votar en paper**: +50 $INV por voto
- **Límites**: Un voto por paper por usuario

## 📊 Estados de Papers

| Estado | Descripción | Condición |
|--------|-------------|-----------|
| **Proposal** | Propuesta inicial | Paper recién enviado |
| **In Process** | En revisión | Entre -2 y +2 votos netos |
| **Approved** | Aprobado | +3 o más votos netos |
| **Rejected** | Rechazado | -3 o menos votos netos |

## 🛠️ Desarrollo

### Estructura del Proyecto

```
milo_journal/
├── dfx.json                    # Configuración DFX
├── README.md                   # Documentación principal
├── src/
│   ├── milo_journal_backend/   # Backend Motoko
│   │   ├── main.mo            # Smart contract principal
│   │   └── README.md          # Documentación backend
│   └── milo_journal_frontend/  # Frontend React
│       ├── src/               # Código fuente React
│       ├── package.json       # Dependencias NPM
│       └── README.md          # Documentación frontend
└── .gitignore
```

### Scripts Disponibles

```bash
# Desarrollo
dfx start --background          # Iniciar replica local
dfx deploy                      # Desplegar canisters
npm run dev                     # Servidor desarrollo frontend

# Producción
dfx deploy --network ic         # Desplegar en mainnet
npm run build                   # Build producción

# Utilidades
dfx canister id <canister>      # Obtener ID de canister
dfx canister call <canister> <method>  # Llamar método
```

## 🔐 Seguridad

### Validaciones Backend
- **Autenticación**: Verificación de identidad en cada operación
- **Autorización**: Solo propietarios pueden realizar ciertas acciones
- **Prevención double-spending**: Verificación de balance antes de deducir tokens
- **Unicidad de votos**: Un voto por usuario por paper
- **Anti-auto-votación**: Usuarios no pueden votar sus propios papers

### Validaciones Frontend
- **Sanitización de inputs**: Validación de campos obligatorios
- **Manejo de errores**: Gestión robusta de errores de red
- **Consistencia de estado**: Sincronización con backend tras operaciones
- **Feedback visual**: Loading states y confirmaciones

## 📚 API Reference

### Funciones Principales

```motoko
// Gestión de usuarios
registerUser(username: Text) -> Result<Text, Text>
getUserInfo() -> Result<User, Text>

// Gestión de papers
submitPaper(title: Text, content: Text) -> Result<Nat, Text>
getAllPapers() -> [Paper]
getPaper(paperId: Nat) -> Result<Paper, Text>
getPapersByStatus(status: PaperStatus) -> [Paper]

// Sistema de votación
votePaper(paperId: Nat, approve: Bool) -> Result<Text, Text>

// Estadísticas
getSystemStats() -> {totalPapers: Nat; totalUsers: Nat; approvedPapers: Nat}
```

### Tipos de Datos

```motoko
type PaperStatus = {#Proposal; #InProcess; #Approved; #Rejected};

type Paper = {
    id: Nat;
    title: Text;
    author: Text;
    authorPrincipal: Principal;
    content: Text;
    status: PaperStatus;
    timestamp: Int;
    votes: Int;
    reviewers: [Principal];
};

type User = {
    principal: Principal;
    username: Text;
    walletAmount: Nat;
    publishedPapers: [Nat];
    reviewedPapers: [Nat];
};
```

## 🌍 Despliegue en Producción

### Mainnet Deployment

```bash
# 1. Crear identidad para mainnet
dfx identity new mainnet-identity
dfx identity use mainnet-identity

# 2. Obtener cycles (visitar https://faucet.dfinity.org/)

# 3. Desplegar en Internet Computer
dfx deploy --network ic

# 4. Verificar despliegue
dfx canister --network ic id milo_journal_backend
dfx canister --network ic id milo_journal_frontend
```

## 💼 Casos de Uso

### Caso 1: Investigador Publica Paper
1. Conecta con Internet Identity
2. Registra cuenta (recibe 1000 $INV)
3. Publica paper (cuesta 100 $INV)
4. Comunidad revisa y vota
5. Paper es aprobado/rechazado automáticamente

### Caso 2: Revisor Participa en Peer Review
1. Explora papers en estado "Proposal" o "In Process"
2. Lee y evalúa contenido académico
3. Vota aprobar/rechazar
4. Recibe 50 $INV por participar
5. Contribuye al consenso científico

## 🛣️ Roadmap

### ✅ Fase 1: Core Platform (Completada)
- Sistema básico de papers y votación
- Economía de tokens funcional
- Interface React moderna
- Conexión ICP completa

### 🔄 Fase 2: Enhanced Features (En desarrollo)
- [ ] Sistema DAO para gobernanza
- [ ] Categorías de papers por disciplina
- [ ] Búsqueda avanzada y filtros
- [ ] Comentarios detallados en papers
- [ ] Sistema de reputación de usuarios

### 🔮 Fase 3: Advanced Functionality
- [ ] NFTs para papers aprobados
- [ ] Staking de tokens para mejores recompensas
- [ ] API externa para integraciones
- [ ] Mobile app React Native
- [ ] Analytics dashboard avanzado

### 🚀 Fase 4: Ecosystem Growth
- [ ] Multi-chain support
- [ ] Partnerships con universidades
- [ ] Grant program para investigadores
- [ ] Marketplace de servicios académicos

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

## 🔗 Enlaces Útiles

- [Internet Computer Documentation](https://internetcomputer.org/docs/current/)
- [Motoko Language Guide](https://internetcomputer.org/docs/current/motoko/main/motoko/)
- [DFX CLI Reference](https://internetcomputer.org/docs/current/references/cli-reference/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Milo Journal v1.0.0** - Revolucionando la publicación académica con tecnología descentralizada.

*Última actualización: Enero 2025*
