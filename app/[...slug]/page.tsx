import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Article } from "@/components/drupal/Article"
import { BasicPage } from "@/components/drupal/BasicPage"
import { drupal } from "@/lib/drupal"
import type { Metadata, ResolvingMetadata } from "next"
import type { DrupalNode, JsonApiParams } from "next-drupal"

async function getNode(slug: string[]) {
  const path = `/${slug.join("/")}`

  const params: JsonApiParams = {}

  const translatedPath = await drupal.translatePath(path)

  if (!translatedPath) {
    throw new Error("Resource not found", { cause: "NotFound" })
  }

  const type = translatedPath.jsonapi?.resourceName!
  const uuid = translatedPath.entity.uuid
  const entityId = translatedPath.entity.id

  if (type === "node--article") {
    params.include = "field_image,uid"
  }

  const resource = await drupal.getResource<DrupalNode>(type, uuid, {
    params,
    next: { tags: [`node:${entityId}`, type] },
  })

  if (!resource) {
    throw new Error(
      `Failed to fetch resource: ${translatedPath?.jsonapi?.individual}`,
      {
        cause: "DrupalError",
      }
    )
  }

  return resource
}

type NodePageParams = {
  slug: string[]
}
type NodePageProps = {
  params: Promise<NodePageParams>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  props: NodePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params

  const { slug } = params

  let node
  try {
    node = await getNode(slug)
  } catch (e) {
    return {}
  }

  return {
    title: node.title,
  }
}

const RESOURCE_TYPES = ["node--page", "node--article"]

export async function generateStaticParams(): Promise<NodePageParams[]> {
  try {
    const resources = await drupal.getResourceCollectionPathSegments(
      RESOURCE_TYPES,
      {}
    )

    return resources.map((resource) => {
      return {
        slug: resource.segments,
      }
    })
  } catch (error) {
    console.error("Failed to fetch static params:", error)
    return []
  }
}

async function NodeContent({ slug }: { slug: string[] }) {
  let node
  try {
    node = await getNode(slug)
  } catch (error) {
    notFound()
  }

  if (node?.status === false) {
    notFound()
  }

  return (
    <>
      {node.type === "node--page" && <BasicPage node={node} />}
      {node.type === "node--article" && <Article node={node} />}
    </>
  )
}

export default async function NodePage(props: NodePageProps) {
  const params = await props.params
  const { slug } = params

  return (
    <Suspense>
      <NodeContent slug={slug} />
    </Suspense>
  )
}
