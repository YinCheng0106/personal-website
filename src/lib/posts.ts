import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { format } from "date-fns";

const postDirectory = path.join(process.cwd(), "src/contents/posts");

export type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  category: string;
  tags: string[];
  readingTime: string;
  formatDate: string;
  content: string;
};

export function getAllPosts(): Post[] {
  const fileNames = fs.readdirSync(postDirectory);
  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, "");
    const fullPath = path.join(postDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title as string,
      date: data.date as string,
      description: data.description as string,
      category: data.category as string,
      tags: (data.tags as string[]) || [],
      readingTime: readingTime(fileContents).minutes.toFixed(0) + " 分鐘",
      formatDate: format(new Date(data.date), "yyyy-MM-dd"),
      content,
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    description: data.description as string,
    category: data.category as string,
    tags: (data.tags as string[]) || [],
    readingTime: readingTime(fileContents).minutes.toFixed(0) + " 分鐘",
    formatDate: format(new Date(data.date), "yyyy-MM-dd"),
    content,
  };
}
