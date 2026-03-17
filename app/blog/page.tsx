import { Suspense } from "react"
import { ArticleTeaser } from "@/components/drupal/ArticleTeaser"
import { drupal } from "@/lib/drupal"
import type { Metadata } from "next"
import type { DrupalNode } from "next-drupal"

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest articles from our Drupal-powered blog.",
}

async function BlogContent() {
  let nodes: DrupalNode[] = []
  try {
    nodes = await drupal.getResourceCollection<DrupalNode[]>(
      "node--article",
      {
        params: {
          "filter[status]": 1,
          "fields[node--article]": "title,path,field_image,uid,created,body",
          include: "field_image,uid",
          sort: "-created",
        },
        next: { tags: ["node_list:article"] },
      }
    )
  } catch (error) {
    console.error("Failed to fetch articles:", error)
  }

  return (
    <>
      {nodes?.length ? (
        nodes.map((node) => (
          <div key={node.id}>
            <ArticleTeaser node={node} />
            <hr className="my-20" />
          </div>
        ))
      ) : (
        <p className="py-4">No articles found</p>
      )}
    </>
  )
}

export default function BlogPage() {
  return (
    <>
      <h1 className="mb-10 text-6xl font-black">Latest Articles.</h1>
      <Suspense>
        <BlogContent />
      </Suspense>
    </>
  )
}
