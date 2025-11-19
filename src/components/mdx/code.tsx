import { codeToHtml } from "shiki";

type CodeProps = React.ComponentProps<"code">;

export async function Code({ children, className, ...props }: CodeProps) {
  const hasLang = className && className.includes("language-");

  if (!hasLang) {
    return (
      <code
        className="rounded bg-accent px-1.5 py-0.5"
        {...props}
      >
        {children}
      </code>
    );
  }

  const lang = className ? className.replace("language-", "") : "text";
  const codeString = String(children).trim();

  const html = await codeToHtml(codeString, {
    lang,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    structure: "inline",
    defaultColor: "light-dark()",
    cssVariablePrefix: "--shiki-",
  });

  return <code className="overflow-x-scroll" dangerouslySetInnerHTML={{ __html: html }} {...props} />;
}
