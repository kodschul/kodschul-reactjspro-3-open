import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Zu kurz"),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string[]>>;

export default function Form() {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const result = schema.safeParse(data);

    if (!result.success) {
      const fieldErrors = z.treeifyError(result.error).fieldErrors;
      setErrors(fieldErrors);
    } else {
      console.log("Valid data:", result.data);
      setErrors({});
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email" />
      {errors.email && <p>{errors.email[0]}</p>}

      <input name="password" type="password" />
      {errors.password && <p>{errors.password[0]}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
