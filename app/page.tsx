import { Link } from "@/components/navigation/Link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  description: "A Next.js site powered by a Drupal backend.",
}

export default function Home() {
  return (
    <div className="py-10">
      <h1 className="mb-6 text-6xl font-black">Next.js for Drupal</h1>
      <p className="mb-10 text-xl text-gray-600">
        A headless Drupal site built with Next.js, hosted on Pantheon.
      </p>
      <Link
        href="/blog"
        className="inline-block px-8 py-4 text-lg font-semibold text-white no-underline bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Read the Blog
      </Link>
    </div>
  )
}
