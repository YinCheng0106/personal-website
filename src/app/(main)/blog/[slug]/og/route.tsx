import { OgFrameBlog, getOgImageResponse } from "@/lib/og";
import { getPostBySlug } from "@/lib/posts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return new Response("Not Found", { status: 404 });
  }

  const titleSize =
    post.title.length > 18 ? 60 : post.title.length > 12 ? 76 : 92;

  const imageResponse = await getOgImageResponse();
  return imageResponse(
    <OgFrameBlog
      url={`yincheng.app/blog/${slug}`}
      title={post.title}
      description={post.description}
      date={post.formatDate}
      readingTime={post.readingTime}
      titleSize={titleSize}
    />,
  );
}
