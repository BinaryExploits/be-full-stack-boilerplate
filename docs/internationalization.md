# Internationalization (i18n)

This boilerplate uses **typesafe-i18n** for type-safe, runtime-safe internationalization. English and Dutch translations are included out of the box.

---

## Table of Contents

- [Overview](#overview)
- [Built-in Languages](#built-in-languages)
- [Language Switcher](#language-switcher)
- [Adding New Languages](#adding-new-languages)
- [Adding Translation Keys](#adding-translation-keys)
- [Usage in Components](#usage-in-components)
- [Configuration](#configuration)
- [Best Practices](#best-practices)

---

## Overview

### What is typesafe-i18n?

typesafe-i18n is a fully type-safe internationalization library that:

- **Generates TypeScript types** from your translations
- **Catches missing translations** at compile time
- **Provides autocomplete** for translation keys in your IDE
- **Validates translation arguments** (e.g., `{count}` variables)
- **Zero runtime overhead** with tree-shaking support

### Why Type-Safe i18n?

Traditional i18n libraries use string keys that can break silently:

```typescript
// Traditional i18n (not type-safe)
t('user.greeting', { name: 'John' }); // Typo? Missing key? No error!
```

With typesafe-i18n, you get compile-time safety:

```typescript
// typesafe-i18n (fully type-safe)
LL.User.greeting({ name: 'John' }); // Autocomplete + type checking!
```

---

## Built-in Languages

The boilerplate includes two languages:

### English (en) - Base Language

Located at: `apps/web/i18n/en/index.ts`

This is the **base locale** that all other translations reference. All translation keys must exist in the English file.

### Dutch (nl) - Translation

Located at: `apps/web/i18n/nl/index.ts`

Dutch translations that mirror the English structure.

---

## Language Switcher

The language switcher is located in the navigation bar and allows users to change languages on the fly.

### How It Works

1. User clicks the language switcher
2. Selected locale is stored in browser localStorage
3. UI updates immediately without page reload
4. Preference persists across sessions

### Implementation

The language switcher is built into the navigation component:

```typescript
// Simplified example
import { setLocale } from '@/i18n/i18n-util';

function LanguageSwitcher() {
  const changeLanguage = (locale: 'en' | 'nl') => {
    setLocale(locale);
    // UI updates automatically
  };

  return (
    <select onChange={(e) => changeLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="nl">Nederlands</option>
    </select>
  );
}
```

---

## Adding New Languages

### Step 1: Create Locale File

Create a new file in `apps/web/i18n/[locale]/index.ts`:

```bash
# Example: Adding French
mkdir -p apps/web/i18n/fr
touch apps/web/i18n/fr/index.ts
```

### Step 2: Add Translations

Copy the structure from `en/index.ts` and translate:

```typescript
// apps/web/i18n/fr/index.ts
import type { Translation } from "../i18n-types";

const fr = {
  Common: {
    loading: "Chargement...",
    backToHome: "Retour à l'accueil",
    back: "Retour",
    cancel: "Annuler",
    save: "Enregistrer",
    // ... all other keys
  },
  Navigation: {
    fullStack: "Full Stack",
    profileAndSecurity: "Profil & Sécurité",
    // ... all other keys
  },
  // ... all other sections
} satisfies Translation;

export default fr;
```

**Important**: You must include **all keys** from the base English translation. Missing keys will cause TypeScript errors.

### Step 3: Generate Types

Run the type generator:

```bash
cd apps/web
pnpm i18n:generate
```

This command:
- Scans all locale files
- Generates TypeScript types
- Creates type-safe utilities
- Validates all translations

### Step 4: Add to Language Switcher

Update the language switcher to include the new locale:

```typescript
<select onChange={(e) => changeLanguage(e.target.value)}>
  <option value="en">English</option>
  <option value="nl">Nederlands</option>
  <option value="fr">Français</option>
</select>
```

---

## Adding Translation Keys

### Step 1: Add to Base Locale (English)

Edit `apps/web/i18n/en/index.ts`:

```typescript
const en = {
  Common: {
    loading: "Loading...",
    // Add your new key
    newFeature: "New Feature",
  },
  // Or add a new section
  Dashboard: {
    title: "Dashboard",
    subtitle: "Welcome to your dashboard",
  },
} satisfies BaseTranslation;
```

### Step 2: Add to Other Locales

Update all other locale files with translations:

```typescript
// apps/web/i18n/nl/index.ts
const nl = {
  Common: {
    loading: "Laden...",
    newFeature: "Nieuwe Functie", // Dutch translation
  },
  Dashboard: {
    title: "Dashboard",
    subtitle: "Welkom bij je dashboard",
  },
} satisfies Translation;
```

### Step 3: Regenerate Types

```bash
cd apps/web
pnpm i18n:generate
```

### Step 4: Use in Components

```typescript
import { LL } from '@/i18n/i18n-react';

function MyComponent() {
  return (
    <div>
      <h1>{LL.Dashboard.title()}</h1>
      <p>{LL.Dashboard.subtitle()}</p>
    </div>
  );
}
```

---

## Usage in Components

### Basic Translation

```typescript
import { LL } from '@/i18n/i18n-react';

function Greeting() {
  return <h1>{LL.Home.title()}</h1>;
}
```

### Translation with Variables

Define translation with placeholders:

```typescript
// apps/web/i18n/en/index.ts
const en = {
  User: {
    greeting: "Hello, {name:string}!",
    itemCount: "You have {count:number} {{item|items}}",
  },
}
```

Use with variables:

```typescript
import { LL } from '@/i18n/i18n-react';

function UserGreeting({ name, itemCount }) {
  return (
    <div>
      <h1>{LL.User.greeting({ name })}</h1>
      <p>{LL.User.itemCount({ count: itemCount })}</p>
    </div>
  );
}
```

### Pluralization

typesafe-i18n supports automatic pluralization:

```typescript
// Translation
itemCount: "{count:number} {{item|items}}"

// Usage
LL.User.itemCount({ count: 1 })  // "1 item"
LL.User.itemCount({ count: 5 })  // "5 items"
```

### Conditional Text

```typescript
// Translation
status: "{isActive:boolean|Active|Inactive}"

// Usage
LL.User.status({ isActive: true })   // "Active"
LL.User.status({ isActive: false })  // "Inactive"
```

### Nested Translations

```typescript
const en = {
  Settings: {
    Profile: {
      title: "Profile Settings",
      subtitle: "Manage your profile",
    },
  },
}

// Usage
LL.Settings.Profile.title()
```

---

## Configuration

### typesafe-i18n Configuration

Located at: `apps/web/.typesafe-i18n.json`

```json
{
  "$schema": "https://unpkg.com/typesafe-i18n@5.27.1/schema/typesafe-i18n.json",
  "baseLocale": "en",
  "outputPath": "./i18n/",
  "outputFormat": "TypeScript",
  "generateOnlyTypes": false,
  "adapter": "react"
}
```

**Key Settings**:
- `baseLocale`: "en" - English is the base locale
- `outputPath`: "./i18n/" - Generated types location
- `adapter`: "react" - React-specific utilities

### Updating Configuration

After changing configuration, regenerate types:

```bash
cd apps/web
pnpm i18n:generate
```

---

## Best Practices

### 1. Always Use Type-Safe Access

✅ **Good**:
```typescript
LL.Common.loading()
```

❌ **Bad**:
```typescript
t('common.loading') // Not type-safe!
```

### 2. Keep Translation Keys Organized

Group related translations:

```typescript
const en = {
  Auth: {
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
  },
  Dashboard: {
    title: "Dashboard",
    // ...
  },
}
```

### 3. Use Descriptive Key Names

✅ **Good**:
```typescript
Auth: {
  emailPlaceholder: "Enter your email",
  passwordPlaceholder: "Enter your password",
}
```

❌ **Bad**:
```typescript
Auth: {
  input1: "Enter your email",
  input2: "Enter your password",
}
```

### 4. Keep Translations Short and Contextual

Avoid very long translations in the translation files. For long content (like privacy policies), consider:
- Markdown files
- CMS integration
- Separate content management

### 5. Test All Locales

When adding new features:
1. Add English translation first
2. Add translations for all other locales
3. Run `pnpm i18n:generate` to catch missing keys
4. Test UI in all languages

### 6. Use Variables for Dynamic Content

✅ **Good**:
```typescript
greeting: "Hello, {name:string}!"
```

❌ **Bad**:
```typescript
// Don't concatenate strings
const greeting = LL.Common.hello() + ', ' + name + '!';
```

### 7. Avoid Hardcoded Strings

Always use translations, even for labels:

✅ **Good**:
```typescript
<button>{LL.Common.save()}</button>
```

❌ **Bad**:
```typescript
<button>Save</button>
```

---

## Troubleshooting

### TypeScript Errors After Adding Translations

**Cause**: Types haven't been regenerated.

**Solution**: Run the type generator:
```bash
cd apps/web
pnpm i18n:generate
```

### Missing Translation Keys

**Cause**: A key exists in English but not in other locales.

**Solution**: TypeScript will show an error. Add the missing key to all locale files.

### Translation Not Updating

**Cause**: Browser cache or dev server cache.

**Solution**:
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Restart dev server
3. Clear `.next` cache: `rm -rf apps/web/.next`

### "Cannot find module '@/i18n/i18n-react'"

**Cause**: Types haven't been generated yet.

**Solution**:
```bash
cd apps/web
pnpm i18n:generate
```

---

## Advanced Usage

### Server-Side Rendering (SSR)

For server components in Next.js:

```typescript
import { loadLocale } from '@/i18n/i18n-util.sync';
import { i18n } from '@/i18n/i18n-util';

export default function Page({ locale = 'en' }) {
  loadLocale(locale);
  const LL = i18n()[locale];

  return <h1>{LL.Home.title()}</h1>;
}
```

### Detecting User's Preferred Language

Automatically detect user's browser language:

```typescript
import { detectLocale } from '@/i18n/i18n-util';

const userLocale = detectLocale(() => {
  return navigator.languages;
});

setLocale(userLocale);
```

### Formatting Dates and Numbers

Define custom formatters in `apps/web/i18n/formatters.ts`:

```typescript
export const formatters = {
  date: (value: Date) => {
    return new Intl.DateTimeFormat('en-US').format(value);
  },
  currency: (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  },
};
```

---

## Mobile App (Expo)

The mobile app can use the same translation system:

1. Copy translation files to `apps/mobile/i18n/`
2. Install typesafe-i18n for React Native
3. Generate types: `pnpm i18n:generate`
4. Use the same `LL` utilities

Currently, the mobile app does not have i18n configured. You can add it following the same pattern as the web app.

---

## Related Documentation

- [Multi-Tenancy →](multi-tenancy.md)
- [Authentication →](authentication.md)
- [GDPR Compliance →](gdpr-compliance.md)
