import { Helmet } from "react-helmet-async";

interface MetaTagHelmetProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export const MetaTagHelmet = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
}: MetaTagHelmetProps) => {
  return (
    <Helmet>
      <title>{`URJOB - ${title}`}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`URJOB - ${ogTitle || title}`} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:image" content={ogImage || "/img/logo.png"} />
    </Helmet>
  );
};
