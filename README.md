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

Para compilar para producción:

```bash
ionic build --prod
```

## Problemas conocidos y soluciones

Durante la migración se han identificado los siguientes problemas que deben corregirse:

1. **Errores de importación de módulos**:
   - Problema: Algunos componentes están marcados como standalone pero se declaran en módulos.
   - Solución: Actualizar los módulos para importar los componentes standalone en lugar de declararlos.

2. **Errores de TypeScript**:
   - Problema: Propiedades sin inicializar y errores de tipado.
   - Solución: Añadir inicializadores o usar el operador de aserción no nula (!) para las propiedades.

3. **Errores de directivas**:
   - Problema: Uso de directivas como *ngIf y *ngFor sin importar CommonModule.
   - Solución: Importar CommonModule en los módulos correspondientes o añadir las directivas a los imports de los componentes standalone.

4. **Errores de bibliotecas**:
   - Problema: Importaciones incorrectas de jwt-decode y ng2-charts.
   - Solución: Actualizar las importaciones según la documentación de las bibliotecas.

Para corregir estos problemas:

1. Actualizar las importaciones de jwt-decode:
   ```typescript
   import { jwtDecode } from 'jwt-decode';
   ```

2. Actualizar las importaciones de ng2-charts:
   ```typescript
   import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
   ```

3. Añadir CommonModule a los módulos:
   ```typescript
   import { CommonModule } from '@angular/common';
   
   @NgModule({
     imports: [
       CommonModule,
       // otros imports
     ],
     // ...
   })
   ```

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
