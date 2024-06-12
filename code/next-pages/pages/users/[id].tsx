import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";

export default function User() {
  const router = useRouter();

  return (
    <main>
      <div>
        Welcome user: <b>{router.query?.id}</b>
      </div>
    </main>
  );
}
