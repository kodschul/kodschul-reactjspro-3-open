import Image from "next/image";
import Link from "next/link";

export default function Users() {
  return (
    <main>
      <div>All users:</div>

      <Link href="/users/user1">Open User 1</Link>
      <Link href="/users/user1">Open User 2</Link>
    </main>
  );
}
