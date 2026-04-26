# Modul 4: Forms neu gedacht — react-hook-form und zod

> Hinweis: Da das Team derzeit ausschliesslich auf react-hook-form und zod setzt, liegt der Schwerpunkt dieses Moduls auf diesen beiden Werkzeugen. React 19 Actions werden nur kurz eingeordnet, sind aber nicht der Fokus.

---

## Lab 4.1 — Warum klassische Controlled Forms oft Overkill sind

### Das Problem

```tsx
// Jedes Tastenereignis rendert die gesamte Komponente neu
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Ungueltige E-Mail');
      return;
    }
    await login(email, password);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p>{error}</p>}
      <button type="submit">Anmelden</button>
    </form>
  );
}
```

### Erstes Beispiel mit react-hook-form

```tsx
import { useForm } from 'react-hook-form';

type LoginFormData = {
  email: string;
  password: string;
};

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  async function onSubmit(data: LoginFormData) {
    await login(data.email, data.password);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: 'E-Mail ist erforderlich' })} />
      {errors.email && <p>{errors.email.message}</p>}

      <input
        type="password"
        {...register('password', { required: 'Passwort ist erforderlich' })}
      />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Wird angemeldet...' : 'Anmelden'}
      </button>
    </form>
  );
}
```

---

## Lab 4.2 — Validierung mit zod

### zod Grundlagen

```tsx
import { z } from 'zod';

// Primitives
const nameSchema = z.string().min(2, 'Mindestens 2 Zeichen');
const ageSchema  = z.number().min(18, 'Muss volljährig sein');

// Objekt
const userSchema = z.object({
  name:  z.string().min(2),
  email: z.string().email('Ungueltige E-Mail'),
  age:   z.number().min(18),
});

// TypeScript-Typ aus Schema ableiten
type User = z.infer<typeof userSchema>;
```

### Komplexere Validierung

```tsx
const registrationSchema = z.object({
  email: z.string().email('Ungueltige E-Mail'),

  password: z
    .string()
    .min(8, 'Mindestens 8 Zeichen')
    .regex(/[A-Z]/, 'Mindestens ein Grossbuchstabe'),

  confirmPassword: z.string(),

  role: z.enum(['admin', 'editor', 'viewer']),

  website: z.string().url().optional(),

}).refine(
  data => data.password === data.confirmPassword,
  {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  }
);
```

---

## Lab 4.3 — react-hook-form und zod kombinieren

### Installation und Resolver

```bash
npm install react-hook-form zod @hookform/resolvers
```

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email:    z.string().email('Ungueltige E-Mail'),
  password: z.string().min(8, 'Mindestens 8 Zeichen'),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    await login(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}

      <button disabled={isSubmitting}>Anmelden</button>
    </form>
  );
}
```

### Validierungsmodi

| Modus | Wann wird validiert |
|---|---|
| onSubmit | Nur beim Absenden (Standard) |
| onTouched | Wenn ein Feld verlassen wurde |
| onChange | Bei jeder Aenderung |
| onBlur | Beim Verlassen des Feldes |
| all | Bei Aenderung und Verlassen |

```tsx
const {
  register,
  handleSubmit,
  formState: { errors, touchedFields },
} = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onTouched',
});

{touchedFields.email && errors.email && (
  <p>{errors.email.message}</p>
)}
```

### Wiederverwendbare Formularfelder

```tsx
import { useFormContext } from 'react-hook-form';

function FormField({
  name,
  label,
  type = 'text',
}: {
  name: string;
  label: string;
  type?: string;
}) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        {...register(name)}
      />
      {error && <p>{String(error.message)}</p>}
    </div>
  );
}
```

```tsx
function RegistrationForm() {
  const methods = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormField name="email" label="E-Mail" />
        <FormField name="password" label="Passwort" type="password" />
        <FormField name="confirmPassword" label="Passwort bestätigen" type="password" />
        <button type="submit">Registrieren</button>
      </form>
    </FormProvider>
  );
}
```

---

## Lab 4.4 — Optimistic UI

### Optimistic Update Muster mit react-query

```tsx
function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      fetch(`/api/products/${productId}/favorite`, { method: 'POST' }),

    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['product', productId] });

      const previous = queryClient.getQueryData(['product', productId]);

      queryClient.setQueryData(['product', productId], (old: Product) => ({
        ...old,
        isFavorite: !old.isFavorite,
      }));

      return { previous };
    },

    onError: (err, productId, context) => {
      queryClient.setQueryData(['product', productId], context?.previous);
    },

    onSettled: (data, error, productId) => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
}
```

### Wann Optimistic UI sinnvoll ist und wann nicht

```
Sinnvoll wenn:
  Operation hat hohe Erfolgswahrscheinlichkeit (Like, Favorit, einfaches Update)
  Nutzer wuerde sonst auf Netzwerk warten
  Rollback bei Fehler ist visuell akzeptabel

Nicht sinnvoll wenn:
  Operation kann oft fehlschlagen (Bezahlung, Reservierung)
  Konsistenz wichtiger ist als Geschwindigkeit
  Andere Nutzer das Ergebnis sehen muessen
```

---

## Lab 4.5 — Klassisches Formular auf moderne Patterns umbauen

### Typisches Legacy-Formular

```tsx
function ProfileForm({ user }: { user: User }) {
  const [name, setName]       = useState(user.name);
  const [email, setEmail]     = useState(user.email);
  const [nameError, setNameError]   = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (name.length < 2) {
      setNameError('Name zu kurz');
      return;
    }
    if (!email.includes('@')) {
      setEmailError('Ungueltige E-Mail');
      return;
    }

    setLoading(true);
    await updateProfile({ name, email });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      {nameError && <p>{nameError}</p>}
      <input value={email} onChange={e => setEmail(e.target.value)} />
      {emailError && <p>{emailError}</p>}
      <button disabled={loading}>Speichern</button>
    </form>
  );
}
```

### Die modernisierte Version

```tsx
const profileSchema = z.object({
  name:  z.string().min(2, 'Name zu kurz'),
  email: z.string().email('Ungueltige E-Mail'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function ProfileForm({ user }: { user: User }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:  user.name,
      email: user.email,
    },
  });

  async function onSubmit(data: ProfileFormData) {
    await updateProfile(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <p>{errors.name.message}</p>}

      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <button disabled={isSubmitting || !isDirty}>
        {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
      </button>
    </form>
  );
}
```

---

## Kurzer Ausblick: React 19 Form-Hooks

Auch wenn das Team aktuell auf react-hook-form setzt, hier eine kurze Einordnung der React 19 Form-APIs zum gemeinsamen Verständnis:

| Anforderung | React 19 nativ | react-hook-form + zod |
|---|---|---|
| Pending-State im Submit-Button | useFormStatus() | formState.isSubmitting |
| Submit mit Server-Logik | useActionState + form action | handleSubmit(onSubmit) |
| Optimistic Update | useOptimistic() | Manuell oder via react-query |
| Field-Level Validierung | Manuell oder via Library | register + zod Schema |
| Performance bei grossen Formularen | Durchschnittlich (controlled) | Sehr gut (uncontrolled Default) |
| Schema-basierte TS-Typen | Nicht eingebaut | z.infer<typeof schema> |
