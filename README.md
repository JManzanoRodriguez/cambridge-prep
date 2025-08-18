# Cambridge Prep App - Ionic Angular

Esta aplicación es una versión de la Cambridge Prep App desarrollada con Ionic y Angular. La aplicación está diseñada para ayudar a los estudiantes a prepararse para los exámenes de Cambridge English, ofreciendo tests diagnósticos, quizzes personalizados, estadísticas detalladas y más.

## Estado del Proyecto

Esta es la versión final del proyecto de migración de React/Next.js a Ionic/Angular. Se han implementado todas las funcionalidades principales, pero hay algunos errores que deben corregirse antes de la implementación en producción.

## Tecnologías utilizadas

- **Ionic Framework**: Framework para el desarrollo de aplicaciones móviles híbridas.
- **Angular**: Framework para el desarrollo de aplicaciones web.
- **Tailwind CSS**: Framework de utilidades CSS para el diseño de interfaces.
- **Angular Material**: Biblioteca de componentes de Material Design para Angular.
- **Chart.js**: Biblioteca para la creación de gráficos y visualizaciones.
- **NgCharts**: Wrapper de Chart.js para Angular.

## Estructura del proyecto

La aplicación sigue una estructura modular, con una clara separación de responsabilidades:

```
src/
├── app/
│   ├── core/                  # Núcleo de la aplicación
│   │   ├── models/            # Interfaces y modelos de datos
│   │   └── services/          # Servicios compartidos
│   ├── pages/                 # Páginas principales
│   │   ├── dashboard/         # Página de inicio
│   │   ├── diagnostic/        # Test diagnóstico
│   │   ├── quiz/              # Quizzes personalizados
│   │   ├── stats/             # Estadísticas y progreso
│   │   └── auth/              # Autenticación y perfil
│   ├── shared/                # Componentes y utilidades compartidas
│   │   ├── components/        # Componentes reutilizables
│   │   ├── directives/        # Directivas personalizadas
│   │   └── pipes/             # Pipes personalizados
│   └── tabs/                  # Estructura de pestañas (generada por Ionic)
└── ...
```

## Funcionalidades principales

1. **Dashboard**: Página principal con acceso a todas las funcionalidades.
2. **Test Diagnóstico**: Evaluación inicial para determinar el nivel del estudiante.
3. **Quizzes Personalizados**: Ejercicios adaptados al nivel y necesidades del estudiante.
4. **Estadísticas**: Visualización del progreso y rendimiento.
5. **Perfil de Usuario**: Gestión de la cuenta y preferencias.
6. **Tema Claro/Oscuro**: Soporte para cambiar entre tema claro y oscuro.

## Decisiones de diseño

### Uso de Ionic con Angular

Se eligió Ionic con Angular para mantener la coherencia con el stack tecnológico de la aplicación original (Next.js/React), pero adaptándolo al ecosistema Angular. Ionic proporciona componentes nativos y una experiencia de usuario consistente en diferentes plataformas.

### Integración de Tailwind CSS

Tailwind CSS se ha integrado para mantener el mismo estilo visual de la aplicación original. Se ha configurado para trabajar junto con los estilos propios de Ionic y Angular Material.

### Angular Material

Se ha utilizado Angular Material para proporcionar componentes de UI consistentes y accesibles, como tarjetas, formularios, pestañas, etc.

### Estructura modular

La aplicación sigue una estructura modular con lazy loading para mejorar el rendimiento y la escalabilidad. Cada página principal es un módulo independiente que se carga bajo demanda.

### Servicios y modelos

Se han creado servicios y modelos para encapsular la lógica de negocio y la comunicación con el backend. Estos servicios son inyectables y siguen el patrón de diseño de servicios de Angular.

## Pasos de instalación

1. **Instalación de dependencias globales**:
   ```bash
   npm install -g @ionic/cli @angular/cli
   ```

2. **Creación del proyecto**:
   ```bash
   ionic start cambridge-prep tabs --type=angular --capacitor
   ```

3. **Instalación de dependencias**:
   ```bash
   npm install tailwindcss postcss autoprefixer chart.js @angular/material @angular/cdk ng2-charts
   ```

4. **Configuración de Tailwind CSS**:
   ```bash
   npx tailwindcss init -p
   ```

5. **Configuración de Angular Material**:
   ```bash
   ng add @angular/material
   ```

6. **Creación de la estructura de carpetas y módulos**:
   ```bash
   mkdir -p src/app/core/models src/app/core/services src/app/shared/components src/app/shared/directives src/app/shared/pipes src/app/pages/dashboard src/app/pages/diagnostic src/app/pages/quiz src/app/pages/stats src/app/pages/auth
   ```

7. **Generación de módulos y componentes**:
   ```bash
   ng g module pages/dashboard --route dashboard --module app.module
   ng g module pages/diagnostic --route diagnostic --module app.module
   ng g module pages/quiz --route quiz --module app.module
   ng g module pages/stats --route stats --module app.module
   ng g module pages/auth --route auth --module app.module
   ```

## Ejecución del proyecto

Para ejecutar el proyecto en modo desarrollo:

```bash
ionic serve
```

## Configuración de Supabase

### 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Copia la URL y la clave anónima de tu proyecto

### 2. Configurar variables de entorno
1. Actualiza `src/environments/environment.ts`:
   ```typescript
   supabase: {
     url: 'https://tu-proyecto.supabase.co',
     anonKey: 'tu-clave-anonima'
   }
   ```

### 3. Deshabilitar confirmación de email (para desarrollo)
1. Ve a tu proyecto en Supabase
2. Ve a **Authentication** → **Settings**
3. Desactiva **"Enable email confirmations"**
4. Guarda los cambios

### 4. Ejecutar migraciones
1. Instala Supabase CLI: `npm install -g supabase`
2. Inicia sesión: `supabase login`
3. Vincula tu proyecto: `supabase link --project-ref tu-project-ref`
4. Ejecuta las migraciones: `supabase db push`

### 5. Configurar Edge Function para IA
1. En tu proyecto de Supabase, ve a "Edge Functions"
2. Crea una nueva función llamada `generate-quiz`
3. Copia el código de `supabase/functions/generate-quiz/index.ts`
4. Configura la variable de entorno `OPENAI_API_KEY` en Supabase

Para compilar para producción:

```bash
ionic build --prod
```

## Funcionalidades implementadas

### ✅ Backend con Supabase
- Autenticación de usuarios
- Base de datos PostgreSQL
- API REST automática
- Edge Functions para IA
- Row Level Security (RLS)

### ✅ Sistema de Quizzes con IA
- Generación de preguntas personalizadas
- Adaptación por nivel (A1-C2)
- Múltiples tipos de ejercicios
- Sistema de cache para optimizar costos

### ✅ Gestión de Usuarios
- Registro y login
- Perfiles de usuario
- Seguimiento de progreso
- Sistema de suscripciones

## Próximos pasos

1. **Integrar Stripe** para pagos y suscripciones
2. **Implementar límites** por tipo de usuario
3. **Crear dashboard de administración**
4. **Añadir más tipos de ejercicios**
5. **Implementar sistema de recomendaciones**

## Estructura de la base de datos

### Tablas principales:
- `users`: Perfiles de usuario extendidos
- `quizzes`: Resultados de quizzes completados  
- `user_progress`: Progreso del usuario por habilidad
- `subscriptions`: Información de suscripciones

### Seguridad:
- Row Level Security (RLS) habilitado
- Políticas que aseguran que los usuarios solo accedan a sus propios datos
- Autenticación JWT manejada por Supabase

## Despliegue en dispositivos móviles

Para añadir soporte para iOS:

```bash
ionic capacitor add ios
```

Para añadir soporte para Android:

```bash
ionic capacitor add android
```

Para compilar y ejecutar en dispositivos:

```bash
ionic capacitor build ios
ionic capacitor build android
```