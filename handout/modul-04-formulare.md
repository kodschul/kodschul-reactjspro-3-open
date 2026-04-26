# Modul 4: Formulare mit React Hook Form und Zod

---

## Lab 4.1 — Form-Architektur verstehen

### Das Problem mit klassischen Controlled Forms

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

### Erstes Beispiel mit React Hook Form

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

## Lab 4.2 — Validierung mit Zod

### Zod Grundlagen

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
// entspricht: { name: string; email: string; age: number }
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

## Lab 4.3 — React Hook Form und Zod kombinieren

### Installation und Resolver

```bash
npm install @hookform/resolvers
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

### Fehlerzustände sinnvoll gestalten

```tsx
const {
  register,
  handleSubmit,
  formState: { errors, touchedFields },
} = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onTouched', // validiert erst wenn das Feld verlassen wurde
});

// Fehler nur anzeigen wenn das Feld beruehrt wurde
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

## Lab 4.4 — Bestehende Formulare modernisieren

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
