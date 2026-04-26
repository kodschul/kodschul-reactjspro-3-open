# Modul 4 — Lösungen

---

## Lösung 4.1 — Klassisches Formular umbauen

### zod-Schema und neue Komponente

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const contactSchema = z.object({
  name:    z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  email:   z.string().email('Ungueltige E-Mail'),
  subject: z.string().min(5, 'Betreff zu kurz'),
  message: z.string().min(10, 'Nachricht zu kurz'),
});

type ContactFormData = z.infer<typeof contactSchema>;

function ContactForm() {
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  // Erfolgs-Hinweis verschwindet sobald der Nutzer wieder tippt
  if (isDirty && submitSuccess) {
    setSubmitSuccess(false);
  }

  async function onSubmit(data: ContactFormData) {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSubmitSuccess(true);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <p>{errors.name.message}</p>}

      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}

      <input {...register('subject')} />
      {errors.subject && <p>{errors.subject.message}</p>}

      <textarea {...register('message')} />
      {errors.message && <p>{errors.message.message}</p>}

      <button disabled={isSubmitting}>
        {isSubmitting ? 'Wird gesendet...' : 'Senden'}
      </button>

      {submitSuccess && <p>Vielen Dank für Ihre Nachricht!</p>}
    </form>
  );
}
```

### Eliminierte States

Vorher: 7 useState-Aufrufe (`name`, `email`, `subject`, `message`, `errors`, `isSubmitting`, `submitSuccess`)
Nachher: 1 useState (`submitSuccess`) plus react-hook-form

Sechs State-Variablen entfallen.

---

## Lösung 4.2 — zod-Schema mit Cross-Field-Validierung

```tsx
import { z } from 'zod';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8, 'Aktuelles Passwort ist erforderlich'),

  newPassword: z
    .string()
    .min(10, 'Mindestens 10 Zeichen')
    .regex(/[A-Z]/, 'Mindestens ein Grossbuchstabe')
    .regex(/[0-9]/, 'Mindestens eine Zahl'),

  confirmNewPassword: z.string(),
})
.refine(
  data => data.newPassword === data.confirmNewPassword,
  {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmNewPassword'],
  }
)
.refine(
  data => data.newPassword !== data.currentPassword,
  {
    message: 'Neues Passwort muss sich vom aktuellen unterscheiden',
    path: ['newPassword'],
  }
);

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
```

### Auf welchem Feld erscheint der Fehler

Die Fehlermeldung "Neues Passwort muss sich vom aktuellen unterscheiden" erscheint am Feld `newPassword` (durch `path: ['newPassword']`).

Begründung: das ist das Feld das der Nutzer ändern muss. Eine Fehlermeldung am `currentPassword` wäre verwirrend, da dieses Feld korrekt ist.

---

## Lösung 4.3 — Wiederverwendbares Form-Field

```tsx
import { useFormContext, FieldValues, Path } from 'react-hook-form';

type FormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  description?: string;
  required?: boolean;
  placeholder?: string;
};

function FormField<T extends FieldValues>({
  name,
  label,
  type = 'text',
  description,
  required = false,
  placeholder,
}: FormFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];

  return (
    <div className="form-field">
      <label htmlFor={String(name)}>
        {label}
        {required && <span aria-label="Pflichtfeld"> *</span>}
      </label>

      {description && <p className="description">{description}</p>}

      <input
        id={String(name)}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${String(name)}-error` : undefined}
        {...register(name, {
          valueAsNumber: type === 'number',
        })}
      />

      {error && (
        <p id={`${String(name)}-error`} role="alert">
          {String(error.message)}
        </p>
      )}
    </div>
  );
}
```

### Beispiel-Formular

```tsx
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email:    z.string().email('Ungueltige E-Mail'),
  password: z.string().min(8, 'Mindestens 8 Zeichen'),
  age:      z.number().min(18, 'Mindestens 18 Jahre'),
});

type FormData = z.infer<typeof schema>;

function RegistrationForm() {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(data => console.log(data))}>
        <FormField<FormData>
          name="email"
          label="E-Mail"
          type="email"
          required
          description="Wir senden Ihnen eine Bestätigungsmail"
        />
        <FormField<FormData>
          name="password"
          label="Passwort"
          type="password"
          required
        />
        <FormField<FormData>
          name="age"
          label="Alter"
          type="number"
          required
        />
        <button type="submit">Registrieren</button>
      </form>
    </FormProvider>
  );
}
```

### Erweiterung für select/textarea

Drei Möglichkeiten:

1. **Polymorphe Komponente** mit einem `as`-Prop
2. **Eigene Komponenten**: `FormField`, `FormSelect`, `FormTextarea`
3. **Render-Prop-Variante**: das Input-Element wird als children übergeben

Für Wartbarkeit ist Variante 2 meist am übersichtlichsten.

```tsx
function FormSelect<T extends FieldValues>({
  name,
  label,
  options,
}: {
  name: Path<T>;
  label: string;
  options: { value: string; label: string }[];
}) {
  const { register, formState: { errors } } = useFormContext<T>();
  const error = errors[name];

  return (
    <div>
      <label htmlFor={String(name)}>{label}</label>
      <select id={String(name)} {...register(name)}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p role="alert">{String(error.message)}</p>}
    </div>
  );
}
```

---

## Lösung 4.4 — Optimistic UI mit Rollback

```tsx
function LikeButton({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const { data: post } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetch(`/api/posts/${postId}`).then(r => r.json()),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      fetch(`/api/posts/${postId}/like`, { method: 'POST' }).then(r => {
        if (!r.ok) throw new Error('Fehler beim Liken');
        return r.json();
      }),

    onMutate: async () => {
      // Laufende Refetches abbrechen
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      // Vorigen Wert sichern fuer Rollback
      const previousPost = queryClient.getQueryData<Post>(['post', postId]);

      // Optimistisch updaten
      queryClient.setQueryData<Post>(['post', postId], old => {
        if (!old) return old;
        return {
          ...old,
          isLiked: !old.isLiked,
          likeCount: old.isLiked ? old.likeCount - 1 : old.likeCount + 1,
        };
      });

      return { previousPost };
    },

    onError: (err, _vars, context) => {
      // Rollback auf den vorherigen Stand
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
    },

    onSettled: () => {
      // Mit Server abgleichen
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  if (!post) return null;

  return (
    <button onClick={() => mutate()} disabled={isPending}>
      {post.isLiked ? '♥' : '♡'} {post.likeCount}
    </button>
  );
}
```

### Doppelklick während laufender Anfrage

Mit `disabled={isPending}` ist ein Doppelklick verhindert, solange die Mutation läuft. Falls man den Button ohne Disabled-State anbieten will (für noch flüssigere UX), würde jedes Klicken eine neue Mutation auslösen — die mehrfache Updates auf den optimistischen Cache würden sich gegenseitig rückgängig machen, was zu Flackern führt.

### Eignet sich Optimistic UI hier?

Ja. Das Liken eines Posts ist:
- Schnell und mit hoher Erfolgswahrscheinlichkeit
- Keine kritische Operation (keine Bezahlung, keine Reservierung)
- Nutzer erwartet sofortige Reaktion
- Rollback bei Fehler ist visuell akzeptabel

Optimistic UI ist hier ein klarer Gewinn.

---

## Lösung 4.5 — Mehrstufiges Formular

### Schemas

```tsx
const accountSchema = z.object({
  email:    z.string().email('Ungueltige E-Mail'),
  password: z.string().min(10, 'Mindestens 10 Zeichen'),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirm'],
});

const personalSchema = z.object({
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName:  z.string().min(1, 'Nachname ist erforderlich'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
});

const addressSchema = z.object({
  street:     z.string().min(1, 'Strasse ist erforderlich'),
  houseNumber:z.string().min(1, 'Hausnummer ist erforderlich'),
  zipCode:    z.string().regex(/^\d{5}$/, 'Genau 5 Ziffern'),
  city:       z.string().min(1, 'Ort ist erforderlich'),
});

// Gesamtschema fuer den finalen Submit
const fullSchema = accountSchema.innerType()
  .merge(personalSchema)
  .merge(addressSchema);

type AccountData  = z.infer<typeof accountSchema>;
type PersonalData = z.infer<typeof personalSchema>;
type AddressData  = z.infer<typeof addressSchema>;
type FullData     = AccountData & PersonalData & AddressData;
```

### Implementierung

```tsx
type Step = 1 | 2 | 3;

function RegistrationWizard() {
  const [step, setStep] = useState<Step>(1);
  // Daten werden in der Wizard-Komponente gehalten — bleiben bei Navigation erhalten
  const [data, setData] = useState<Partial<FullData>>({});

  function handleAccountSubmit(values: AccountData) {
    setData(d => ({ ...d, ...values }));
    setStep(2);
  }

  function handlePersonalSubmit(values: PersonalData) {
    setData(d => ({ ...d, ...values }));
    setStep(3);
  }

  async function handleAddressSubmit(values: AddressData) {
    const fullData = { ...data, ...values } as FullData;
    await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(fullData),
    });
  }

  return (
    <div>
      <ProgressIndicator step={step} />
      {step === 1 && (
        <AccountStep
          defaultValues={data}
          onSubmit={handleAccountSubmit}
        />
      )}
      {step === 2 && (
        <PersonalStep
          defaultValues={data}
          onSubmit={handlePersonalSubmit}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <AddressStep
          defaultValues={data}
          onSubmit={handleAddressSubmit}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  );
}

function AccountStep({
  defaultValues,
  onSubmit,
}: {
  defaultValues: Partial<AccountData>;
  onSubmit: (data: AccountData) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<AccountData>({
    resolver: zodResolver(accountSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="E-Mail" />
      {errors.email && <p>{errors.email.message}</p>}

      <input {...register('password')} type="password" placeholder="Passwort" />
      {errors.password && <p>{errors.password.message}</p>}

      <input {...register('confirm')} type="password" placeholder="Wiederholen" />
      {errors.confirm && <p>{errors.confirm.message}</p>}

      <button type="submit">Weiter</button>
    </form>
  );
}

// PersonalStep und AddressStep analog, mit zusätzlichem Back-Button
```

### Wo lebt der State der eingegebenen Daten

Im `RegistrationWizard`. Damit:
- bleiben die Daten erhalten wenn der Nutzer zurück navigiert
- ist der Daten-Lebenszyklus klar definiert (gleicht der Wizard-Lebensdauer)
- können einzelne Schritte ihre `defaultValues` vom Wizard erhalten

### Wie verhindern dass jemand Schritt 3 überspringen kann

Durch das State-basierte Routing: `step` ist der einzige Weg um zu Schritt 3 zu gelangen, und `setStep(3)` wird nur nach erfolgreichem `handlePersonalSubmit` aufgerufen. Jemand kann nicht direkt zu Schritt 3 springen.

Falls die Wizard-Schritte URL-basiert wären (`/register/step-3`), müsste man zusätzlich prüfen ob die vorherigen Schritte abgeschlossen sind und ggf. zu Schritt 1 weiterleiten.
