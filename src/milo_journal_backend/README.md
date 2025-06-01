# Milo Journal Backend - Motoko Smart Contract

> **Backend descentralizado para la plataforma académica Milo Journal construido en Motoko para Internet Computer**

## 🎯 Descripción

Este es el smart contract principal de Milo Journal, implementado en Motoko y desplegado en Internet Computer Protocol (ICP). Gestiona toda la lógica de negocio para la publicación académica descentralizada, incluyendo usuarios, papers, votación y economía de tokens.

## 🏗️ Arquitectura

### Componentes Principales

```
AcademicJournal Actor
├── State Management
│   ├── HashMap<Nat, Paper>           # Storage de papers
│   ├── HashMap<Principal, User>      # Storage de usuarios
│   └── HashMap<Text, Vote>           # Storage de votos
├── User Management
│   ├── registerUser()               # Registro de usuarios
│   └── getUserInfo()                # Información de usuario
├── Paper Management
│   ├── submitPaper()                # Envío de papers
│   ├── getAllPapers()               # Listado de papers
│   ├── getPaper()                   # Paper específico
│   └── getPapersByStatus()          # Filtrado por estado
├── Voting System
│   └── votePaper()                  # Sistema de votación
└── Analytics
    └── getSystemStats()             # Estadísticas del sistema
```

## 📊 Tipos de Datos

### PaperStatus
Estados posibles de un paper académico:

```motoko
public type PaperStatus = {
    #Proposal;   // Propuesta inicial (0 votos)
    #InProcess;  // En proceso de revisión (-2 a +2 votos)
    #Approved;   // Aprobado por la comunidad (+3 votos)
    #Rejected;   // Rechazado por la comunidad (-3 votos)
};
```

### Paper
Estructura principal de un paper académico:

```motoko
public type Paper = {
    id: Nat;                    // ID único del paper
    title: Text;                // Título del paper
    author: Text;               // Nombre del autor
    authorPrincipal: Principal; // Principal del autor en IC
    content: Text;              // Contenido/abstract del paper
    status: PaperStatus;        // Estado actual del paper
    timestamp: Int;             // Timestamp de creación
    votes: Int;                 // Suma neta de votos (+1 approve, -1 reject)
    reviewers: [Principal];     // Lista de revisores que han votado
};
```

### User
Perfil de usuario en la plataforma:

```motoko
public type User = {
    principal: Principal;       // Principal único del usuario
    username: Text;             // Nombre de usuario elegido
    walletAmount: Nat;          // Cantidad de tokens $INV
    publishedPapers: [Nat];     // IDs de papers publicados
    reviewedPapers: [Nat];      // IDs de papers revisados
};
```

### Vote
Registro de un voto en un paper:

```motoko
public type Vote = {
    paperId: Nat;               // ID del paper votado
    voter: Principal;           // Principal del votante
    approve: Bool;              // true = aprobar, false = rechazar
    timestamp: Int;             // Timestamp del voto
};
```

## 💰 Economía de Tokens ($INV)

### Flujo de Tokens

| Acción | Costo/Recompensa | Descripción |
|--------|------------------|-------------|
| **Registro inicial** | +1000 $INV | Tokens gratuitos al registrarse |
| **Publicar paper** | -100 $INV | Costo por enviar un paper |
| **Votar en paper** | +50 $INV | Recompensa por participar en peer review |

### Validaciones Económicas

- ✅ **Verificación de balance**: Antes de deducir tokens
- ✅ **Prevención double-spending**: Control de operaciones concurrentes
- ✅ **Límites de votación**: Un voto por paper por usuario
- ✅ **Anti-auto-votación**: Usuarios no pueden votar sus propios papers

## 🔧 API Reference

### Gestión de Usuarios

#### `registerUser(username: Text) -> Result<Text, Text>`
Registra un nuevo usuario en la plataforma.

**Parámetros:**
- `username`: Nombre de usuario deseado

**Retorno:**
- `Result<Text, Text>`: "Usuario registrado exitosamente" o mensaje de error

**Validaciones:**
- ✅ Usuario no debe estar ya registrado
- ✅ Username no puede estar vacío

**Ejemplo:**
```motoko
let result = await actor.registerUser("Dr. Smith");
// Result: #ok("Usuario registrado exitosamente")
```

#### `getUserInfo() -> Result<User, Text>`
Obtiene información del usuario autenticado.

**Retorno:**
- `Result<User, Text>`: Datos del usuario o "Usuario no encontrado"

**Ejemplo:**
```motoko
let userInfo = await actor.getUserInfo();
// Result: #ok({principal = ...; username = "Dr. Smith"; walletAmount = 1000; ...})
```

### Gestión de Papers

#### `submitPaper(title: Text, content: Text) -> Result<Nat, Text>`
Envía un nuevo paper a la plataforma.

**Parámetros:**
- `title`: Título del paper
- `content`: Contenido/abstract del paper

**Retorno:**
- `Result<Nat, Text>`: ID del paper creado o mensaje de error

**Validaciones:**
- ✅ Usuario debe estar registrado
- ✅ Usuario debe tener al menos 100 $INV
- ✅ Título y contenido no pueden estar vacíos

**Ejemplo:**
```motoko
let paperId = await actor.submitPaper(
    "Quantum Computing Applications", 
    "This paper explores..."
);
// Result: #ok(42)  // Nuevo paper con ID 42
```

#### `getAllPapers() -> [Paper]`
Obtiene todos los papers de la plataforma.

**Retorno:**
- `[Paper]`: Array con todos los papers

**Ejemplo:**
```motoko
let papers = await actor.getAllPapers();
// Result: [{id=1; title="Paper 1"; ...}, {id=2; title="Paper 2"; ...}]
```

#### `getPaper(paperId: Nat) -> Result<Paper, Text>`
Obtiene un paper específico por su ID.

**Parámetros:**
- `paperId`: ID del paper a obtener

**Retorno:**
- `Result<Paper, Text>`: Datos del paper o "Paper no encontrado"

#### `getPapersByStatus(status: PaperStatus) -> [Paper]`
Filtra papers por su estado actual.

**Parámetros:**
- `status`: Estado a filtrar (#Proposal, #InProcess, #Approved, #Rejected)

**Retorno:**
- `[Paper]`: Array con papers del estado especificado

**Ejemplo:**
```motoko
let proposals = await actor.getPapersByStatus(#Proposal);
// Result: Papers en estado "Proposal"
```

### Sistema de Votación

#### `votePaper(paperId: Nat, approve: Bool) -> Result<Text, Text>`
Registra un voto en un paper específico.

**Parámetros:**
- `paperId`: ID del paper a votar
- `approve`: true para aprobar, false para rechazar

**Retorno:**
- `Result<Text, Text>`: "Voto registrado exitosamente" o mensaje de error

**Validaciones:**
- ✅ Paper debe existir
- ✅ Usuario no puede votar su propio paper
- ✅ Usuario no puede votar dos veces el mismo paper
- ✅ Usuario debe estar registrado

**Lógica de Estados:**
- **+3 votos netos** → Paper pasa a `#Approved`
- **-3 votos netos** → Paper pasa a `#Rejected`
- **Entre -2 y +2** → Paper permanece en `#InProcess`

**Ejemplo:**
```motoko
let result = await actor.votePaper(42, true);  // Votar aprobar
// Result: #ok("Voto registrado exitosamente")
// Usuario recibe +50 $INV
```

### Estadísticas

#### `getSystemStats() -> {totalPapers: Nat; totalUsers: Nat; approvedPapers: Nat}`
Obtiene estadísticas generales del sistema.

**Retorno:**
- Objeto con métricas del sistema

**Ejemplo:**
```motoko
let stats = await actor.getSystemStats();
// Result: {totalPapers = 125; totalUsers = 45; approvedPapers = 78}
```

## 🔐 Seguridad

### Autenticación
- Todos los métodos `shared(msg)` verifican la identidad del caller
- Uso del Principal de Internet Identity para autenticación

### Autorización
- Solo propietarios pueden realizar ciertas acciones
- Verificación de ownership en operaciones sensibles

### Validaciones de Negocio
1. **Balance checking**: Verificación antes de deducir tokens
2. **Vote uniqueness**: Prevención de votos duplicados
3. **Self-voting prevention**: Usuarios no pueden votar sus propios papers
4. **State consistency**: Estados de papers se actualizan automáticamente

### Gestión de Estado
- Uso de `stable` variables para persistencia entre upgrades
- HashMap eficientes para operaciones de lectura/escritura
- Manejo robusto de errores con `Result` types

## 🧪 Testing

### Métodos de Testing Local

```bash
# Verificar sintaxis Motoko
moc --check src/milo_journal_backend/main.mo

# Desplegar localmente
dfx deploy milo_journal_backend

# Probar métodos específicos
dfx canister call milo_journal_backend registerUser '("Dr. Test")'
dfx canister call milo_journal_backend getUserInfo '()'
dfx canister call milo_journal_backend submitPaper '("Test Paper", "Content")'
dfx canister call milo_journal_backend getAllPapers '()'
dfx canister call milo_journal_backend votePaper '(0, true)'
dfx canister call milo_journal_backend getSystemStats '()'
```

### Casos de Prueba

#### Test 1: Flujo Completo de Usuario
```bash
# 1. Registrar usuario
dfx canister call milo_journal_backend registerUser '("Alice")'

# 2. Verificar balance inicial (1000 tokens)
dfx canister call milo_journal_backend getUserInfo '()'

# 3. Publicar paper (costo: 100 tokens)
dfx canister call milo_journal_backend submitPaper '("AI Paper", "Abstract here")'

# 4. Verificar balance actualizado (900 tokens)
dfx canister call milo_journal_backend getUserInfo '()'
```

#### Test 2: Sistema de Votación
```bash
# Como usuario diferente, votar el paper
dfx identity new bob
dfx identity use bob
dfx canister call milo_journal_backend registerUser '("Bob")'
dfx canister call milo_journal_backend votePaper '(0, true)'

# Verificar que Bob recibió recompensa (+50 tokens)
dfx canister call milo_journal_backend getUserInfo '()'
```

## 📈 Performance

### Complejidad de Operaciones

| Operación | Complejidad | Notas |
|-----------|-------------|-------|
| `registerUser` | O(1) | HashMap lookup + insert |
| `getUserInfo` | O(1) | HashMap lookup |
| `submitPaper` | O(1) | HashMap insert + update |
| `getAllPapers` | O(n) | Itera todos los papers |
| `votePaper` | O(1) | HashMap operations |
| `getPapersByStatus` | O(n) | Filtra todos los papers |

### Optimizaciones
- Uso de HashMap para lookups O(1)
- Lazy evaluation en queries
- Minimización de clonado de datos
- Eficiencia en operaciones de estado

## 🔄 Upgrade Strategy

### Estado Stable
```motoko
private stable var nextPaperId: Nat = 0;
```

### Migración de Datos
- Variables marcadas como `stable` persisten entre upgrades
- HashMap requieren serialización/deserialización manual
- Backup de estado crítico antes de upgrades

## 🚀 Deployment

### Local Development
```bash
dfx start --background
dfx deploy milo_journal_backend
```

### Mainnet Deployment
```bash
dfx deploy --network ic milo_journal_backend
```

### Canister Management
```bash
# Obtener canister ID
dfx canister id milo_journal_backend

# Ver información del canister
dfx canister info milo_journal_backend

# Upgrade canister
dfx deploy milo_journal_backend --mode upgrade
```

## 📊 Monitoreo

### Métricas Importantes
- Número total de usuarios registrados
- Papers publicados por estado
- Volumen de votos por período
- Distribución de tokens en el sistema

### Logs y Debug
```motoko
Debug.print("Registrando usuario: " # username);
```

## 🐛 Troubleshooting

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Usuario ya registrado" | Doble registro | Verificar con `getUserInfo()` |
| "Fondos insuficientes" | Balance < 100 tokens | Votar papers para ganar tokens |
| "Ya has votado en este paper" | Voto duplicado | Un voto por paper por usuario |
| "Paper no encontrado" | ID inválido | Verificar IDs con `getAllPapers()` |

### Debug Tips
1. Usar `Debug.print()` para logging
2. Verificar estado con query methods
3. Revisar argumentos de entrada
4. Confirmar identidad del caller

---

**Milo Journal Backend v1.0.0** - Smart contract en Motoko para publicación académica descentralizada.

*Última actualización: Enero 2025*