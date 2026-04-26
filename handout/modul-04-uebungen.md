# Modul 4 — Übungen

> Aufgabe für alle Übungen: Klassisches Formular auf moderne Patterns umbauen (react-hook-form + zod)

---

## Übung 4.1 — Klassisches Formular umbauen

### Ausgangslage

```tsx
function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  function validate() {
    const newErrors: Record<string, string> = {};
    if (name.length < 2) newErrors.name = 'Name muss mindestens 2 Zeichen haben';
    if (!email.includes('@')) newErrors.email = 'Ungueltige E-Mail';
    if (subject.length < 5) newErrors.subject = 'Betreff zu kurz';
    if (message.length < 10) newErrors.message = 'Nachricht zu kurz';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      {errors.name && <p>{errors.name}</p>}

      <input value={email} onChange={e => setEmail(e.target.value)} />
      {errors.email && <p>{errors.email}</p>}

      <input value={subject} onChange={e => setSubject(e.target.value)} />
      {errors.subject && <p>{errors.subject}</p>}

      <textarea value={message} onChange={e => setMessage(e.target.value)} />
      {errors.message && <p>{errors.message}</p>}

      <button disabled={isSubmitting}>
        {isSubmitting ? 'Wird gesendet...' : 'Senden'}
      </button>

      {submitSuccess && <p>Vielen Dank für Ihre Nachricht!</p>}
    </form>
  );
}
```

### Aufgaben

1. Definiere ein zod-Schema für die vier Felder
2. Schreibe die Komponente mit react-hook-form um
3. Wie viele State-Variablen kannst du eliminieren?
4. Sorge dafür dass der Erfolgs-Hinweis auch wieder verschwindet wenn der Nutzer das Formular erneut bearbeitet

---

## Übung 4.2 — zod-Schema mit Cross-Field-Validierung

### Aufgabe

Baue ein zod-Schema für ein Passwort-Ändern-Formular mit folgenden Anforderungen:

- `currentPassword`: Pflichtfeld, mindestens 8 Zeichen
- `newPassword`: Pflichtfeld, mindestens 10 Zeichen, mindestens ein Großbuchstabe, mindestens eine Zahl
- `confirmNewPassword`: muss mit `newPassword` übereinstimmen
- `newPassword` darf nicht identisch mit `currentPassword` sein

### Aufgaben

1. Erstelle das Schema mit allen Validierungen inklusive der zwei Cross-Field-Regeln
2. Leite den TypeScript-Typ aus dem Schema ab
3. Welche Fehlermeldung zeigst du an wenn `newPassword === currentPassword`?
4. Auf welchem Feld erscheint dieser Fehler — und warum?

---

## Übung 4.3 — Wiederverwendbares Form-Field bauen

### Aufgabe

Im Team werden Formulare immer ähnlich aufgebaut: Label, Input, Fehlermeldung. Baue eine wiederverwendbare `FormField`-Komponente, die mit `FormProvider` aus react-hook-form zusammenarbeitet.

Anforderungen:

- Funktioniert mit verschiedenen Input-Typen (text, email, password, number)
- Zeigt automatisch das Label, das Input-Element und ggf. die Fehlermeldung
- Übernimmt automatisch `register()` und Error-Lookup
- Optional: Beschreibungstext unter dem Label
- Optional: Pflichtfeld-Indikator (`*`)

### Aufgaben

1. Implementiere die `FormField`-Komponente
2. Schreibe ein Beispiel-Formular das die Komponente dreimal verwendet
3. Wie würdest du die Komponente erweitern für `<select>` oder `<textarea>`?

---

## Übung 4.4 — Optimistic UI mit Rollback

### Ausgangslage

Eine Like-Funktion auf einem Beitrag. Aktuell wartet die UI auf die Server-Antwort.

```tsx
function LikeButton({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const { data: post } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetch(`/api/posts/${postId}`).then(r => r.json()),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      fetch(`/api/posts/${postId}/like`, { method: 'POST' }),
    onSuccess: () => {
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

### Aufgaben

1. Baue Optimistic Updates ein: der Like-Button reagiert sofort
2. Implementiere ein korrektes Rollback bei Fehlern
3. Was passiert wenn der Nutzer doppelt klickt während die Anfrage läuft?
4. Wäre Optimistic UI hier eine gute Wahl? Begründe.

---

## Übung 4.5 — Mehrstufiges Formular

### Aufgabe

Baue ein mehrstufiges Registrierungsformular mit drei Schritten:

1. **Schritt 1**: Account-Daten (E-Mail, Passwort, Passwort-Bestätigung)
2. **Schritt 2**: Persönliche Daten (Vorname, Nachname, Geburtsdatum)
3. **Schritt 3**: Adresse (Straße, Hausnummer, PLZ, Ort)

Anforderungen:

- Jeder Schritt hat seine eigene zod-Validierung
- Der Nutzer kann zurück zum vorherigen Schritt navigieren ohne Datenverlust
- Bei "Zurück" sollen die bereits eingegebenen Daten erhalten bleiben
- Erst beim letzten Schritt werden alle Daten zusammen abgeschickt

### Aufgaben

1. Definiere die zod-Schemas für jeden Schritt und ein finales Gesamt-Schema
2. Implementiere die Navigation zwischen den Schritten
3. Wo lebt der State der bereits eingegebenen Daten?
4. Wie verhindert man dass jemand Schritt 3 ausfüllt ohne Schritt 1 und 2?
